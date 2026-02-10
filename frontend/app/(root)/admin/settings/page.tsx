'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Shield, ShieldOff, Search, AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface User {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string | null;
  loginCount: number;
}

interface ConfirmModal {
  isOpen: boolean;
  title: string;
  message: string;
  action: 'delete' | 'toggleAdmin' | null;
  userId: number | null;
  username: string;
  isAdmin?: boolean;
  loading?: boolean;
}

export default function AdminSettings() {
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    userId: null,
    username: '',
    loading: false,
  });

  // New user form state
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/sign-in');
        return;
      }

      const response = await fetch(api.admin.users(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
        setTimeout(() => router.push('/'), 3000);
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load users');
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.email || !newUser.username || !newUser.password) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    if (newUser.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setCreatingUser(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(api.admin.users(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setMessage({ type: 'success', text: `✓ User "${newUser.username}" created successfully` });
      setNewUser({ email: '', username: '', password: '' });
      setShowNewUserForm(false);
      setTimeout(() => {
        fetchUsers();
        setMessage(null);
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setMessage({ type: 'error', text: `✗ ${errorMessage}` });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = (userId: number, username: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete user "${username}"? This action cannot be undone. All related data will also be deleted.`,
      action: 'delete',
      userId,
      username,
      loading: false,
    });
  };

  const handleToggleAdmin = (userId: number, currentStatus: boolean, username: string) => {
    setConfirmModal({
      isOpen: true,
      title: currentStatus ? 'Demote from Admin' : 'Promote to Admin',
      message: `Are you sure you want to ${currentStatus ? 'demote' : 'promote'} "${username}" ${currentStatus ? 'from' : 'to'} admin privileges?`,
      action: 'toggleAdmin',
      userId,
      username,
      isAdmin: !currentStatus,
      loading: false,
    });
  };

  const confirmAction = async () => {
    const { action, userId } = confirmModal;

    if (!userId) return;

    setConfirmModal(prev => ({ ...prev, loading: true }));

    try {
      const token = localStorage.getItem('token');

      if (action === 'delete') {
        const response = await fetch(`${api.admin.users()}/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete user');

        setMessage({ type: 'success', text: `✓ User "${confirmModal.username}" deleted successfully` });
        setUsers(users.filter(u => u.id !== userId));
      } else if (action === 'toggleAdmin') {
        const response = await fetch(`${api.admin.users()}/${userId}/admin-status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isAdmin: confirmModal.isAdmin })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update admin status');

        setMessage({
          type: 'success',
          text: `✓ User "${confirmModal.username}" ${confirmModal.isAdmin ? 'promoted to admin' : 'demoted from admin'}`
        });

        setUsers(users.map(u =>
          u.id === userId ? { ...u, isAdmin: confirmModal.isAdmin || false } : u
        ));
      }

      setConfirmModal({ isOpen: false, title: '', message: '', action: null, userId: null, username: '', loading: false });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      setMessage({ type: 'error', text: `✗ ${errorMessage}` });
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  const cancelAction = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', action: null, userId: null, username: '', loading: false });
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <p className="text-gray-400">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-linear-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent mb-2">
            Admin Settings
          </h1>
          <p className="text-gray-400">Manage users, permissions, and system settings</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/20 border-green-500/50 text-green-400'
              : 'bg-red-500/20 border-red-500/50 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-cyan-400 mt-2">{users.length}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Admin Users</p>
            <p className="text-3xl font-bold text-red-400 mt-2">
              {users.filter(u => u.isAdmin).length}
            </p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Regular Users</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              {users.filter(u => !u.isAdmin).length}
            </p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Active Today</p>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {users.filter(u => {
                const lastLogin = u.lastLogin ? new Date(u.lastLogin) : null;
                const today = new Date();
                return lastLogin && lastLogin.toDateString() === today.toDateString();
              }).length}
            </p>
          </div>
        </div>

        {/* Add New User Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowNewUserForm(!showNewUserForm)}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition"
          >
            <Plus size={20} />
            Add New User
          </button>
        </div>

        {/* New User Form */}
        {showNewUserForm && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Create New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
                  placeholder="user@example.com"
                  required
                  disabled={creatingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
                  placeholder="username"
                  required
                  disabled={creatingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
                  placeholder="Minimum 6 characters"
                  required
                  disabled={creatingUser}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingUser ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewUserForm(false)}
                  disabled={creatingUser}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-900/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Username</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Last Login</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Logins</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-900/30 transition">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-white">{user.username}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.isAdmin ? (
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold border border-red-500/30">
                          Admin
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/30">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {user.loginCount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Only show toggle button if admin AND more than 1 admin exists */}
                        {user.isAdmin && users.filter(u => u.isAdmin).length > 1 && (
                          <button
                            onClick={() => handleToggleAdmin(user.id, user.isAdmin, user.username)}
                            title="Demote from admin"
                            className="p-2 rounded transition active:scale-90 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/40"
                          >
                            <ShieldOff size={18} />
                          </button>
                        )}
                        
                        {!user.isAdmin && (
                          <button
                            onClick={() => handleToggleAdmin(user.id, user.isAdmin, user.username)}
                            title="Promote to admin"
                            className="p-2 rounded transition active:scale-90 bg-gray-700 hover:bg-gray-600 text-gray-400 border border-gray-600"
                          >
                            <Shield size={18} />
                          </button>
                        )}
                        
                        {/* Delete button - Hidden if only admin */}
                        {!(user.isAdmin && users.filter(u => u.isAdmin).length === 1) && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            title="Delete user"
                            className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition active:scale-90 border border-red-600/40"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No users message */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-lg">
              {searchQuery ? 'No users match your search' : 'No users found'}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-sm w-full shadow-2xl animate-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-6 h-6 shrink-0 mt-0.5 ${
                  confirmModal.action === 'delete' ? 'text-red-400' : 'text-yellow-400'
                }`} />
                <h3 className="text-lg font-bold text-white">{confirmModal.title}</h3>
              </div>
              <button
                onClick={cancelAction}
                disabled={confirmModal.loading}
                className="text-gray-500 hover:text-gray-300 transition disabled:opacity-50"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-300 mb-6">{confirmModal.message}</p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelAction}
                disabled={confirmModal.loading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={confirmModal.loading}
                className={`px-4 py-2 rounded-lg font-semibold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  confirmModal.action === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {confirmModal.loading && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {confirmModal.loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

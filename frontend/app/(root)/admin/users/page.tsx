'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface User {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string | null;
  loginCount: number;
  _count: {
    watchlistItems: number;
    predictions: number;
    activityLogs: number;
  };
}

interface WatchlistItem {
  id: number;
  userId: number;
  symbol: string;
  companyName?: string;
  addedAt: string;
}

interface UserPrediction {
  id: number;
  userId: number;
  symbol: string;
  companyName?: string;
  predictedPrice?: number;
  viewedAt: string;
}

export default function AdminUsers() {
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(null);
  const [selectedTab, setSelectedTab] = useState<'logins' | 'watchlist' | 'predictions'>('logins');
  const [watchlistDetails, setWatchlistDetails] = useState<WatchlistItem[]>([]);
  const [predictionsDetails, setPredictionsDetails] = useState<UserPrediction[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {

    const checkAdminAndFetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/sign-in');
          return;
        }

        // Verify admin status by trying to fetch users
        const response = await fetch(api.admin.users(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 403) {
          setError('❌ Access denied. Admin privileges required.');
          setLoading(false);
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const usersData = await response.json();
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load users. You may not have admin access.');
        setLoading(false);
      }
    };

    checkAdminAndFetchUsers();
  }, [router]);

  const handleToggleAdminRole = async (user: User) => {
    // Protection: Si c'est le seul admin, empêcher de supprimer le rôle
    const adminCount = users.filter(u => u.isAdmin).length;
    if (user.isAdmin && adminCount === 1) {
      alert('❌ Cannot remove admin role from the only administrator. At least one admin must exist in the system.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(
        `${api.admin.updateUser(user.id)}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isAdmin: !user.isAdmin
          })
        }
      );

      if (response.ok) {
        setUsers(users.map(u =>
          u.id === user.id ? { ...u, isAdmin: !u.isAdmin } : u
        ));
        if (selectedUserDetails?.id === user.id) {
          setSelectedUserDetails({
            ...selectedUserDetails,
            isAdmin: !selectedUserDetails.isAdmin
          });
        }
        alert(`✅ User role updated successfully`);
      } else {
        alert('❌ Failed to update user role');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('❌ Error updating user role');
    }
  };

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

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadUserWatchlist = async () => {
    if (!selectedUserDetails) return;
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${api.admin.userStats(selectedUserDetails.id)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setWatchlistDetails(data.watchlist || []);
      }
    } catch (err) {
      console.error('Error loading watchlist:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadUserPredictions = async () => {
    if (!selectedUserDetails) return;
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${api.admin.userStats(selectedUserDetails.id)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPredictionsDetails(data.predictions || []);
      }
    } catch (err) {
      console.error('Error loading predictions:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Data loading
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Error loading users'}</p>
          <p className="text-slate-400">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
        <p className="text-slate-400">Monitor and manage all registered users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Users</p>
          <p className="text-3xl font-bold text-white mt-2">{users.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Active Today</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            {users.filter(u => {
              const lastLogin = u.lastLogin ? new Date(u.lastLogin) : null;
              const today = new Date();
              return lastLogin && lastLogin.toDateString() === today.toDateString();
            }).length}
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Admin Accounts</p>
          <p className="text-3xl font-bold text-cyan-400 mt-2">
            {users.filter(u => u.isAdmin).length}
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Avg Logins/User</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            {users.length > 0 ? (users.reduce((sum, u) => sum + u.loginCount, 0) / users.length).toFixed(1) : '0'}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:bg-slate-800/80 transition"
        />
        <p className="text-xs text-slate-500 mt-2">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Last Login</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-900/30 transition">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white">{user.username}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    {user.isAdmin ? (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
                        Admin
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-700/50 text-slate-400 rounded-full text-xs font-semibold">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedUserDetails(user)}
                      className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 rounded text-xs font-semibold transition"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* No users message */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-lg">
            {searchQuery ? 'No users match your search' : 'No users found'}
          </p>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedUserDetails.username}</h2>
                <p className="text-slate-400">{selectedUserDetails.email}</p>
              </div>
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm">Total Logins</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">{selectedUserDetails.loginCount}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm">Watchlist Items</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{selectedUserDetails._count.watchlistItems}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm">Predictions Viewed</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{selectedUserDetails._count.predictions}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-700 mb-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedTab('logins')}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                    selectedTab === 'logins'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Logins ({selectedUserDetails.loginCount})
                </button>
                <button
                  onClick={() => {
                    setSelectedTab('watchlist');
                    if (watchlistDetails.length === 0) loadUserWatchlist();
                  }}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                    selectedTab === 'watchlist'
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Watchlist ({selectedUserDetails._count.watchlistItems})
                </button>
                <button
                  onClick={() => {
                    setSelectedTab('predictions');
                    if (predictionsDetails.length === 0) loadUserPredictions();
                  }}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                    selectedTab === 'predictions'
                      ? 'border-green-400 text-green-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Predictions ({selectedUserDetails._count.predictions})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {selectedTab === 'logins' && (
                <div>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-slate-400 text-sm">Total Login Count</p>
                    <p className="text-4xl font-bold text-cyan-400 mt-2">{selectedUserDetails.loginCount}</p>
                    <p className="text-xs text-slate-500 mt-2">Last login: {formatDate(selectedUserDetails.lastLogin)}</p>
                  </div>
                </div>
              )}

              {selectedTab === 'watchlist' && (
                <div>
                  {loadingDetails ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    </div>
                  ) : watchlistDetails.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {watchlistDetails.map((item: WatchlistItem) => (
                        <div key={item.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-white">{item.symbol}</p>
                              <p className="text-sm text-slate-400">{item.companyName || 'Company'}</p>
                            </div>
                            <p className="text-xs text-slate-500">{formatDate(item.addedAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-8">No watchlist items</p>
                  )}
                </div>
              )}

              {selectedTab === 'predictions' && (
                <div>
                  {loadingDetails ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    </div>
                  ) : predictionsDetails.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {predictionsDetails.map((item: UserPrediction) => (
                        <div key={item.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-white">{item.symbol}</p>
                              <p className="text-sm text-slate-400">{item.companyName || 'Company'}</p>
                              {item.predictedPrice && (
                                <p className="text-sm text-green-400 mt-1">Predicted: ${item.predictedPrice.toFixed(2)}</p>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{formatDate(item.viewedAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-8">No predictions viewed</p>
                  )}
                </div>
              )}
            </div>

            {/* Account Status */}
            <div className="border-t border-slate-700 mt-6 pt-4">
              <p className="text-slate-300 font-semibold mb-3">Account Status</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Created:</span>
                  <p className="text-white mt-1">{formatDate(selectedUserDetails.createdAt)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Last Active:</span>
                  <p className="text-white mt-1">{formatDate(selectedUserDetails.lastLogin)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Role:</span>
                  <p className={`mt-1 font-semibold ${selectedUserDetails.isAdmin ? 'text-red-400' : 'text-green-400'}`}>
                    {selectedUserDetails.isAdmin ? 'Administrator' : 'Regular User'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useAdminProtection } from '@/hooks/useAdminProtection';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  trainedModels: number;
}

export default function AdminDashboard() {
  const { isLoading, isAuthorized, error } = useAdminProtection();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    trainedModels: 0,
  });

  useEffect(() => {
    if (!isAuthorized) return;

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch users data
        const usersResponse = await fetch(api.admin.users(), {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const totalUsers = usersData.length || 0;
          interface UserData { isAdmin: boolean }
          const adminUsers = usersData.filter((u: UserData) => u.isAdmin).length || 0;
          
          setStats((prev) => ({
            ...prev,
            totalUsers,
            adminUsers,
            activeUsers: totalUsers, // Active users = total users
          }));
        }

        // TODO: Add trained models count when API is available
        setStats((prev) => ({
          ...prev,
          trainedModels: 7, // 7 trained models
        }));
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, [isAuthorized]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Error/Unauthorized state
  if (!isAuthorized || error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-2">❌ {error || 'Access Denied'}</p>
          <p className="text-slate-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Authorized - Show content
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400 text-lg">Manage models, users, and system configuration</p>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Trained Models */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Trained Models</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.trainedModels}</p>
              <p className="text-green-400 text-xs mt-2">1 model per company</p>
            </div>
            <div className="text-3xl">🤖</div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
              <p className="text-blue-400 text-xs mt-2">{stats.adminUsers} admin{stats.adminUsers !== 1 ? 's' : ''}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">System Status</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <p className="text-lg font-bold text-green-400">Healthy</p>
              </div>
              <p className="text-xs text-slate-400 mt-2">All systems operational</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        {/* Last Update */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Last Update</p>
              <p className="text-2xl font-bold text-white mt-2">Now</p>
              <p className="text-cyan-400 text-xs mt-2">System synced</p>
            </div>
            <div className="text-3xl">⏰</div>
          </div>
        </div>
      </div>

      {/* Main Modules */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Models Module */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/40 transition">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-white">ML Models</h3>
            </div>
            <p className="text-slate-400 mb-6 text-sm">Train LSTM models for stock price prediction. One model per company for optimal performance.</p>
            <div className="space-y-2">
              <a 
                href="/admin/models" 
                className="flex items-center justify-between px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition"
              >
                <span>Manage Models</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Users Module */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/40 transition">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-white">Users</h3>
            </div>
            <p className="text-slate-400 mb-6 text-sm">Manage user accounts, permissions, and access levels across the platform.</p>
            <div className="space-y-2">
              <a 
                href="/admin/users" 
                className="flex items-center justify-between px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                <span>Manage Users</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Alerts Module */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-orange-500 transition group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/40 transition">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-xl font-bold text-white">Alerts</h3>
            </div>
            <p className="text-slate-400 mb-6 text-sm">Configure and manage system alerts, warnings, and notification rules.</p>
            <div className="space-y-2">
              <a 
                href="/admin/alerts" 
                className="flex items-center justify-between px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition"
              >
                <span>Manage Alerts</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Settings Module */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-green-500 transition group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/40 transition">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-bold text-white">Settings</h3>
            </div>
            <p className="text-slate-400 mb-6 text-sm">Manage users, permissions, and administrator access controls.</p>
            <div className="space-y-2">
              <a 
                href="/admin/settings" 
                className="flex items-center justify-between px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
              >
                <span>System Settings</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
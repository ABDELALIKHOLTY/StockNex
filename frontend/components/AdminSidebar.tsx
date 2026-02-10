'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Prediction Models', href: '/admin/models', icon: '🤖' },
  { label: 'Data Management', href: '/admin/data', icon: '💾' },
  { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { label: 'Alerts', href: '/admin/alerts', icon: '🔔' },
  { label: 'Reports', href: '/admin/reports', icon: '📑' },
  { label: 'Audit Logs', href: '/admin/logs', icon: '📋' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gray-900 border-r border-gray-800 transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && <h2 className="text-xl font-bold text-cyan-400">Admin</h2>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="mt-6 space-y-2 px-2">
        {adminNavItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-cyan-600/20 text-cyan-400 border-l-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={collapsed ? item.label : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition font-medium">
          {collapsed ? '🚪' : 'Logout'}
        </button>
      </div>
    </aside>
  );
}

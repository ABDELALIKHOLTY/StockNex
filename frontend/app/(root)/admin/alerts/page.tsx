'use client';

import { useState } from 'react';
import { useAlert } from '@/app/context/AlertContext';
import { ClientOnly } from '@/app/components/ClientOnly';

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.96 5.36 6.31 7.92 6.31 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const XCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.71 10.71L15.54 14l-1.83-1.83 1.41-1.41L17 12.76l1.83-1.83 1.41 1.41-1.83 1.83 1.83 1.83-1.41 1.41L17 14.17 15.17 16l-1.41-1.41 1.83-1.83-1.83-1.83 1.41-1.42z" />
  </svg>
);

const InfoCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

function AlertsPageContent() {
  const { alerts, markAsRead, markAllAsRead, removeAlert: deleteAlert, clearAll } = useAlert();

  const [filterType, setFilterType] = useState<'all' | Alert['type']>('all');
  const [showRead, setShowRead] = useState(true);

  // Debug: Log alerts
  console.log('🔔 Alerts in page:', alerts);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType !== 'all' && alert.type !== filterType) return false;
    if (!showRead && alert.read) return false;
    return true;
  });

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertCircleIcon className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'info':
        return <InfoCircleIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  const getAlertBg = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  const getAlertAccent = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      case 'info':
        return 'border-l-blue-500';
    }
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white">Alerts & Notifications</h1>
              <p className="text-slate-400 mt-2">
                {unreadCount > 0 ? `${unreadCount} new alert${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
          {alerts.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition"
                >
                  Mark All Read
                </button>
              )}
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-2">Total Alerts</p>
          <p className="text-3xl font-bold text-white">{alerts.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-2">Unread</p>
          <p className="text-3xl font-bold text-cyan-400">{unreadCount}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-2">Errors</p>
          <p className="text-3xl font-bold text-red-400">{alerts.filter((a) => a.type === 'error').length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-2">Success</p>
          <p className="text-3xl font-bold text-green-400">{alerts.filter((a) => a.type === 'success').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filterType === 'all'
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterType('success')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filterType === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Success
        </button>
        <button
          onClick={() => setFilterType('warning')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filterType === 'warning'
              ? 'bg-yellow-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Warnings
        </button>
        <button
          onClick={() => setFilterType('error')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filterType === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Errors
        </button>
        <button
          onClick={() => setFilterType('info')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filterType === 'info'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Info
        </button>
        <div className="ml-auto">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showRead}
              onChange={(e) => setShowRead(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Show Read
          </label>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 ${getAlertAccent(alert.type)} ${getAlertBg(alert.type)} border border-slate-700 rounded-lg p-6 backdrop-blur transition hover:border-slate-600 group`}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                        {!alert.read && <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>}
                      </div>
                      <p className="text-slate-300 mt-1">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  {!alert.read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="px-3 py-1 text-sm bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-dashed border-slate-600 rounded-xl p-12 text-center">
          <BellIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">No alerts to display</p>
          <p className="text-slate-500 text-sm">All your alerts have been dismissed or there are no matching filters</p>
        </div>
      )}
    </div>
  );
}

export default function AlertsPage() {
  return (
    <ClientOnly>
      <AlertsPageContent />
    </ClientOnly>
  );
}

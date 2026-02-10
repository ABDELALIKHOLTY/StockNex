'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  removeAlert: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([
    // Initial test alerts
    {
      id: '1',
      type: 'info',
      title: 'System Ready',
      message: 'Alert system is now active and monitoring',
      timestamp: new Date().toISOString(),
      read: false,
    },
  ]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load alerts from localStorage on mount
  useEffect(() => {
    try {
      const savedAlerts = localStorage.getItem('stocknex_alerts');
      if (savedAlerts) {
        const parsedAlerts = JSON.parse(savedAlerts);
        console.log('📦 Loaded alerts from localStorage:', parsedAlerts);
        setAlerts(parsedAlerts);
      }
    } catch (error) {
      console.error('Error loading alerts from localStorage:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('stocknex_alerts', JSON.stringify(alerts));
        console.log('💾 Saved alerts to localStorage:', alerts.length, 'alerts');
      } catch (error) {
        console.error('Error saving alerts to localStorage:', error);
      }
    }
  }, [alerts, isHydrated]);

  const addAlert = useCallback(
    (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
      const newAlert: Alert = {
        ...alert,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      console.log('➕ Adding new alert:', newAlert);
      setAlerts((prev) => [newAlert, ...prev]);
    },
    []
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, read: true } : alert))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        addAlert,
        removeAlert,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}

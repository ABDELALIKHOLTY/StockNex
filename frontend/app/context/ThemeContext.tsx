// DEPRECATED - Theme toggle functionality has been removed
// The app now uses dark theme permanently

'use client';

import React from 'react';

// Empty provider for backward compatibility
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Empty hook for backward compatibility
export const useTheme = () => {
  return { theme: 'dark' as const, setTheme: () => {} };
};

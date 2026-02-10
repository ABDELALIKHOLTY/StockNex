'use client';


import { AlertProvider } from './context/AlertContext';
import { ThemeProvider } from './context/ThemeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AlertProvider>
        {children}
      </AlertProvider>
    </ThemeProvider>
  );
}

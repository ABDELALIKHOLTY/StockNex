'use client';

import { useEffect, useState } from 'react';

const LoadingScreen = ({ children, showOnce = true }: { children?: React.ReactNode; showOnce?: boolean }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ajouter overflow hidden au body et html
    if (isLoading) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    
    // Si showOnce est true, déclencher le timeout automatiquement
    // Si showOnce est false, attendre que le parent contrôle le timing
    if (!showOnce) return;
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      // Always clean up overflow when unmounting
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isLoading, showOnce]);

  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #111827, #1f2937, #111827)'
      }}>
        <div className="text-center">
          {/* Logo/Title */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent mb-3">StockNex</h1>
            <p className="text-gray-300 text-lg">Loading your predictions...</p>
          </div>

          {/* Spinner animé */}
          <div className="flex justify-center mb-12">
            <div className="relative w-20 h-20">
              {/* Outer ring */}
              <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
              {/* Spinning ring */}
              <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 border-r-cyan-500 rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
              {/* Inner circle */}
              <div className="absolute inset-2 border-2 border-transparent border-b-cyan-400 rounded-full animate-spin" style={{animationDuration: '2s', animationDirection: 'reverse'}}></div>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>

          {/* Progress text */}
          <p className="text-gray-400 text-sm">Initializing AI prediction engine...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingScreen;

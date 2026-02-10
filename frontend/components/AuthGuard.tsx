'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500 border-opacity-75 mx-auto mb-4"></div>
          <p className="text-cyan-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-950 via-blue-900/20 to-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Alert Card */}
          <div className="bg-gray-900 border border-cyan-600/30 rounded-2xl p-8 shadow-2xl">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-cyan-500/10 rounded-full border border-cyan-500/30">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-3">
              Authentication Required
            </h2>

            {/* Description */}
            <p className="text-slate-300 text-center mb-8">
              You need to sign in or create an account to access this feature. Get started today!
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/sign-in')}
                className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-cyan-500/50"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/sign-up')}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/50"
              >
                Create Account
              </button>
            </div>

            {/* Footer Text */}
            <p className="text-slate-400 text-sm text-center mt-6">
              By signing in, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

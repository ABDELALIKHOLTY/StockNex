'use client';

import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignIn = () => {
    router.push('/sign-in');
    onClose();
  };

  const handleSignUp = () => {
    router.push('/sign-up');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-cyan-600/30 rounded-2xl p-8 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-200 transition-colors hover:bg-gray-800 rounded-lg"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

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
            Sign In Required
          </h2>

          {/* Description */}
          <p className="text-slate-300 text-center mb-8">
            You need to create an account or sign in to use this feature.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSignIn}
              className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-cyan-500/50"
            >
              Sign In
            </button>
            <button
              onClick={handleSignUp}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/50"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

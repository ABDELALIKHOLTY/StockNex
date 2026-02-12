'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

// Custom Upload Icon Component
const UploadIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

function SettingsContent() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('adminEmail');

    if (!token) {
      router.push('/sign-in');
      return;
    }

    setIsLoggedIn(true);
    setUserId(id);
    setUserName(name || '');
    setUserEmail(email || '');
    
    // Load avatar specific to this user
    if (id) {
      const savedAvatar = localStorage.getItem(`userAvatar_${id}`);
      setAvatarUrl(savedAvatar || '');
    }
  }, [router]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      const imageData = reader.result as string;
      const key = `userAvatar_${userId}`;
      localStorage.setItem(key, imageData);
      setAvatarUrl(imageData);
      setMessage('✅ Avatar updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    };
    
    reader.onerror = () => {
      setMessage('❌ Failed to upload avatar');
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('isAdmin');
    // Don't remove the user's avatar - keep it for next login
    router.push('/sign-in');
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-gray-400">Manage your account preferences and appearance</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-400">
            {message}
          </div>
        )}

        {/* Profile Section */}
        <div className="mb-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded"></div>
            Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center overflow-hidden border-2 border-cyan-500/50">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-5xl font-bold text-white">
                      {(userName?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <label 
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-full cursor-pointer transition-colors shadow-lg"
                  aria-label="Upload profile picture"
                >
                  <UploadIcon size={20} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>

              <p className="text-sm text-gray-400 text-center">
                Click the camera icon to upload a new profile picture
              </p>
            </div>

            {/* User Info */}
            <div className="md:col-span-2">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Full Name
                  </label>
                  <div className="px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-lg text-white">
                    {userName}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email
                  </label>
                  <div className="px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-lg text-white">
                    {userEmail}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    User ID
                  </label>
                  <div className="px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-lg text-gray-300 text-sm font-mono">
                    {userId || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-red-600 rounded"></div>
            Danger Zone
          </h2>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 rounded-lg text-red-400 font-medium transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>

          <p className="text-sm text-gray-400 mt-4">
            You will be logged out and returned to the sign-in page
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <SettingsContent />;
}

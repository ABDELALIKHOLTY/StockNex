'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const useAdminAuth = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminFlag = localStorage.getItem('isAdmin');
        const token = localStorage.getItem('token');

        if (adminFlag === 'true' && token) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  return { isAdmin, loading };
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('adminEmail');
};

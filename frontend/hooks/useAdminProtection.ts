import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook pour protéger les pages admin
 * Vérifie que l'utilisateur est authentifié et admin
 * Redirige vers la page de connexion si ce n'est pas le cas
 */
export const useAdminProtection = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        setIsLoading(true);
        
        // Check token existence
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setIsAuthorized(false);
          setTimeout(() => router.push('/sign-in'), 2000);
          return;
        }

        // Check admin status
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (!isAdmin) {
          setError('Admin access required');
          setIsAuthorized(false);
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        // All checks passed
        setIsAuthorized(true);
        setError(null);
      } catch (err) {
        console.error('Error checking admin access:', err);
        setError('Failed to verify admin access');
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  return {
    isLoading,
    isAuthorized,
    error,
  };
};

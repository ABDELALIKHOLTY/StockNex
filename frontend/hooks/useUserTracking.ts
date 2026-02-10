import { useCallback } from 'react';
import { api } from '@/lib/api';

export const useUserTracking = () => {
  const trackLogin = useCallback(async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(api.users.trackLogin(userId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error tracking login:', error);
    }
  }, []);

  const addToWatchlist = useCallback(async (userId: number, symbol: string, companyName?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found in localStorage');
        return;
      }

      console.log('🔄 Calling addToWatchlist API with:', { userId, symbol, companyName });

      const response = await fetch(api.users.addWatchlist(userId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbol, companyName })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response from API:', errorData);
        return;
      }

      console.log('✅ Watchlist item added successfully');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  }, []);

  const removeFromWatchlist = useCallback(async (userId: number, symbol: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found in localStorage');
        return;
      }

      console.log('🔄 Calling removeFromWatchlist API with:', { userId, symbol });

      const response = await fetch(api.users.removeWatchlist(userId, symbol), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response from API:', errorData);
        return;
      }

      console.log('✅ Watchlist item removed successfully');
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  }, []);

  const trackPrediction = useCallback(async (userId: number, symbol: string, companyName?: string, predictedPrice?: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found in localStorage');
        return;
      }

      console.log('🔄 Calling trackPrediction API with:', {
        userId,
        symbol,
        companyName,
        predictedPrice,
        endpoint: api.users.trackPrediction(userId)
      });

      const response = await fetch(api.users.trackPrediction(userId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbol, companyName, predictedPrice })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response from API:', errorData);
        return;
      }

      console.log('✅ Prediction tracked successfully');
    } catch (error) {
      console.error('Error tracking prediction:', error);
    }
  }, []);

  return {
    trackLogin,
    addToWatchlist,
    removeFromWatchlist,
    trackPrediction
  };
};

import { useCallback, useState, useEffect } from 'react';
import { useHeatmapCache, useStockDetailsCache } from './useCache';

/**
 * Hook pour gérer le refresh des données de watchlist
 * Permet de rafraîchir manuellement ou automatiquement la cache pour avoir des données fraiches
 */
export function useWatchlistRefresh(selectedSymbol: string | null, autoRefreshIntervalMs: number = 30000) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const heatmapCache = useHeatmapCache();
  const detailsCache = useStockDetailsCache(selectedSymbol);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Rafraîchir les données du heatmap (tous les stocks)
      await heatmapCache.refresh();
      
      // Rafraîchir les détails du stock sélectionné
      if (selectedSymbol) {
        await detailsCache.refresh();
      }
    } catch (error) {
      console.error('Error refreshing watchlist data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedSymbol, heatmapCache, detailsCache]);

  // Auto-refresh à intervalle régulier (30 secondes par défaut)
  useEffect(() => {
    // Premier refresh immédiat
    refreshAll();

    // Configurer l'intervalle pour les rafraîchissements automatiques
    const interval = setInterval(() => {
      refreshAll();
    }, autoRefreshIntervalMs);

    return () => clearInterval(interval);
  }, [autoRefreshIntervalMs, refreshAll]);

  return {
    refreshAll,
    isRefreshing,
    isLoading: heatmapCache.loading || detailsCache.loading,
  };
}

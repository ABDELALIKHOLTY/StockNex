import { useCallback, useEffect, useState } from 'react';
import { useHeatmapCache } from './useCache';

/**
 * Hook pour auto-refresh des données du dashboard
 * Rafraîchit automatiquement les données du heatmap à intervalle régulier
 */
export function useDashboardRefresh(autoRefreshIntervalMs: number = 30000) {
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const heatmapCache = useHeatmapCache();

  const refresh = useCallback(async () => {
    try {
      await heatmapCache.refresh();
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  }, [heatmapCache]);

  // Auto-refresh à intervalle régulier (30 secondes par défaut)
  useEffect(() => {
    // Premier refresh immédiat
    refresh();

    // Configurer l'intervalle pour les rafraîchissements automatiques
    const interval = setInterval(() => {
      refresh();
    }, autoRefreshIntervalMs);

    return () => clearInterval(interval);
  }, [autoRefreshIntervalMs, refresh]);

  return {
    refresh,
    lastRefreshed,
    isLoading: heatmapCache.loading,
  };
}

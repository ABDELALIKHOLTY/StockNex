import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Hook personnalisé pour gérer le cache client avec localStorage
 * @param key - Clé unique pour le cache
 * @param fetcher - Fonction asynchrone pour récupérer les données
 * @param ttl - Durée de vie du cache en millisecondes (par défaut 5 minutes)
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes par défaut
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);

  // Mettre à jour la ref quand le fetcher change
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // Calculate appropriate TTL based on cache key
  const getEffectiveTTL = useCallback(() => {
    // Stock prices need fresher data (volatile)
    if (key.includes('stock:') || key.includes('details:')) {
      return Math.min(ttl, 15 * 1000); // Max 15 seconds
    }
    
    // Heatmap data
    if (key.includes('heatmap:')) {
      return Math.min(ttl, 15 * 1000); // Max 15 seconds
    }
    
    // Historical data is less volatile
    if (key.includes('historical:')) {
      return ttl; // Use provided TTL
    }
    
    return ttl;
  }, [key, ttl]);

  useEffect(() => {
    let isMounted = true;
    const effectiveTTL = getEffectiveTTL();

    const fetchData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);

        // Check if we have cached data in localStorage
        const cached = localStorage.getItem(`cache:${key}`);
        if (cached) {
          try {
            const entry: CacheEntry<T> = JSON.parse(cached);
            const now = Date.now();

            // Check if cache is still valid
            if (now - entry.timestamp < effectiveTTL) {
              console.log(`Cache hit for ${key} (TTL: ${effectiveTTL}ms)`);
              if (isMounted) {
                setData(entry.data);
                setLoading(false);
              }
              return;
            } else {
              // Cache is expired, remove it
              console.log(`Cache expired for ${key} (age: ${now - entry.timestamp}ms, TTL: ${effectiveTTL}ms)`);
              localStorage.removeItem(`cache:${key}`);
            }
          } catch (parseErr) {
            console.error(`Error parsing cache for ${key}:`, parseErr);
            localStorage.removeItem(`cache:${key}`);
          }
        }

        // Fetch fresh data
        console.log(`Cache miss for ${key}, fetching fresh data...`);
        const freshData = await fetcherRef.current();
        
        // Store in cache with effective TTL
        const cacheEntry: CacheEntry<T> = {
          data: freshData,
          timestamp: Date.now(),
          ttl: effectiveTTL
        };
        try {
          localStorage.setItem(`cache:${key}`, JSON.stringify(cacheEntry));
        } catch (storageErr) {
          console.error(`Error storing cache for ${key}:`, storageErr);
        }

        if (isMounted) {
          setData(freshData);
          setLoading(false);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        if (isMounted) {
          setError(error);
          setLoading(false);
        }
        console.error(`Error fetching ${key}:`, error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [key, ttl, getEffectiveTTL]);

  // Function to manually clear cache
  const clearCache = useCallback(() => {
    localStorage.removeItem(`cache:${key}`);
    setData(null);
  }, [key]);

  // Function to manually refresh data
  const refresh = useCallback(async () => {
    clearCache();
    setLoading(true);
    try {
      const freshData = await fetcher();
      const effectiveTTL = getEffectiveTTL();
      const cacheEntry: CacheEntry<T> = {
        data: freshData,
        timestamp: Date.now(),
        ttl: effectiveTTL
      };
      localStorage.setItem(`cache:${key}`, JSON.stringify(cacheEntry));
      setData(freshData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, getEffectiveTTL, clearCache]);

  return { data, loading, error, clearCache, refresh };
}

/**
 * Hook pour gérer le cache des données du heatmap (S&P 500)
 * Réduit pour des mises à jour plus fréquentes
 */
export function useHeatmapCache() {
  const fetcher = async () => {
    const res = await fetch(api.market.heatmap());
    const data = await res.json();
    return Array.isArray(data) ? data : (data.stocks || []);
  };

  return useCache('heatmap:stocks', fetcher, 3 * 60 * 1000); // 3 minutes (heatmap is volatile)
}

/**
 * Hook pour gérer le cache des détails d'un stock
 * Réduit pour avoir des données de prix plus frais
 */
export function useStockDetailsCache(symbol: string | null) {
  // Retourner un état vide si pas de symbol AVANT d'appeler useCache
  const emptyState = { data: null, loading: false, error: null, clearCache: () => {}, refresh: async () => {} };
  
  // Vérifier si le symbole est valide (pas null, pas vide)
  const isValidSymbol = symbol && symbol.trim().length > 0;
  
  const fetcher = useCallback(async () => {
    // Ne pas faire de requête HTTP si le symbole n'est pas valide
    if (!isValidSymbol) {
      console.log('Skipping fetch: invalid symbol');
      return null;
    }
    
    try {
      const res = await fetch(api.market.details(symbol));
      if (!res.ok) {
        console.error(`Failed to fetch stock details for ${symbol}: ${res.status}`);
        return null;
      }
      return res.json();
    } catch (error) {
      console.error(`Error fetching stock details for ${symbol}:`, error);
      return null;
    }
  }, [symbol, isValidSymbol]);

  const result = useCache(
    isValidSymbol ? `stock-details:${symbol}` : 'stock-details:empty',
    fetcher,
    1 * 60 * 1000 // 1 minute (stock details have price data)
  );

  if (!isValidSymbol) {
    return emptyState;
  }

  return result;
}

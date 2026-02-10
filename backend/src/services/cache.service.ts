// Cache service with configurable TTL
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private ttls = new Map<string, number>();

  // Set default TTL for a cache key pattern
  setDefaultTTL(pattern: string, ttlMs: number) {
    this.ttls.set(pattern, ttlMs);
  }

  // Get cached data if it exists and is not expired
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    const ttl = this.getTTL(key);
    if (Date.now() - entry.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Set cache data
  set<T>(key: string, data: T, ttlMs?: number) {
    const finalTtl = ttlMs || this.getTTL(key);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Get TTL for a key
  private getTTL(key: string): number {
    // Stock price data: 15 seconds (volatile, needs real-time updates)
    if (key.startsWith('stock:')) {
      return 15 * 1000; // 15 seconds
    }
    
    // Historical/chart data: 5 minutes (less volatile)
    if (key.startsWith('historical:')) {
      return 5 * 60 * 1000; // 5 minutes
    }
    
    // Heatmap data: 15 seconds (fairly volatile)
    if (key.startsWith('heatmap:')) {
      return 15 * 1000; // 15 seconds
    }
    
    // Check for custom patterns
    for (const [pattern, ttl] of this.ttls) {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
        if (regex.test(key)) {
          return ttl;
        }
      } else if (pattern === key) {
        return ttl;
      }
    }
    
    return 5 * 60 * 1000; // Default 5 minutes
  }

  // Clear specific cache key
  clear(key: string) {
    this.cache.delete(key);
  }

  // Clear all cache matching a pattern
  clearPattern(pattern: string) {
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clearAll() {
    this.cache.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cacheService = new CacheService();

// Configure default TTLs for different cache types
cacheService.setDefaultTTL('overview', 5 * 60 * 1000); // 5 minutes - reduced API calls
cacheService.setDefaultTTL('heatmap', 10 * 60 * 1000); // 10 minutes - IMPORTANT to reduce 429 errors
cacheService.setDefaultTTL('stock:*', 30 * 1000); // 30 seconds
cacheService.setDefaultTTL('details:*', 30 * 1000); // 30 seconds
cacheService.setDefaultTTL('historical:*', 60 * 60 * 1000); // 1 hour
cacheService.setDefaultTTL('quotes', 10 * 60 * 1000); // 10 minutes

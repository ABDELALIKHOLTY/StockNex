"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
class CacheService {
    constructor() {
        this.cache = new Map();
        this.ttls = new Map();
    }
    // Set default TTL for a cache key pattern
    setDefaultTTL(pattern, ttlMs) {
        this.ttls.set(pattern, ttlMs);
    }
    // Get cached data if it exists and is not expired
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        // Check if expired
        const ttl = this.getTTL(key);
        if (Date.now() - entry.timestamp > ttl) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    // Set cache data
    set(key, data, ttlMs) {
        const finalTtl = ttlMs || this.getTTL(key);
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }
    // Get TTL for a key (default 5 minutes)
    getTTL(key) {
        // Check for pattern match (e.g., "stock:*" matches "stock:AAPL")
        for (const [pattern, ttl] of this.ttls) {
            if (pattern.includes('*')) {
                const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
                if (regex.test(key)) {
                    return ttl;
                }
            }
            else if (pattern === key) {
                return ttl;
            }
        }
        return 5 * 60 * 1000; // Default 5 minutes
    }
    // Clear specific cache key
    clear(key) {
        this.cache.delete(key);
    }
    // Clear all cache matching a pattern
    clearPattern(pattern) {
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
exports.CacheService = CacheService;
exports.cacheService = new CacheService();
// Configure default TTLs for different cache types
exports.cacheService.setDefaultTTL('overview', 10 * 60 * 1000); // 10 minutes
exports.cacheService.setDefaultTTL('heatmap', 15 * 60 * 1000); // 15 minutes
exports.cacheService.setDefaultTTL('stock:*', 60 * 60 * 1000); // 1 hour
exports.cacheService.setDefaultTTL('details:*', 60 * 60 * 1000); // 1 hour
exports.cacheService.setDefaultTTL('historical:*', 60 * 60 * 1000); // 1 hour
exports.cacheService.setDefaultTTL('quotes', 5 * 60 * 1000); // 5 minutes

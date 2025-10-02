class DataCacheService {
  constructor() {
    this.cache = new Map();
    this.loadingStates = new Map();
    this.cacheTTL = 60 * 60 * 1000; // 1 hour TTL
    this.cacheTimestamps = new Map();
  }

  /**
   * Set data in cache with timestamp
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  set(key, data) {
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  /**
   * Get data from cache if not expired
   * @param {string} key - Cache key
   * @returns {any|null} - Cached data or null if expired/not found
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const timestamp = this.cacheTimestamps.get(key);
    if (timestamp && Date.now() - timestamp > this.cacheTTL) {
      // Data expired, remove it
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key to clear
   */
  clear(key) {
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
    this.loadingStates.delete(key);
  }

  /**
   * Clear all cache entries matching a pattern
   * @param {string} pattern - Pattern to match (simple string matching)
   */
  clearByPattern(pattern) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      this.loadingStates.delete(key);
    });
  }

  /**
   * Clear all cached data
   */
  clearAll() {
    this.cache.clear();
    this.cacheTimestamps.clear();
    this.loadingStates.clear();
  }

  /**
   * Check if data is currently being loaded
   * @param {string} key - Cache key
   * @returns {boolean} - True if loading
   */
  isLoading(key) {
    return this.loadingStates.get(key) || false;
  }

  /**
   * Set loading state for a key
   * @param {string} key - Cache key
   * @param {boolean} loading - Loading state
   */
  setLoading(key, loading) {
    if (loading) {
      this.loadingStates.set(key, true);
    } else {
      this.loadingStates.delete(key);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getStats() {
    return {
      totalEntries: this.cache.size,
      loadingEntries: this.loadingStates.size,
      cacheKeys: Array.from(this.cache.keys())
    };
  }
}

export default new DataCacheService();
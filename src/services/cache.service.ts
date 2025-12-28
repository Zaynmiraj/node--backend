import prisma from '../lib/prisma';
import redis from '../lib/redis';
import { config } from '../config';

/**
 * Cache service for Redis operations
 */
class CacheService {
  private defaultTTL: number;

  constructor() {
    this.defaultTTL = config.cache.ttl;
  }

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redis.isReady()) {
      return null;
    }

    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!redis.isReady()) {
      return;
    }

    try {
      await redis.set(key, JSON.stringify(value), ttlSeconds || this.defaultTTL);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    if (!redis.isReady()) {
      return;
    }

    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Delete cached data by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    if (!redis.isReady()) {
      return;
    }

    try {
      const keys = await redis.keys(pattern);
      for (const key of keys) {
        await redis.del(key);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (!redis.isReady()) {
      return;
    }

    try {
      await redis.flush();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get or set cache (cache aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, ttlSeconds);
    return data;
  }
}

export const cacheService = new CacheService();
export default cacheService;

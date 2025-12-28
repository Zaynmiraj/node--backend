import { Request, Response, NextFunction } from 'express';
import redis from '../lib/redis';
import { config } from '../config';

/**
 * Cache middleware for GET requests
 * Caches the response in Redis with a configurable TTL
 */
export const cacheMiddleware = (ttlSeconds?: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Check if Redis is connected
    if (!redis.isReady()) {
      next();
      return;
    }

    // Generate cache key from URL and query params
    const cacheKey = `cache:${req.originalUrl}`;

    try {
      // Try to get cached response
      const cachedResponse = await redis.get(cacheKey);

      if (cachedResponse) {
        const parsed = JSON.parse(cachedResponse);
        res.status(200).json(parsed);
        return;
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = ((body: unknown) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const ttl = ttlSeconds || config.cache.ttl;
          redis.set(cacheKey, JSON.stringify(body), ttl).catch(console.error);
        }
        return originalJson(body);
      }) as Response['json'];

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Clear cache for a specific pattern
 */
export const clearCache = async (pattern: string): Promise<void> => {
  if (!redis.isReady()) {
    return;
  }

  try {
    const keys = await redis.keys(`cache:${pattern}`);
    for (const key of keys) {
      await redis.del(key);
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = async (): Promise<void> => {
  if (!redis.isReady()) {
    return;
  }

  try {
    const keys = await redis.keys('cache:*');
    for (const key of keys) {
      await redis.del(key);
    }
  } catch (error) {
    console.error('Clear all cache error:', error);
  }
};

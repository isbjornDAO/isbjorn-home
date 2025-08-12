import Redis from 'ioredis';
import { logger } from '../utils/logger';

let redis: Redis | null = null;

export const initializeRedis = async (): Promise<void> => {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redis.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    // Attempt connection, but don't crash app in development if unavailable
    try {
      await redis.connect?.();
      await redis.ping();
    } catch (err) {
      logger.warn('Redis not available; continuing without cache');
      redis.disconnect?.();
      redis = null;
    }
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    // Continue without Redis for development
    redis = null;
  }
};

export const getRedis = (): Redis | null => {
  return redis;
};
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
    });

    redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redis.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    // Test the connection
    await redis.ping();
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    // Continue without Redis for development
    redis = null;
  }
};

export const getRedis = (): Redis | null => {
  return redis;
};
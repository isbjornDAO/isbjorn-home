"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedis = exports.initializeRedis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../utils/logger");
let redis = null;
const initializeRedis = async () => {
    try {
        // Support REDIS_URL from Railway or individual config
        const redisUrl = process.env.REDIS_URL || process.env.REDIS_PRIVATE_URL;
        if (redisUrl) {
            logger_1.logger.info('Using REDIS_URL for connection');
            redis = new ioredis_1.default(redisUrl, {
                maxRetriesPerRequest: 3,
                lazyConnect: true,
                tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
            });
        }
        else {
            redis = new ioredis_1.default({
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD || undefined,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
            });
        }
        redis.on('connect', () => {
            logger_1.logger.info('Redis connected successfully');
        });
        redis.on('error', (error) => {
            logger_1.logger.error('Redis connection error:', error);
        });
        // Attempt connection, but don't crash app in development if unavailable
        try {
            await redis.connect?.();
            await redis.ping();
        }
        catch (err) {
            logger_1.logger.warn('Redis not available; continuing without cache');
            redis.disconnect?.();
            redis = null;
        }
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize Redis:', error);
        // Continue without Redis for development
        redis = null;
    }
};
exports.initializeRedis = initializeRedis;
const getRedis = () => {
    return redis;
};
exports.getRedis = getRedis;
//# sourceMappingURL=redis.js.map
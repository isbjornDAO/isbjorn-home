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
        redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || undefined,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
        });
        redis.on('connect', () => {
            logger_1.logger.info('Redis connected successfully');
        });
        redis.on('error', (error) => {
            logger_1.logger.error('Redis connection error:', error);
        });
        // Test the connection
        await redis.ping();
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
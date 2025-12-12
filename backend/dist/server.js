"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const requestLogger_1 = require("./middleware/requestLogger");
const routes_1 = __importDefault(require("./routes"));
const redis_1 = require("./config/redis");
const jobs_1 = require("./jobs");
const blockchain_1 = require("./integrations/blockchain");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", 'https:', 'data:'],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com', 'https://cdn.jsdelivr.net'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:', 'http:'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
            connectSrc: ["'self'", 'https://api.stripe.com', 'https://api.avax.network', 'https://api.avax-test.network', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:*'],
            frameSrc: ["'self'", 'https://js.stripe.com'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", 'https:'],
            manifestSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
// CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:3007',
    'http://localhost:3008',
    'http://localhost:3009',
    // Production frontend URL (hardcoded as fallback)
    'https://isbjorn-home.vercel.app',
    // Environment-based frontend URL
    process.env.FRONTEND_URL || '',
    // Allow Railway domains
    'https://*.up.railway.app',
    'https://*.railway.app'
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        // Allow any localhost in development to avoid random port issues
        if (NODE_ENV === 'development' && /^http:\/\/localhost:\d{4,5}$/.test(origin)) {
            return callback(null, true);
        }
        // Allow Railway domains
        if (origin.includes('.up.railway.app') || origin.includes('.railway.app')) {
            return callback(null, true);
        }
        // Allow Vercel domains (preview and production)
        if (origin.includes('.vercel.app')) {
            return callback(null, true);
        }
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    optionsSuccessStatus: 200,
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
if (NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
app.use(requestLogger_1.requestLogger);
app.use('/api', rateLimiter_1.rateLimiter);
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        version: process.env.npm_package_version,
    });
});
if (NODE_ENV === 'development') {
    const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, '../swagger.yaml'));
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
}
app.use('/api', routes_1.default);
// Serve static files from the frontend build in production
if (NODE_ENV === 'production') {
    // Serve static files from frontend build
    app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/dist')));
    // Handle all other routes by serving the frontend index.html (SPA routing)
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../../frontend/dist/index.html'));
    });
}
app.use(errorHandler_1.errorHandler);
const server = (0, http_1.createServer)(app);
async function startServer() {
    try {
        // Database connection
        try {
            await database_1.sequelize.authenticate();
            console.log('✅ Database connection established successfully.');
            // Sync database models (create tables)
            await database_1.sequelize.sync({ force: false });
            console.log('✅ Database models synchronized.');
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            process.exit(1);
        }
        await (0, redis_1.initializeRedis)();
        logger_1.logger.info('Redis connection established');
        try {
            await (0, blockchain_1.initializeBlockchain)();
            logger_1.logger.info('Blockchain connection established');
        }
        catch (error) {
            logger_1.logger.warn('Blockchain initialization failed - running without blockchain features', error);
        }
        await (0, jobs_1.initializeJobs)();
        logger_1.logger.info('Background jobs initialized');
        server.listen(PORT, () => {
            logger_1.logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`);
            logger_1.logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
        await database_1.sequelize.close();
        logger_1.logger.info('Database connection closed');
        process.exit(0);
    });
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception:', error);
    process.exit(1);
});
startServer();
//# sourceMappingURL=server.js.map
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

dotenv.config();

const app: Application = express();
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
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

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(requestLogger);

// Rate limiting (skip in serverless)
if (NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.use(rateLimiter);
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation (development only)
if (NODE_ENV === 'development' && process.env.ENABLE_SWAGGER === 'true') {
    try {
        const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    } catch (error) {
        logger.warn('Swagger documentation not available');
    }
}

// API Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Export app for serverless (Vercel) and traditional server
export default app;

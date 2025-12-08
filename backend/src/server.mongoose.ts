import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { createServer } from 'http';
import { connectMongoDB } from './config/mongodb';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import authRoutes from './routes/auth.mongoose';
import oauthRoutes from './routes/oauth';
import { initializeRedis } from './config/redis';
import { initializePassport } from './config/passport';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const app: Application = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

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

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
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

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Initialize Passport
const passportInstance = initializePassport();
app.use(passportInstance.initialize());

app.use(requestLogger);
app.use('/api', rateLimiter);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version,
    database: 'mongodb',
  });
});

if (NODE_ENV === 'development') {
  try {
    const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  } catch (error) {
    logger.warn('Swagger documentation not available');
  }
}

// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount OAuth routes
app.use('/api/auth', oauthRoutes);

// Serve static files from the frontend build in production
if (NODE_ENV === 'production') {
  // Serve static files from frontend build
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  // Handle all other routes by serving the frontend index.html (SPA routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

app.use(errorHandler);

const server = createServer(app);

async function startServer() {
  try {
    // MongoDB connection
    await connectMongoDB();

    // Initialize Redis
    try {
      await initializeRedis();
      logger.info('Redis connection established');
    } catch (error) {
      logger.warn('Redis initialization failed - running without cache', error);
    }

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      if (NODE_ENV === 'development') {
        logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

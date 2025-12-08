import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/isbjorn';
const NODE_ENV = process.env.NODE_ENV || 'development';

export const connectMongoDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', false);

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('✅ MongoDB connected successfully');
    logger.info(`📊 Database: ${mongoose.connection.name}`);

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    if (NODE_ENV === 'production') {
      process.exit(1);
    } else {
      logger.warn('⚠️ Running without database in development mode');
    }
  }
};

export default mongoose;

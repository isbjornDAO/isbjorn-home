import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';

// Simple SQLite configuration for local development
const config = {
  dialect: 'sqlite' as const,
  storage: path.join(process.cwd(), 'data', 'isbjorn_dev.sqlite'),
  logging: NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
  },
};

export default config;
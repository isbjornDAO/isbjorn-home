import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_TYPE = process.env.DB_TYPE || 'postgres';

// SQLite configuration for local development
const sqliteConfig = {
  dialect: 'sqlite' as const,
  storage: process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite'),
  logging: NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
};

// PostgreSQL configuration for production
const postgresConfig = {
  database: process.env.DB_NAME || 'isbjorn_dev',
  username: process.env.DB_USER || 'postgres', 
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres' as const,
  logging: NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
};

const config = DB_TYPE === 'sqlite' ? sqliteConfig : postgresConfig;

export const sequelize = new Sequelize({
  ...config,
  models: [path.join(__dirname, '../models')],
  modelMatch: (filename, member) => {
    return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
  },
});
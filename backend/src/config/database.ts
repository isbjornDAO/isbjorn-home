import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User.model';
import { Charity } from '../models/Charity.model';
import { Donation } from '../models/Donation.model';
import { Receipt } from '../models/Receipt.model';
import { BlockchainTransaction } from '../models/BlockchainTransaction.model';
import { NZCompany } from '../models/NZCompany.model';
import { IRDCompliantDonation } from '../models/IRDCompliantDonation.model';
import { Project } from '../models/Project.model';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_TYPE = process.env.DB_TYPE || 'sqlite';

const sqliteConfig = {
  dialect: 'sqlite' as const,
  storage: process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite'),
  logging: NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
};

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
};

const config = {
  development: DB_TYPE === 'sqlite' ? sqliteConfig : postgresConfig,
  test: DB_TYPE === 'sqlite' ? {
    ...sqliteConfig,
    storage: ':memory:',
  } : postgresConfig,
  production: DB_TYPE === 'sqlite' ? sqliteConfig : postgresConfig,
};

const env = NODE_ENV as keyof typeof config;
const dbConfig = config[env];

export const sequelize = new Sequelize({
  ...dbConfig,
  models: [User, Charity, Donation, Receipt, BlockchainTransaction, NZCompany, IRDCompliantDonation, Project],
  define: {
    timestamps: true,
    underscored: true,
  },
});
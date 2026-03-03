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
import { Collectable } from '../models/Collectable.model';
import { UserCollectable } from '../models/UserCollectable.model';
import { Reward } from '../models/Reward.model';
import { UserReward } from '../models/UserReward.model';
import { PolarBear } from '../models/PolarBear.model';
import { ClimateZone } from '../models/ClimateZone.model';
import { ResearchStation } from '../models/ResearchStation.model';
import { Mission } from '../models/Mission.model';
import { SeaIce } from '../models/SeaIce.model';
import { Permafrost } from '../models/Permafrost.model';
import { Glacier } from '../models/Glacier.model';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const DATABASE_URL = process.env.DATABASE_URL;

const models = [
  User,
  Charity,
  Donation,
  Receipt,
  BlockchainTransaction,
  NZCompany,
  IRDCompliantDonation,
  Project,
  Collectable,
  UserCollectable,
  Reward,
  UserReward,
  PolarBear,
  ClimateZone,
  ResearchStation,
  Mission,
  SeaIce,
  Permafrost,
  Glacier,
];

function createSequelizeInstance(): Sequelize {
  // If DATABASE_URL is provided (Railway), use it directly
  if (DATABASE_URL) {
    console.log('Using DATABASE_URL for PostgreSQL connection');

    return new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      logging: NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false,
        } : false,
      },
      pool: {
        max: 20, // Increased from 5 for better concurrent request handling
        min: 2,  // Keep some connections warm
        acquire: 30000,
        idle: 10000,
      },
      models,
      define: {
        timestamps: true,
        underscored: true,
      },
    });
  }

  // Fallback to individual config variables or SQLite
  const DB_TYPE = process.env.DB_TYPE || 'sqlite';

  if (DB_TYPE === 'sqlite') {
    console.log('Using SQLite database');
    return new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite'),
      logging: NODE_ENV === 'development' ? console.log : false,
      models,
      define: {
        timestamps: true,
        underscored: true,
      },
    });
  }

  // PostgreSQL with individual config
  console.log('Using PostgreSQL with individual config variables');
  return new Sequelize({
    database: process.env.DB_NAME || 'isbjorn_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    models,
    define: {
      timestamps: true,
      underscored: true,
    },
  });
}

export const sequelize = createSequelizeInstance();

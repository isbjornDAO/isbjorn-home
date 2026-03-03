"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const User_model_1 = require("../models/User.model");
const Charity_model_1 = require("../models/Charity.model");
const Donation_model_1 = require("../models/Donation.model");
const Receipt_model_1 = require("../models/Receipt.model");
const BlockchainTransaction_model_1 = require("../models/BlockchainTransaction.model");
const NZCompany_model_1 = require("../models/NZCompany.model");
const IRDCompliantDonation_model_1 = require("../models/IRDCompliantDonation.model");
const Project_model_1 = require("../models/Project.model");
const Collectable_model_1 = require("../models/Collectable.model");
const UserCollectable_model_1 = require("../models/UserCollectable.model");
const Reward_model_1 = require("../models/Reward.model");
const UserReward_model_1 = require("../models/UserReward.model");
const PolarBear_model_1 = require("../models/PolarBear.model");
const ClimateZone_model_1 = require("../models/ClimateZone.model");
const ResearchStation_model_1 = require("../models/ResearchStation.model");
const Mission_model_1 = require("../models/Mission.model");
dotenv_1.default.config();
const NODE_ENV = process.env.NODE_ENV || 'development';
const DATABASE_URL = process.env.DATABASE_URL;
const models = [
    User_model_1.User,
    Charity_model_1.Charity,
    Donation_model_1.Donation,
    Receipt_model_1.Receipt,
    BlockchainTransaction_model_1.BlockchainTransaction,
    NZCompany_model_1.NZCompany,
    IRDCompliantDonation_model_1.IRDCompliantDonation,
    Project_model_1.Project,
    Collectable_model_1.Collectable,
    UserCollectable_model_1.UserCollectable,
    Reward_model_1.Reward,
    UserReward_model_1.UserReward,
    PolarBear_model_1.PolarBear,
    ClimateZone_model_1.ClimateZone,
    ResearchStation_model_1.ResearchStation,
    Mission_model_1.Mission,
];
function createSequelizeInstance() {
    // If DATABASE_URL is provided (Railway), use it directly
    if (DATABASE_URL) {
        console.log('Using DATABASE_URL for PostgreSQL connection');
        return new sequelize_typescript_1.Sequelize(DATABASE_URL, {
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
                min: 2, // Keep some connections warm
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
        return new sequelize_typescript_1.Sequelize({
            dialect: 'sqlite',
            storage: process.env.DB_PATH || path_1.default.join(process.cwd(), 'database.sqlite'),
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
    return new sequelize_typescript_1.Sequelize({
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
exports.sequelize = createSequelizeInstance();
//# sourceMappingURL=database.js.map
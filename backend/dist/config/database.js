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
dotenv_1.default.config();
const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_TYPE = process.env.DB_TYPE || 'sqlite';
const sqliteConfig = {
    dialect: 'sqlite',
    storage: process.env.DB_PATH || path_1.default.join(process.cwd(), 'database.sqlite'),
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
    dialect: 'postgres',
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
const env = NODE_ENV;
const dbConfig = config[env];
exports.sequelize = new sequelize_typescript_1.Sequelize({
    ...dbConfig,
    models: [User_model_1.User, Charity_model_1.Charity, Donation_model_1.Donation, Receipt_model_1.Receipt, BlockchainTransaction_model_1.BlockchainTransaction, NZCompany_model_1.NZCompany, IRDCompliantDonation_model_1.IRDCompliantDonation, Project_model_1.Project],
    define: {
        timestamps: true,
        underscored: true,
    },
});
//# sourceMappingURL=database.js.map
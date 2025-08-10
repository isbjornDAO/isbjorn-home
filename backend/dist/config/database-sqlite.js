"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_TYPE = process.env.DB_TYPE || 'postgres';
// SQLite configuration for local development
const sqliteConfig = {
    dialect: 'sqlite',
    storage: process.env.DB_PATH || path_1.default.join(process.cwd(), 'database.sqlite'),
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
    dialect: 'postgres',
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
exports.sequelize = new sequelize_typescript_1.Sequelize({
    ...config,
    models: [path_1.default.join(__dirname, '../models')],
    modelMatch: (filename, member) => {
        return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
    },
});
//# sourceMappingURL=database-sqlite.js.map
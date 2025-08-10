"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const NODE_ENV = process.env.NODE_ENV || 'development';
// Simple SQLite configuration for local development
const config = {
    dialect: 'sqlite',
    storage: path_1.default.join(process.cwd(), 'data', 'isbjorn_dev.sqlite'),
    logging: NODE_ENV === 'development' ? console.log : false,
    define: {
        timestamps: true,
        underscored: false,
    },
};
exports.default = config;
//# sourceMappingURL=database.simple.js.map
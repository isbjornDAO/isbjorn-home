"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const path_1 = __importDefault(require("path"));
exports.sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'sqlite',
    storage: path_1.default.join(process.cwd(), 'database.sqlite'),
    logging: false,
    models: [
        path_1.default.join(__dirname, '../models/User.model.ts'),
        path_1.default.join(__dirname, '../models/Charity.model.ts'),
        path_1.default.join(__dirname, '../models/NZCompany.model.ts'),
        path_1.default.join(__dirname, '../models/Project.model.ts'),
        path_1.default.join(__dirname, '../models/Donation.model.ts'),
        path_1.default.join(__dirname, '../models/IRDCompliantDonation.model.ts'),
        path_1.default.join(__dirname, '../models/Receipt.model.ts'),
        path_1.default.join(__dirname, '../models/BlockchainTransaction.model.ts'),
    ],
});
//# sourceMappingURL=database-simple.js.map
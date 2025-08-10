"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_simple_1 = __importDefault(require("../config/database.simple"));
const logger_1 = require("../utils/logger");
// Import all models
const User_model_1 = __importDefault(require("../models/User.model"));
const Charity_model_1 = __importDefault(require("../models/Charity.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
const Donation_model_1 = __importDefault(require("../models/Donation.model"));
const Receipt_model_1 = __importDefault(require("../models/Receipt.model"));
const IRDCompliantDonation_model_1 = __importDefault(require("../models/IRDCompliantDonation.model"));
const BlockchainTransaction_model_1 = __importDefault(require("../models/BlockchainTransaction.model"));
const NZCompany_model_1 = __importDefault(require("../models/NZCompany.model"));
class DatabaseMigrator {
    sequelize;
    constructor() {
        this.sequelize = new sequelize_1.Sequelize(database_simple_1.default);
    }
    async migrate() {
        try {
            logger_1.logger.info('Starting database migration...');
            // Test database connection
            await this.sequelize.authenticate();
            logger_1.logger.info('Database connection established successfully.');
            // Add models to sequelize instance
            this.sequelize.addModels([
                User_model_1.default,
                Charity_model_1.default,
                Project_model_1.default,
                Donation_model_1.default,
                Receipt_model_1.default,
                IRDCompliantDonation_model_1.default,
                BlockchainTransaction_model_1.default,
                NZCompany_model_1.default
            ]);
            // Sync database
            await this.sequelize.sync({ alter: true });
            logger_1.logger.info('🎉 Database migration completed successfully!');
        }
        catch (error) {
            logger_1.logger.error('❌ Database migration failed:', error);
            throw error;
        }
    }
    async close() {
        await this.sequelize.close();
    }
}
// Run migration if called directly
if (require.main === module) {
    const migrator = new DatabaseMigrator();
    migrator.migrate()
        .then(() => {
        logger_1.logger.info('Migration completed successfully');
        process.exit(0);
    })
        .catch((error) => {
        logger_1.logger.error('Migration failed:', error);
        process.exit(1);
    });
}
exports.default = DatabaseMigrator;
//# sourceMappingURL=migrate.js.map
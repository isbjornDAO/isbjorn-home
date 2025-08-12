"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
class DatabaseMigrator {
    sequelize = database_1.sequelize;
    async migrate() {
        try {
            logger_1.logger.info('Starting database migration...');
            // Test database connection
            await this.sequelize.authenticate();
            logger_1.logger.info('Database connection established successfully.');
            // Sync database
            await this.sequelize.sync({ force: true });
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
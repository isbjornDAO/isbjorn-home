import { sequelize } from '../config/database';
import { logger } from '../utils/logger';

class DatabaseMigrator {
  private sequelize = sequelize;

  async migrate(): Promise<void> {
    try {
      logger.info('Starting database migration...');

      // Test database connection
      await this.sequelize.authenticate();
      logger.info('Database connection established successfully.');

      // Sync database
      await this.sequelize.sync({ force: true });
      logger.info('🎉 Database migration completed successfully!');

    } catch (error) {
      logger.error('❌ Database migration failed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.sequelize.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  const migrator = new DatabaseMigrator();
  
  migrator.migrate()
    .then(() => {
      logger.info('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration failed:', error);
      process.exit(1);
    });
}

export default DatabaseMigrator;
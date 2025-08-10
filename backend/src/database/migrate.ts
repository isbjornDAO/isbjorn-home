import { Sequelize } from 'sequelize';
import config from '../config/database.simple';
import { logger } from '../utils/logger';

// Import all models
import User from '../models/User.model';
import Charity from '../models/Charity.model';
import Project from '../models/Project.model';
import Donation from '../models/Donation.model';
import Receipt from '../models/Receipt.model';
import IRDCompliantDonation from '../models/IRDCompliantDonation.model';
import BlockchainTransaction from '../models/BlockchainTransaction.model';
import NZCompany from '../models/NZCompany.model';

class DatabaseMigrator {
  private sequelize: Sequelize;

  constructor() {
    this.sequelize = new Sequelize(config);
  }

  async migrate(): Promise<void> {
    try {
      logger.info('Starting database migration...');

      // Test database connection
      await this.sequelize.authenticate();
      logger.info('Database connection established successfully.');

      // Add models to sequelize instance
      this.sequelize.addModels([
        User,
        Charity,
        Project,
        Donation,
        Receipt,
        IRDCompliantDonation,
        BlockchainTransaction,
        NZCompany
      ]);

      // Sync database
      await this.sequelize.sync({ alter: true });
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
import { sequelize } from '../config/database';
import Charity from '../models/Charity.model';
import { logger } from '../utils/logger';

async function resetCharityStats() {
  try {
    logger.info('Connecting to database...');
    await sequelize.authenticate();
    logger.info('Database connection established');

    logger.info('Resetting all charity stats to 0...');

    const [affectedRows] = await sequelize.query(`
      UPDATE charities
      SET "totalReceived" = 0,
          "donationCount" = 0,
          "updatedAt" = NOW()
    `);

    logger.info(`✅ Reset stats for all charities`);

    // Verify the reset
    const charities = await Charity.findAll({
      attributes: ['name', 'totalReceived', 'donationCount']
    });

    logger.info('Current charity stats:');
    charities.forEach(c => {
      logger.info(`  - ${c.name}: $${c.totalReceived} (${c.donationCount} donations)`);
    });

    logger.info('✅ Charity stats reset complete!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to reset charity stats:', error);
    process.exit(1);
  }
}

resetCharityStats();

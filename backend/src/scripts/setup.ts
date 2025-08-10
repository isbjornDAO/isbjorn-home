#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import DatabaseMigrator from '../database/migrate';
import DatabaseSeeder from '../database/seed';
import { logger } from '../utils/logger';

class SetupScript {
  
  async setupDirectories(): Promise<void> {
    const directories = [
      'data',
      'uploads',
      'logs',
      'temp'
    ];

    for (const dir of directories) {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        logger.info(`✅ Created directory: ${dir}`);
      }
    }
  }

  async setupEnvironment(): Promise<void> {
    const envPath = path.join(process.cwd(), '.env');
    const envDevPath = path.join(process.cwd(), '.env.development');
    
    if (!fs.existsSync(envPath) && fs.existsSync(envDevPath)) {
      fs.copyFileSync(envDevPath, envPath);
      logger.info('✅ Copied .env.development to .env');
    }
  }

  async run(): Promise<void> {
    try {
      logger.info('🚀 Starting Isbjorn Platform Setup...');
      
      // Setup directories
      await this.setupDirectories();
      
      // Setup environment
      await this.setupEnvironment();
      
      // Migrate database
      const migrator = new DatabaseMigrator();
      await migrator.migrate();
      await migrator.close();
      
      // Seed database
      const seeder = new DatabaseSeeder();
      await seeder.seedAll();
      
      logger.info('🎉 Setup completed successfully!');
      logger.info('');
      logger.info('Next steps:');
      logger.info('1. Update .env with your API keys (Stripe, SendGrid, etc.)');
      logger.info('2. Run: npm run dev');
      logger.info('3. Open: http://localhost:5000/api/docs for API documentation');
      logger.info('');
      logger.info('Default admin login:');
      logger.info('Email: admin@isbjorn.co.nz');
      logger.info('Password: admin123');
      
    } catch (error) {
      logger.error('❌ Setup failed:', error);
      throw error;
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new SetupScript();
  
  setup.run()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Setup failed:', error);
      process.exit(1);
    });
}

export default SetupScript;
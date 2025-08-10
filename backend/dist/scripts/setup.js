#!/usr/bin/env tsx
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const migrate_1 = __importDefault(require("../database/migrate"));
const seed_1 = __importDefault(require("../database/seed"));
const logger_1 = require("../utils/logger");
class SetupScript {
    async setupDirectories() {
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
                logger_1.logger.info(`✅ Created directory: ${dir}`);
            }
        }
    }
    async setupEnvironment() {
        const envPath = path.join(process.cwd(), '.env');
        const envDevPath = path.join(process.cwd(), '.env.development');
        if (!fs.existsSync(envPath) && fs.existsSync(envDevPath)) {
            fs.copyFileSync(envDevPath, envPath);
            logger_1.logger.info('✅ Copied .env.development to .env');
        }
    }
    async run() {
        try {
            logger_1.logger.info('🚀 Starting Isbjorn Platform Setup...');
            // Setup directories
            await this.setupDirectories();
            // Setup environment
            await this.setupEnvironment();
            // Migrate database
            const migrator = new migrate_1.default();
            await migrator.migrate();
            await migrator.close();
            // Seed database
            const seeder = new seed_1.default();
            await seeder.seedAll();
            logger_1.logger.info('🎉 Setup completed successfully!');
            logger_1.logger.info('');
            logger_1.logger.info('Next steps:');
            logger_1.logger.info('1. Update .env with your API keys (Stripe, SendGrid, etc.)');
            logger_1.logger.info('2. Run: npm run dev');
            logger_1.logger.info('3. Open: http://localhost:5000/api/docs for API documentation');
            logger_1.logger.info('');
            logger_1.logger.info('Default admin login:');
            logger_1.logger.info('Email: admin@isbjorn.co.nz');
            logger_1.logger.info('Password: admin123');
        }
        catch (error) {
            logger_1.logger.error('❌ Setup failed:', error);
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
        logger_1.logger.error('Setup failed:', error);
        process.exit(1);
    });
}
exports.default = SetupScript;
//# sourceMappingURL=setup.js.map
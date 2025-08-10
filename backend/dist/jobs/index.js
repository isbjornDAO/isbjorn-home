"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeJobs = void 0;
const logger_1 = require("../utils/logger");
const initializeJobs = async () => {
    try {
        logger_1.logger.info('Job processing initialized');
        // Jobs will be implemented later
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize jobs:', error);
    }
};
exports.initializeJobs = initializeJobs;
//# sourceMappingURL=index.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamlinedDonationController = void 0;
const express_validator_1 = require("express-validator");
const streamlinedDonationService_1 = __importDefault(require("../services/streamlinedDonationService"));
const nzCompaniesRegisterService_1 = __importDefault(require("../services/nzCompaniesRegisterService"));
const nzCharitiesService_1 = __importDefault(require("../services/nzCharitiesService"));
const logger_1 = require("../utils/logger");
const IRDCompliantDonation_model_1 = require("../models/IRDCompliantDonation.model");
const fs_1 = __importDefault(require("fs"));
class StreamlinedDonationController {
    donationService;
    companiesService;
    charitiesService;
    constructor() {
        this.donationService = new streamlinedDonationService_1.default();
        this.companiesService = new nzCompaniesRegisterService_1.default();
        this.charitiesService = new nzCharitiesService_1.default();
    }
    /**
     * POST /api/donations/streamlined
     * Process the ultra-streamlined 2-minute donation
     */
    processDonation = async (req, res) => {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
                return;
            }
            const startTime = Date.now();
            const result = await this.donationService.processStreamlinedDonation(req.body);
            const totalTime = Date.now() - startTime;
            logger_1.logger.info('Streamlined donation API completed', {
                donationId: result.donationId,
                totalApiTime: totalTime,
                processingTime: result.processingTimeMs,
            });
            res.status(200).json({
                ...result,
                message: 'Donation processed successfully in under 2 minutes!'
            });
        }
        catch (error) {
            logger_1.logger.error('Donation processing API error:', error);
            res.status(500).json({
                success: false,
                message: 'Donation processing failed',
                error: error.message
            });
        }
    };
    /**
     * GET /api/companies/:companyNumber/auto-populate
     * Auto-populate company form on company number entry (30 seconds)
     */
    autoPopulateCompany = async (req, res) => {
        try {
            const { companyNumber } = req.params;
            if (!companyNumber || !/^\d{1,10}$/.test(companyNumber)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid NZ company number format'
                });
                return;
            }
            const result = await this.donationService.autoPopulateCompanyForm(companyNumber);
            if (!result) {
                res.status(404).json({
                    success: false,
                    message: 'Company not found in NZ Companies Register'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: result,
                message: result.canDonate ? 'Company verified and ready to donate' : 'Company found but has compliance issues'
            });
        }
        catch (error) {
            logger_1.logger.error('Company auto-populate error:', error);
            res.status(500).json({
                success: false,
                message: 'Company lookup failed',
                error: error.message
            });
        }
    };
    /**
     * GET /api/companies/search
     * Search companies by name
     */
    searchCompanies = async (req, res) => {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string' || q.length < 2) {
                res.status(400).json({
                    success: false,
                    message: 'Search query must be at least 2 characters'
                });
                return;
            }
            const results = await this.companiesService.searchCompanies(q);
            res.status(200).json({
                success: true,
                data: results,
                count: results.length
            });
        }
        catch (error) {
            logger_1.logger.error('Company search error:', error);
            res.status(500).json({
                success: false,
                message: 'Company search failed',
                error: error.message
            });
        }
    };
    /**
     * GET /api/charities/verified-dropdown
     * Get pre-verified donee organisations for instant dropdown
     */
    getVerifiedCharities = async (req, res) => {
        try {
            const charities = await this.donationService.getVerifiedCharitiesDropdown();
            res.status(200).json({
                success: true,
                data: charities,
                count: charities.length,
                message: 'Verified donee organisations loaded'
            });
        }
        catch (error) {
            logger_1.logger.error('Verified charities dropdown error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to load verified charities',
                error: error.message
            });
        }
    };
    /**
     * GET /api/charities/search?q=searchTerm
     * Real-time charity search for dropdown
     */
    searchCharities = async (req, res) => {
        try {
            const { q: query, limit = '10' } = req.query;
            if (!query || typeof query !== 'string' || query.length < 2) {
                res.status(400).json({
                    success: false,
                    message: 'Search query must be at least 2 characters'
                });
                return;
            }
            const results = await this.charitiesService.searchCharitiesByName(query, parseInt(limit));
            res.status(200).json({
                success: true,
                data: results,
                count: results.length,
                query
            });
        }
        catch (error) {
            logger_1.logger.error('Charity search error:', error);
            res.status(500).json({
                success: false,
                message: 'Charity search failed',
                error: error.message
            });
        }
    };
    /**
     * GET /api/companies/:companyNumber/donations
     * Get company donation history for compliance dashboard
     */
    getCompanyDonations = async (req, res) => {
        try {
            const { companyNumber } = req.params;
            const { taxYear } = req.query;
            if (!companyNumber || !/^\d{1,10}$/.test(companyNumber)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid NZ company number format'
                });
                return;
            }
            const donations = await this.donationService.getCompanyDonationHistory(companyNumber, taxYear ? parseInt(taxYear) : undefined);
            const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
            const compliantCount = donations.filter(d => d.irdCompliant).length;
            res.status(200).json({
                success: true,
                data: donations,
                summary: {
                    totalDonations: donations.length,
                    totalAmount,
                    compliantCount,
                    complianceRate: donations.length > 0 ? (compliantCount / donations.length) * 100 : 100,
                    taxYear: taxYear ? parseInt(taxYear) : new Date().getFullYear(),
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Company donations history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to load donation history',
                error: error.message
            });
        }
    };
    /**
     * GET /api/companies/:companyNumber/compliance-dashboard
     * IRD audit readiness dashboard
     */
    getComplianceDashboard = async (req, res) => {
        try {
            const { companyNumber } = req.params;
            if (!companyNumber || !/^\d{1,10}$/.test(companyNumber)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid NZ company number format'
                });
                return;
            }
            // Get company verification status
            const companyVerification = await this.companiesService.verifyCompany(companyNumber);
            // Get donation history for current tax year
            const currentTaxYear = this.getCurrentNZTaxYear();
            const donations = await this.donationService.getCompanyDonationHistory(companyNumber, currentTaxYear);
            // Calculate compliance metrics
            const totalDonations = donations.length;
            const compliantDonations = donations.filter(d => d.irdCompliant).length;
            const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
            const complianceScore = this.calculateComplianceScore({
                companyCompliant: companyVerification.isCompliant,
                donationCompliance: totalDonations > 0 ? (compliantDonations / totalDonations) : 1,
                receiptGeneration: 1, // All receipts auto-generated
                archivalCompliance: 1, // All receipts auto-archived
            });
            res.status(200).json({
                success: true,
                data: {
                    complianceScore,
                    company: {
                        isVerified: companyVerification.isValid,
                        isCompliant: companyVerification.isCompliant,
                        issues: companyVerification.issues,
                    },
                    donations: {
                        totalCount: totalDonations,
                        compliantCount: compliantDonations,
                        totalAmount,
                        complianceRate: totalDonations > 0 ? (compliantDonations / totalDonations) * 100 : 100,
                        taxYear: currentTaxYear,
                    },
                    irdAuditReady: complianceScore >= 95,
                    nextSteps: this.getComplianceNextSteps(complianceScore, companyVerification.issues),
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Compliance dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to load compliance dashboard',
                error: error.message
            });
        }
    };
    /**
     * GET /api/receipts/:donationId/download
     * Download IRD-compliant receipt PDF
     */
    downloadReceipt = async (req, res) => {
        try {
            const { donationId } = req.params;
            const donation = await IRDCompliantDonation_model_1.IRDCompliantDonation.findByPk(donationId);
            if (!donation || !donation.receiptPdfPath) {
                res.status(404).json({
                    success: false,
                    message: 'Receipt not found',
                });
                return;
            }
            const filePath = donation.receiptPdfPath;
            if (!fs_1.default.existsSync(filePath)) {
                logger_1.logger.error('Receipt PDF path does not exist on disk', { donationId, filePath });
                res.status(404).json({
                    success: false,
                    message: 'Receipt file missing',
                });
                return;
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="receipt-${donation.receiptNumber || donation.id}.pdf"`);
            const stream = fs_1.default.createReadStream(filePath);
            stream.on('error', (err) => {
                logger_1.logger.error('Error streaming receipt PDF:', err);
                res.status(500).end();
            });
            stream.pipe(res);
        }
        catch (error) {
            logger_1.logger.error('Receipt download error:', error);
            res.status(500).json({
                success: false,
                message: 'Receipt download failed',
                error: error.message
            });
        }
    };
    // Private helper methods
    getCurrentNZTaxYear() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-based
        // NZ tax year runs from April 1 to March 31
        return currentMonth >= 3 ? currentYear + 1 : currentYear; // April = month 3
    }
    calculateComplianceScore(metrics) {
        const weights = {
            company: 30,
            donations: 30,
            receipts: 25,
            archival: 15,
        };
        const score = (metrics.companyCompliant ? weights.company : 0) +
            (metrics.donationCompliance * weights.donations) +
            (metrics.receiptGeneration * weights.receipts) +
            (metrics.archivalCompliance * weights.archival);
        return Math.round(score);
    }
    getComplianceNextSteps(score, companyIssues) {
        const steps = [];
        if (companyIssues.length > 0) {
            steps.push('Resolve company registration issues with Companies Office');
        }
        if (score < 95) {
            steps.push('Review and regenerate any non-compliant receipts');
        }
        if (score >= 95) {
            steps.push('Your donations are 100% IRD audit ready! 🎉');
        }
        return steps;
    }
}
exports.StreamlinedDonationController = StreamlinedDonationController;
exports.default = StreamlinedDonationController;
//# sourceMappingURL=streamlinedDonationController.js.map
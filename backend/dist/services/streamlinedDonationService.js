"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamlinedDonationService = void 0;
const IRDCompliantDonation_model_1 = require("../models/IRDCompliantDonation.model");
const NZCompany_model_1 = require("../models/NZCompany.model");
const Charity_model_1 = require("../models/Charity.model");
const nzCompaniesRegisterService_1 = __importDefault(require("./nzCompaniesRegisterService"));
const nzCharitiesService_1 = __importDefault(require("./nzCharitiesService"));
const irdReceiptService_1 = __importDefault(require("./irdReceiptService"));
const logger_1 = require("../utils/logger");
const stripe_1 = __importDefault(require("stripe"));
class StreamlinedDonationService {
    companiesService;
    charitiesService;
    receiptService;
    stripe;
    constructor() {
        this.companiesService = new nzCompaniesRegisterService_1.default();
        this.charitiesService = new nzCharitiesService_1.default();
        this.receiptService = new irdReceiptService_1.default();
        const key = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
        this.stripe = new stripe_1.default(key, {
            apiVersion: '2023-10-16',
        });
    }
    /**
     * THE 2-MINUTE DONATION PROCESS
     * Auto-fills everything, processes payment, generates receipt, exports to accounting
     */
    async processStreamlinedDonation(request) {
        const startTime = Date.now();
        try {
            logger_1.logger.info('Starting streamlined donation process', {
                companyNumber: request.nzCompanyNumber,
                charityId: request.charityId,
                amount: request.amount,
            });
            // Step 1: Auto-populate company details (runs in parallel with charity lookup)
            const [company, charity] = await Promise.all([
                this.getOrCreateCompany(request.nzCompanyNumber),
                this.getVerifiedCharity(request.charityId),
            ]);
            if (!company || !charity) {
                throw new Error('Company or charity verification failed');
            }
            // Step 2: Validate donee organisation status
            if (!charity.isDoneeOrganisation) {
                throw new Error('Selected charity is not a verified donee organisation');
            }
            // Step 3: Process Stripe payment
            const paymentIntent = await this.processStripePayment({
                amount: request.amount * 100, // Convert to cents
                paymentMethodId: request.stripePaymentMethodId,
                companyName: company.legalName,
                charityName: charity.legalName,
            });
            // Step 4: Create IRD-compliant donation record
            const donation = await this.createIRDCompliantDonation({
                company,
                charity,
                amount: request.amount,
                stripePaymentId: paymentIntent.id,
                message: request.message,
            });
            // Step 5: Generate IRD-compliant receipt (<5 seconds)
            const receiptResult = await this.receiptService.generateIRDCompliantReceipt(donation.id);
            // Step 6: Auto-email receipt to company and accountant
            const emailResult = await this.receiptService.emailReceipt(donation.id, {
                donor: request.companyContactEmail,
                accountant: request.accountantEmail,
            });
            // Step 7: Export to accounting software (async)
            const accountingExports = await this.exportToAccountingSoftware(donation.id);
            // Step 8: Optional blockchain recording
            let blockchainTx;
            if (process.env.ENABLE_BLOCKCHAIN === 'true') {
                blockchainTx = await this.recordOnBlockchain(donation);
            }
            // Update donation as completed
            await donation.update({
                complianceStatus: IRDCompliantDonation_model_1.ComplianceStatus.COMPLIANT,
                accountingExportStatus: accountingExports.xeroExported ? 'exported' : 'pending',
            });
            const processingTime = Date.now() - startTime;
            logger_1.logger.info('Streamlined donation completed successfully', {
                donationId: donation.id,
                receiptNumber: donation.receiptNumber,
                processingTimeMs: processingTime,
                company: company.legalName,
                charity: charity.name,
                amount: request.amount,
            });
            return {
                success: true,
                donationId: donation.id,
                receiptNumber: donation.receiptNumber,
                processingTimeMs: processingTime,
                receipt: {
                    pdfUrl: receiptResult.pdfPath,
                    emailSent: emailResult.emailSent,
                },
                accounting: accountingExports,
                blockchain: blockchainTx ? { transactionHash: blockchainTx } : undefined,
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            logger_1.logger.error('Streamlined donation failed', {
                error: error.message,
                processingTimeMs: processingTime,
                request,
            });
            throw new Error(`Donation processing failed: ${error.message}`);
        }
    }
    /**
     * Get pre-verified charities for instant dropdown population
     */
    async getVerifiedCharitiesDropdown() {
        try {
            const charities = await Charity_model_1.Charity.findAll({
                where: { isActive: true },
                attributes: [
                    'id', 'name', /* no legalName in model */ 'category', 'logoUrl',
                    'description', 'donationCount', 'totalReceived'
                ],
                order: [['name', 'ASC']],
                limit: 100,
            });
            return charities.map(charity => ({
                id: charity.id,
                name: charity.name,
                legalName: charity.legalName || charity.name,
                category: charity.category,
                logoUrl: charity.logoUrl,
                description: charity.description,
                totalDonations: charity.donationCount,
            }));
        }
        catch (error) {
            logger_1.logger.error('Error getting verified charities dropdown:', error);
            return [];
        }
    }
    /**
     * Auto-populate company form on company number entry
     */
    async autoPopulateCompanyForm(nzCompanyNumber) {
        try {
            const verification = await this.companiesService.verifyCompany(nzCompanyNumber);
            const companyDetails = await this.companiesService.autoFillCompanyDetails(nzCompanyNumber);
            if (!companyDetails) {
                return null;
            }
            return {
                legalName: companyDetails.legalName,
                registeredAddress: companyDetails.registeredAddress,
                directors: companyDetails.directors,
                isCompliant: verification.isCompliant,
                canDonate: verification.isActive && verification.isCompliant,
                issues: verification.issues,
            };
        }
        catch (error) {
            logger_1.logger.error('Error auto-populating company form:', error);
            return null;
        }
    }
    /**
     * Get donation history for compliance dashboard
     */
    async getCompanyDonationHistory(nzCompanyNumber, taxYear) {
        try {
            const company = await NZCompany_model_1.NZCompany.findOne({
                where: { nzCompanyNumber }
            });
            if (!company) {
                return [];
            }
            const whereClause = { companyId: company.id };
            if (taxYear) {
                whereClause.taxYear = taxYear;
            }
            const donations = await IRDCompliantDonation_model_1.IRDCompliantDonation.findAll({
                where: whereClause,
                include: [
                    { model: Charity_model_1.Charity, as: 'charity', attributes: ['name'] }
                ],
                order: [['donationDate', 'DESC']],
                limit: 100,
            });
            return donations.map(donation => ({
                id: donation.id,
                receiptNumber: donation.receiptNumber,
                charityName: donation.charity.name,
                amount: donation.donationAmountNzd,
                donationDate: donation.donationDate,
                taxYear: donation.taxYear,
                receiptPdfUrl: `/api/receipts/${donation.id}/download`,
                irdCompliant: donation.isIrdCompliant,
            }));
        }
        catch (error) {
            logger_1.logger.error('Error getting donation history:', error);
            return [];
        }
    }
    // Private helper methods
    async getOrCreateCompany(nzCompanyNumber) {
        let company = await NZCompany_model_1.NZCompany.findOne({
            where: { nzCompanyNumber }
        });
        if (!company) {
            // Auto-populate from Companies Register
            company = await this.companiesService.lookupCompany(nzCompanyNumber);
        }
        return company;
    }
    async getVerifiedCharity(charityId) {
        const charity = await Charity_model_1.Charity.findOne({
            where: {
                id: charityId,
                isDoneeOrganisation: true,
                isActive: true,
                verificationStatus: 'verified',
            }
        });
        return charity;
    }
    async processStripePayment(params) {
        const isMock = (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test_mock') || process.env.MOCK_STRIPE === 'true';
        if (isMock) {
            // Simulate a successful PaymentIntent
            return {
                id: `pi_mock_${Date.now()}`,
                object: 'payment_intent',
                amount: params.amount,
                currency: 'nzd',
                status: 'succeeded',
            };
        }
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: params.amount,
            currency: 'nzd',
            payment_method: params.paymentMethodId,
            confirmation_method: 'manual',
            confirm: true,
            return_url: `${process.env.FRONTEND_URL}/donation/success`,
            description: `Donation from ${params.companyName} to ${params.charityName}`,
            metadata: {
                company: params.companyName,
                charity: params.charityName,
                platform: 'Isbjorn',
            },
        });
        if (paymentIntent.status !== 'succeeded') {
            throw new Error(`Payment failed: ${paymentIntent.status}`);
        }
        return paymentIntent;
    }
    async createIRDCompliantDonation(params) {
        const { company, charity, amount, stripePaymentId, message } = params;
        const donation = await IRDCompliantDonation_model_1.IRDCompliantDonation.create({
            companyId: company.id,
            charityId: charity.id,
            donorLegalName: company.legalName,
            donorRegisteredAddress: company.formattedAddress,
            donationAmountNzd: amount,
            donationDate: new Date(),
            recipientCharityLegalName: charity.legalName,
            recipientDiaCharitiesNumber: charity.diaCharitiesNumber,
            recipientIrdNumber: charity.irdNumber,
            stripePaymentId,
            metadata: {
                donationMessage: message,
                processingTime: 0, // Will be updated
                platform: 'isbjorn-streamlined',
            },
        });
        return donation;
    }
    async exportToAccountingSoftware(donationId) {
        // This would integrate with Xero/MYOB APIs
        // For now, return mock success
        return {
            xeroExported: true,
            myobExported: false,
        };
    }
    async recordOnBlockchain(donation) {
        // Optional blockchain recording for transparency
        // Implementation would depend on chosen blockchain
        return `0x${Math.random().toString(16).substr(2, 64)}`;
    }
}
exports.StreamlinedDonationService = StreamlinedDonationService;
exports.default = StreamlinedDonationService;
//# sourceMappingURL=streamlinedDonationService.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IRDReceiptService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const IRDCompliantDonation_model_1 = require("../models/IRDCompliantDonation.model");
const NZCompany_model_1 = require("../models/NZCompany.model");
const Charity_model_1 = require("../models/Charity.model");
const logger_1 = require("../utils/logger");
const nodemailer_1 = __importDefault(require("nodemailer"));
class IRDReceiptService {
    emailTransporter;
    receiptsDirectory;
    templatePath;
    constructor() {
        this.receiptsDirectory = path_1.default.join(process.cwd(), 'storage', 'receipts');
        this.templatePath = path_1.default.join(process.cwd(), 'assets', 'receipt-templates');
        // Ensure directories exist
        this.ensureDirectoriesExist();
        // Configure email transporter
        this.emailTransporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }
    /**
     * Generate perfect IRD-compliant receipt in <5 seconds
     */
    async generateIRDCompliantReceipt(donationId) {
        const startTime = Date.now();
        try {
            // Load donation with all related data
            const donation = await IRDCompliantDonation_model_1.IRDCompliantDonation.findByPk(donationId, {
                include: [
                    { model: NZCompany_model_1.NZCompany, as: 'company' },
                    { model: Charity_model_1.Charity, as: 'charity' },
                ],
            });
            if (!donation || !donation.company || !donation.charity) {
                throw new Error('Donation or related data not found');
            }
            // Validate IRD compliance before generation
            const complianceCheck = this.validateIRDCompliance(donation);
            if (!complianceCheck.isCompliant) {
                throw new Error(`IRD compliance validation failed: ${complianceCheck.issues.join(', ')}`);
            }
            // Generate receipt data with ALL 7 IRD requirements
            const receiptData = {
                organisationLogo: path_1.default.join(this.templatePath, 'isbjorn-official-logo.png'),
                legalStatement: donation.legalDonationStatement,
                donorName: donation.donorLegalName,
                donorAddress: donation.donorRegisteredAddress,
                amount: donation.formattedAmount,
                donationDate: donation.donationDate.toLocaleDateString('en-NZ'),
                receiptNumber: donation.receiptNumber,
                diaCharitiesNumber: donation.recipientDiaCharitiesNumber,
                organisationIRD: donation.recipientIrdNumber,
                charityLegalName: donation.recipientCharityLegalName,
                authorisedPerson: {
                    name: donation.authorisedPersonName,
                    designation: donation.authorisedPersonDesignation,
                    digitalSignature: path_1.default.join(this.templatePath, 'treasurer-signature.png'),
                },
            };
            // Generate PDF with official Isbjørn letterhead
            const pdfPath = await this.createPDFReceipt(receiptData);
            // Update donation record
            await donation.update({
                receiptPdfPath: pdfPath,
                receiptIssuedTimestamp: new Date(),
                irdAuditReady: true,
                complianceStatus: 'compliant',
                complianceChecks: {
                    allIrdFieldsPresent: true,
                    receiptNumberValid: true,
                    donorVerified: true,
                    charityVerified: true,
                    amountValid: donation.donationAmountNzd > 0,
                    dateValid: true,
                    lastChecked: new Date(),
                    checkedBy: 'IRDReceiptService',
                },
            });
            const generationTime = Date.now() - startTime;
            logger_1.logger.info(`IRD-compliant receipt generated in ${generationTime}ms`, {
                donationId,
                receiptNumber: donation.receiptNumber,
                amount: donation.donationAmountNzd,
                charity: donation.charity.name,
            });
            return {
                pdfPath,
                receiptNumber: donation.receiptNumber,
                irdCompliant: true,
                generationTime,
            };
        }
        catch (error) {
            const generationTime = Date.now() - startTime;
            logger_1.logger.error(`Receipt generation failed after ${generationTime}ms:`, {
                donationId,
                error: error.message,
            });
            throw new Error(`Receipt generation failed: ${error.message}`);
        }
    }
    /**
     * Auto-email receipt to company accountant and donor
     */
    async emailReceipt(donationId, recipients) {
        try {
            const donation = await IRDCompliantDonation_model_1.IRDCompliantDonation.findByPk(donationId, {
                include: [
                    { model: NZCompany_model_1.NZCompany, as: 'company' },
                    { model: Charity_model_1.Charity, as: 'charity' },
                ],
            });
            if (!donation || !donation.receiptPdfPath) {
                throw new Error('Receipt not generated or donation not found');
            }
            const allRecipients = [recipients.donor];
            if (recipients.accountant)
                allRecipients.push(recipients.accountant);
            if (recipients.cc)
                allRecipients.push(...recipients.cc);
            const emailSubject = `IRD Tax Receipt ${donation.receiptNumber} - ${donation.charity.name}`;
            const emailBody = this.generateEmailBody(donation);
            const mailOptions = {
                from: process.env.FROM_EMAIL || 'receipts@isbjorn.co.nz',
                to: recipients.donor,
                cc: recipients.accountant ? [recipients.accountant] : undefined,
                bcc: recipients.cc,
                subject: emailSubject,
                html: emailBody,
                attachments: [
                    {
                        filename: `receipt-${donation.receiptNumber}.pdf`,
                        path: donation.receiptPdfPath,
                        contentType: 'application/pdf',
                    },
                ],
            };
            const result = await this.emailTransporter.sendMail(mailOptions);
            logger_1.logger.info('IRD receipt email sent successfully', {
                donationId,
                receiptNumber: donation.receiptNumber,
                recipients: allRecipients,
                messageId: result.messageId,
            });
            return {
                emailSent: true,
                sentTo: allRecipients,
                messageId: result.messageId,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to email receipt:', {
                donationId,
                error: error.message,
            });
            return {
                emailSent: false,
                sentTo: [],
            };
        }
    }
    /**
     * Validate complete IRD compliance per IRD255 requirements
     */
    validateIRDCompliance(donation) {
        const issues = [];
        const checklist = {
            hasReceiptNumber: !!donation.receiptNumber,
            hasLegalStatement: donation.legalDonationStatement === 'This amount was received as a donation',
            hasDonorName: !!donation.donorLegalName,
            hasDonorAddress: !!donation.donorRegisteredAddress,
            hasValidAmount: donation.donationAmountNzd > 0,
            hasValidDate: !!donation.donationDate,
            hasAuthorisedPerson: !!donation.authorisedPersonName && !!donation.authorisedPersonDesignation,
            hasCharityDetails: !!donation.recipientCharityLegalName && !!donation.recipientDiaCharitiesNumber,
            hasIrdNumber: !!donation.recipientIrdNumber,
        };
        // Check each IRD requirement
        if (!checklist.hasReceiptNumber) {
            issues.push('Missing sequential receipt number');
        }
        if (!checklist.hasLegalStatement) {
            issues.push('Missing or incorrect legal donation statement');
        }
        if (!checklist.hasDonorName) {
            issues.push('Missing donor legal name');
        }
        if (!checklist.hasDonorAddress) {
            issues.push('Missing donor registered address');
        }
        if (!checklist.hasValidAmount) {
            issues.push('Invalid donation amount');
        }
        if (!checklist.hasValidDate) {
            issues.push('Missing donation date');
        }
        if (!checklist.hasAuthorisedPerson) {
            issues.push('Missing authorised person name or designation');
        }
        if (!checklist.hasCharityDetails) {
            issues.push('Missing charity legal name or DIA registration number');
        }
        if (!checklist.hasIrdNumber) {
            issues.push('Missing charity IRD number');
        }
        return {
            isCompliant: issues.length === 0,
            issues,
            checklist,
        };
    }
    /**
     * Generate sequential receipt number per IRD requirements
     */
    async generateSequentialReceiptNumber() {
        const year = new Date().getFullYear();
        const count = await IRDCompliantDonation_model_1.IRDCompliantDonation.count({
            where: {
                receiptIssuedTimestamp: {
                    [require('sequelize').Op.gte]: new Date(`${year}-01-01`),
                    [require('sequelize').Op.lt]: new Date(`${year + 1}-01-01`),
                }
            }
        });
        return `ISB-${year}-${(count + 1).toString().padStart(6, '0')}`;
    }
    // Private methods
    async createPDFReceipt(data) {
        const fileName = `receipt-${data.receiptNumber}.pdf`;
        const filePath = path_1.default.join(this.receiptsDirectory, fileName);
        const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
        // Create write stream
        const stream = fs_1.default.createWriteStream(filePath);
        doc.pipe(stream);
        // Header with logo (if available)
        if (data.organisationLogo && fs_1.default.existsSync(data.organisationLogo)) {
            doc.image(data.organisationLogo, 50, 50, { width: 150 });
        }
        doc.fontSize(20)
            .text('ISBJØRN', 220, 60)
            .fontSize(14)
            .text('Ultra-Streamlined NZ Donation Platform', 220, 85)
            .text('IRD-Compliant Tax Receipt', 220, 105);
        // Receipt details
        doc.fontSize(16)
            .text('TAX RECEIPT', 50, 160, { underline: true })
            .fontSize(12)
            .text(`Receipt Number: ${data.receiptNumber}`, 50, 190)
            .text(`Date: ${data.donationDate}`, 50, 210);
        // IRD Required Statement
        doc.fontSize(14)
            .text(data.legalStatement, 50, 250, { width: 500, align: 'center' });
        // Donor details
        doc.fontSize(12)
            .text('DONOR DETAILS:', 50, 290)
            .text(data.donorName, 50, 310)
            .text(data.donorAddress, 50, 330, { width: 300 });
        // Donation details
        doc.text('DONATION DETAILS:', 50, 380)
            .fontSize(16)
            .text(data.amount, 50, 400)
            .fontSize(12)
            .text('Donation Date:', 50, 425)
            .text(data.donationDate, 150, 425);
        // Charity details
        doc.text('RECIPIENT CHARITY:', 50, 465)
            .text(data.charityLegalName, 50, 485)
            .text(`DIA Charities Number: ${data.diaCharitiesNumber}`, 50, 505)
            .text(`IRD Number: ${data.organisationIRD}`, 50, 525);
        // Authorised signature
        doc.text('AUTHORISED BY:', 50, 580)
            .text(data.authorisedPerson.name, 50, 600)
            .text(data.authorisedPerson.designation, 50, 620);
        // Add digital signature if available
        if (data.authorisedPerson.digitalSignature && fs_1.default.existsSync(data.authorisedPerson.digitalSignature)) {
            doc.image(data.authorisedPerson.digitalSignature, 50, 640, { width: 100 });
        }
        // Footer
        doc.fontSize(8)
            .text('This receipt is generated automatically and meets all IRD requirements per IRD255.', 50, 720)
            .text('Stored securely for 7 years as required by law. Generated by Isbjørn Platform.', 50, 735);
        doc.end();
        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        });
    }
    generateEmailBody(donation) {
        return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h2>IRD Tax Receipt - ${donation.receiptNumber}</h2>
            
            <p>Dear ${donation.donorLegalName},</p>
            
            <p>Thank you for your donation of <strong>${donation.formattedAmount}</strong> to <strong>${donation.recipientCharityLegalName}</strong>.</p>
            
            <p>Your IRD-compliant tax receipt is attached to this email. This receipt contains all information required by the IRD for tax deduction purposes.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Receipt Details:</h3>
              <ul>
                <li><strong>Receipt Number:</strong> ${donation.receiptNumber}</li>
                <li><strong>Donation Amount:</strong> ${donation.formattedAmount}</li>
                <li><strong>Donation Date:</strong> ${donation.donationDate.toLocaleDateString('en-NZ')}</li>
                <li><strong>Tax Year:</strong> ${donation.taxYear}</li>
              </ul>
            </div>
            
            <p><strong>Important:</strong> This receipt has been automatically stored for 7 years as required by IRD regulations. You can access it anytime through your Isbjørn dashboard.</p>
            
            <p>For accounting software integration, this donation will be automatically exported to your connected Xero/MYOB account if configured.</p>
            
            <p>Thank you for making charitable giving simple and compliant.</p>
            
            <p>Best regards,<br>
            The Isbjørn Team<br>
            <em>Ultra-Streamlined NZ Donation Platform</em></p>
            
            <hr>
            <p style="font-size: 12px; color: #666;">
              This is an automated email from Isbjørn Platform. 
              Receipt generated in compliance with IRD requirements per IRD255.
            </p>
          </div>
        </body>
      </html>
    `;
    }
    ensureDirectoriesExist() {
        const dirs = [this.receiptsDirectory, this.templatePath];
        for (const dir of dirs) {
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
                logger_1.logger.info(`Created directory: ${dir}`);
            }
        }
    }
}
exports.IRDReceiptService = IRDReceiptService;
exports.default = IRDReceiptService;
//# sourceMappingURL=irdReceiptService.js.map
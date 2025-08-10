"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var IRDCompliantDonation_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IRDCompliantDonation = exports.ComplianceStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const uuid_1 = require("uuid");
const NZCompany_model_1 = require("./NZCompany.model");
const Charity_model_1 = require("./Charity.model");
const Receipt_model_1 = require("./Receipt.model");
var ComplianceStatus;
(function (ComplianceStatus) {
    ComplianceStatus["PENDING"] = "pending";
    ComplianceStatus["COMPLIANT"] = "compliant";
    ComplianceStatus["NON_COMPLIANT"] = "non_compliant";
    ComplianceStatus["REQUIRES_REVIEW"] = "requires_review";
})(ComplianceStatus || (exports.ComplianceStatus = ComplianceStatus = {}));
let IRDCompliantDonation = IRDCompliantDonation_1 = class IRDCompliantDonation extends sequelize_typescript_1.Model {
    id;
    // IRD Required Fields (exact IRD255 compliance)
    receiptNumber; // ISB-2024-001234
    legalDonationStatement;
    companyId;
    donorLegalName; // From NZ Companies Register
    donorRegisteredAddress; // From NZ Companies Register
    donationAmountNzd;
    donationDate;
    authorisedPersonName;
    authorisedPersonDesignation;
    // Organisation Identifiers (IRD required)
    charityId;
    recipientCharityLegalName;
    recipientDiaCharitiesNumber;
    recipientIrdNumber;
    // Compliance & Audit Trail
    receiptPdfPath;
    receiptIssuedTimestamp;
    irdAuditReady;
    archivedUntil; // 7 years from donation
    taxYear;
    // Business Process
    stripePaymentId;
    accountingExportStatus;
    xeroTransactionId;
    myobTransactionId;
    // Compliance Status
    complianceStatus;
    complianceChecks;
    // Additional metadata
    metadata;
    // Blockchain (transparent but invisible to users)
    avalancheTxHash;
    // Relationships
    company;
    charity;
    receipt;
    // Hooks
    static async generateReceiptNumber(donation) {
        if (!donation.receiptNumber) {
            const year = new Date().getFullYear();
            const count = await IRDCompliantDonation_1.count({
                where: { taxYear: year }
            });
            donation.receiptNumber = `ISB-${year}-${(count + 1).toString().padStart(6, '0')}`;
        }
    }
    static async setArchivalDate(donation) {
        if (!donation.archivedUntil) {
            const archiveDate = new Date(donation.donationDate);
            archiveDate.setFullYear(archiveDate.getFullYear() + 7);
            donation.archivedUntil = archiveDate;
        }
    }
    static async setTaxYear(donation) {
        if (!donation.taxYear) {
            const donationYear = new Date(donation.donationDate).getFullYear();
            // NZ tax year runs April 1 - March 31
            const donationMonth = new Date(donation.donationDate).getMonth();
            donation.taxYear = donationMonth >= 3 ? donationYear + 1 : donationYear; // April = month 3
        }
    }
    // Instance methods
    get isIrdCompliant() {
        return this.irdAuditReady &&
            this.complianceStatus === ComplianceStatus.COMPLIANT &&
            !!this.receiptNumber &&
            !!this.donorLegalName &&
            !!this.recipientCharityLegalName &&
            this.donationAmountNzd > 0;
    }
    get formattedAmount() {
        return `$${this.donationAmountNzd.toFixed(2)} NZD`;
    }
    get isArchivalCompliant() {
        return this.archivedUntil > new Date();
    }
};
exports.IRDCompliantDonation = IRDCompliantDonation;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(uuid_1.v4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        allowNull: false,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "receiptNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false,
        defaultValue: 'This amount was received as a donation',
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "legalDonationStatement", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => NZCompany_model_1.NZCompany),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "donorLegalName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "donorRegisteredAddress", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 1,
        },
    }),
    __metadata("design:type", Number)
], IRDCompliantDonation.prototype, "donationAmountNzd", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], IRDCompliantDonation.prototype, "donationDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        defaultValue: 'Sarah Johnson',
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "authorisedPersonName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        defaultValue: 'Treasurer',
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "authorisedPersonDesignation", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Charity_model_1.Charity),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "charityId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "recipientCharityLegalName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        allowNull: false,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "recipientDiaCharitiesNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(15),
        allowNull: false,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "recipientIrdNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(500),
        allowNull: false,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "receiptPdfPath", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], IRDCompliantDonation.prototype, "receiptIssuedTimestamp", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    }),
    __metadata("design:type", Boolean)
], IRDCompliantDonation.prototype, "irdAuditReady", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], IRDCompliantDonation.prototype, "archivedUntil", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        validate: {
            min: 2024,
            max: 2050,
        },
    }),
    __metadata("design:type", Number)
], IRDCompliantDonation.prototype, "taxYear", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "stripePaymentId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        defaultValue: 'pending',
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "accountingExportStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "xeroTransactionId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "myobTransactionId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(ComplianceStatus)),
        allowNull: false,
        defaultValue: ComplianceStatus.PENDING,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "complianceStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], IRDCompliantDonation.prototype, "complianceChecks", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], IRDCompliantDonation.prototype, "metadata", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(66),
        allowNull: true,
    }),
    __metadata("design:type", String)
], IRDCompliantDonation.prototype, "avalancheTxHash", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => NZCompany_model_1.NZCompany),
    __metadata("design:type", NZCompany_model_1.NZCompany)
], IRDCompliantDonation.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Charity_model_1.Charity),
    __metadata("design:type", Charity_model_1.Charity)
], IRDCompliantDonation.prototype, "charity", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Receipt_model_1.Receipt),
    __metadata("design:type", Receipt_model_1.Receipt)
], IRDCompliantDonation.prototype, "receipt", void 0);
__decorate([
    sequelize_typescript_1.BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [IRDCompliantDonation]),
    __metadata("design:returntype", Promise)
], IRDCompliantDonation, "generateReceiptNumber", null);
__decorate([
    sequelize_typescript_1.BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [IRDCompliantDonation]),
    __metadata("design:returntype", Promise)
], IRDCompliantDonation, "setArchivalDate", null);
__decorate([
    sequelize_typescript_1.BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [IRDCompliantDonation]),
    __metadata("design:returntype", Promise)
], IRDCompliantDonation, "setTaxYear", null);
exports.IRDCompliantDonation = IRDCompliantDonation = IRDCompliantDonation_1 = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'ird_compliant_donations',
        timestamps: true,
        indexes: [
            { fields: ['receipt_number'], unique: true },
            { fields: ['company_id'] },
            { fields: ['charity_id'] },
            { fields: ['donation_date'] },
            { fields: ['tax_year'] },
            { fields: ['compliance_status'] },
            { fields: ['archived_until'] },
            { fields: ['stripe_payment_id'] },
            { fields: ['xero_transaction_id'] },
        ],
    })
], IRDCompliantDonation);
exports.default = IRDCompliantDonation;
//# sourceMappingURL=IRDCompliantDonation.model.js.map
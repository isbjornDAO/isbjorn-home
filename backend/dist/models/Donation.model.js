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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Donation = exports.DonationCurrency = exports.DonationStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const uuid_1 = require("uuid");
const User_model_1 = require("./User.model");
const Charity_model_1 = require("./Charity.model");
const Receipt_model_1 = require("./Receipt.model");
const NZCompany_model_1 = require("./NZCompany.model");
const Project_model_1 = require("./Project.model");
var DonationStatus;
(function (DonationStatus) {
    DonationStatus["PENDING"] = "pending";
    DonationStatus["PROCESSING"] = "processing";
    DonationStatus["COMPLETED"] = "completed";
    DonationStatus["FAILED"] = "failed";
    DonationStatus["REFUNDED"] = "refunded";
    DonationStatus["CANCELLED"] = "cancelled";
})(DonationStatus || (exports.DonationStatus = DonationStatus = {}));
var DonationCurrency;
(function (DonationCurrency) {
    DonationCurrency["NZD"] = "nzd";
    DonationCurrency["USD"] = "usd";
    DonationCurrency["AUD"] = "aud";
    DonationCurrency["EUR"] = "eur";
})(DonationCurrency || (exports.DonationCurrency = DonationCurrency = {}));
let Donation = class Donation extends sequelize_typescript_1.Model {
    userId;
    charityId;
    companyId;
    projectId;
    amount;
    currency;
    exchangeRate;
    usdAmount;
    status;
    stripePaymentId;
    stripePaymentIntentId;
    provider;
    sessionId;
    transactionId;
    charityName;
    donorName;
    donorEmail;
    blockchainTxHash;
    blockchainConfirmations;
    blockchainStatus;
    taxDeductible;
    message;
    isAnonymous;
    completedAt;
    refundedAt;
    refundReason;
    platformFee;
    stripeFee;
    blockchainFee;
    netAmount;
    metadata;
    failureReason;
    user;
    charity;
    company;
    project;
    receipt;
    get isCompleted() {
        return this.status === DonationStatus.COMPLETED;
    }
    get isPending() {
        return this.status === DonationStatus.PENDING;
    }
    get isFailed() {
        return this.status === DonationStatus.FAILED;
    }
};
exports.Donation = Donation;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(uuid_1.v4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Donation.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_model_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Charity_model_1.Charity),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "charityId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => NZCompany_model_1.NZCompany),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Project_model_1.Project),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "projectId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 1,
        },
    }),
    __metadata("design:type", Number)
], Donation.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(DonationCurrency)),
        allowNull: false,
        defaultValue: DonationCurrency.NZD,
    }),
    __metadata("design:type", String)
], Donation.prototype, "currency", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(15, 2),
        allowNull: true,
    }),
    __metadata("design:type", Number)
], Donation.prototype, "exchangeRate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(15, 2),
        allowNull: true,
    }),
    __metadata("design:type", Number)
], Donation.prototype, "usdAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(DonationStatus)),
        allowNull: false,
        defaultValue: DonationStatus.PENDING,
    }),
    __metadata("design:type", String)
], Donation.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "stripePaymentId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "stripePaymentIntentId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "provider", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "sessionId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "transactionId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "charityName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "donorName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "donorEmail", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "blockchainTxHash", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], Donation.prototype, "blockchainConfirmations", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "blockchainStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: true,
    }),
    __metadata("design:type", Boolean)
], Donation.prototype, "taxDeductible", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "message", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: false,
    }),
    __metadata("design:type", Boolean)
], Donation.prototype, "isAnonymous", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    }),
    __metadata("design:type", Date)
], Donation.prototype, "completedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    }),
    __metadata("design:type", Date)
], Donation.prototype, "refundedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "refundReason", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], Donation.prototype, "platformFee", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], Donation.prototype, "stripeFee", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], Donation.prototype, "blockchainFee", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(15, 2),
        allowNull: true,
    }),
    __metadata("design:type", Number)
], Donation.prototype, "netAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], Donation.prototype, "metadata", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Donation.prototype, "failureReason", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_model_1.User),
    __metadata("design:type", User_model_1.User)
], Donation.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Charity_model_1.Charity),
    __metadata("design:type", Charity_model_1.Charity)
], Donation.prototype, "charity", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => NZCompany_model_1.NZCompany),
    __metadata("design:type", NZCompany_model_1.NZCompany)
], Donation.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Project_model_1.Project),
    __metadata("design:type", Project_model_1.Project)
], Donation.prototype, "project", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Receipt_model_1.Receipt),
    __metadata("design:type", Receipt_model_1.Receipt)
], Donation.prototype, "receipt", void 0);
exports.Donation = Donation = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'donations',
        timestamps: true,
        indexes: [
            { fields: ['user_id'] },
            { fields: ['charity_id'] },
            { fields: ['company_id'] },
            { fields: ['project_id'] },
            { fields: ['status'] },
            { fields: ['created_at'] },
            { fields: ['stripe_payment_id'] },
            { fields: ['blockchain_tx_hash'] },
        ],
    })
], Donation);
exports.default = Donation;
//# sourceMappingURL=Donation.model.js.map
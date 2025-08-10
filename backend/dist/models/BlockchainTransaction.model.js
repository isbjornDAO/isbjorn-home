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
exports.BlockchainTransaction = exports.TransactionType = exports.TransactionStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const uuid_1 = require("uuid");
const Donation_model_1 = require("./Donation.model");
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["CONFIRMED"] = "confirmed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["DROPPED"] = "dropped";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["DONATION"] = "donation";
    TransactionType["DISTRIBUTION"] = "distribution";
    TransactionType["REFUND"] = "refund";
    TransactionType["ADMIN"] = "admin";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
let BlockchainTransaction = class BlockchainTransaction extends sequelize_typescript_1.Model {
    id;
    txHash;
    donationId;
    type;
    blockNumber;
    fromAddress;
    toAddress;
    value;
    gasLimit;
    gasUsed;
    gasPrice;
    gasFee;
    status;
    confirmations;
    blockTimestamp;
    nonce;
    input;
    logs;
    errorMessage;
    metadata;
    confirmedAt;
    retryCount;
    lastRetryAt;
    donation;
    get isConfirmed() {
        return this.status === TransactionStatus.CONFIRMED && this.confirmations >= 12;
    }
    get isPending() {
        return this.status === TransactionStatus.PENDING;
    }
    get isFailed() {
        return this.status === TransactionStatus.FAILED;
    }
    get explorerUrl() {
        const baseUrl = process.env.NODE_ENV === 'production'
            ? 'https://snowtrace.io'
            : 'https://testnet.snowtrace.io';
        return `${baseUrl}/tx/${this.txHash}`;
    }
};
exports.BlockchainTransaction = BlockchainTransaction;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(uuid_1.v4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "txHash", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Donation_model_1.Donation),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: true,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "donationId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(TransactionType)),
        allowNull: false,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
    }),
    __metadata("design:type", Number)
], BlockchainTransaction.prototype, "blockNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "fromAddress", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "toAddress", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "value", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "gasLimit", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "gasUsed", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "gasPrice", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "gasFee", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(TransactionStatus)),
        allowNull: false,
        defaultValue: TransactionStatus.PENDING,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], BlockchainTransaction.prototype, "confirmations", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    }),
    __metadata("design:type", Date)
], BlockchainTransaction.prototype, "blockTimestamp", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "nonce", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "input", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
    }),
    __metadata("design:type", Array)
], BlockchainTransaction.prototype, "logs", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], BlockchainTransaction.prototype, "errorMessage", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], BlockchainTransaction.prototype, "metadata", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    }),
    __metadata("design:type", Date)
], BlockchainTransaction.prototype, "confirmedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], BlockchainTransaction.prototype, "retryCount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    }),
    __metadata("design:type", Date)
], BlockchainTransaction.prototype, "lastRetryAt", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Donation_model_1.Donation),
    __metadata("design:type", Donation_model_1.Donation)
], BlockchainTransaction.prototype, "donation", void 0);
exports.BlockchainTransaction = BlockchainTransaction = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'blockchain_transactions',
        timestamps: true,
        indexes: [
            { fields: ['txHash'] },
            { fields: ['donationId'] },
            { fields: ['status'] },
            { fields: ['type'] },
            { fields: ['createdAt'] },
        ],
    })
], BlockchainTransaction);
exports.default = BlockchainTransaction;
//# sourceMappingURL=BlockchainTransaction.model.js.map
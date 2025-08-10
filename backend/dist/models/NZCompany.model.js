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
exports.NZCompany = exports.CompanyStatus = exports.CompanyType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const uuid_1 = require("uuid");
const Donation_model_1 = require("./Donation.model");
var CompanyType;
(function (CompanyType) {
    CompanyType["LIMITED"] = "Limited";
    CompanyType["UNLIMITED"] = "Unlimited";
    CompanyType["LIMITED_PARTNERSHIP"] = "Limited Partnership";
    CompanyType["INCORPORATED_SOCIETY"] = "Incorporated Society";
    CompanyType["CHARITABLE_TRUST"] = "Charitable Trust";
    CompanyType["UNIT_TRUST"] = "Unit Trust";
    CompanyType["OVERSEAS_COMPANY"] = "Overseas Company";
})(CompanyType || (exports.CompanyType = CompanyType = {}));
var CompanyStatus;
(function (CompanyStatus) {
    CompanyStatus["REGISTERED"] = "Registered";
    CompanyStatus["REMOVED"] = "Removed";
    CompanyStatus["LIQUIDATION"] = "Liquidation";
    CompanyStatus["RECEIVERSHIP"] = "Receivership";
})(CompanyStatus || (exports.CompanyStatus = CompanyStatus = {}));
let NZCompany = class NZCompany extends sequelize_typescript_1.Model {
    id;
    nzCompanyNumber;
    legalName;
    tradingName;
    companyType;
    companyStatus;
    irdNumber;
    gstNumber;
    registeredAddress;
    addressForService;
    incorporationDate;
    annualReturnFilingMonth;
    natureOfBusiness;
    directors;
    shareholders;
    isActive;
    isVerified;
    lastVerified;
    complianceChecks;
    metadata;
    donations;
    get formattedAddress() {
        const addr = this.registeredAddress;
        return [
            addr.street,
            addr.suburb,
            addr.city,
            addr.region,
            addr.postcode,
            addr.country
        ].filter(Boolean).join(', ');
    }
    get isCompliant() {
        return this.isActive &&
            this.isVerified &&
            this.companyStatus === CompanyStatus.REGISTERED &&
            (this.complianceChecks?.irdVerified ?? false);
    }
};
exports.NZCompany = NZCompany;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(uuid_1.v4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], NZCompany.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(10),
        allowNull: false,
        validate: {
            len: [1, 10],
            isNumeric: true,
        },
    }),
    __metadata("design:type", String)
], NZCompany.prototype, "nzCompanyNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], NZCompany.prototype, "legalName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true,
    }),
    __metadata("design:type", String)
], NZCompany.prototype, "tradingName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(CompanyType)),
        allowNull: false,
    }),
    __metadata("design:type", String)
], NZCompany.prototype, "companyType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(CompanyStatus)),
        allowNull: false,
        defaultValue: CompanyStatus.REGISTERED,
    }),
    __metadata("design:type", String)
], NZCompany.prototype, "companyStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(15),
        allowNull: true,
        validate: {
            len: [8, 15],
        },
    }),
    __metadata("design:type", String)
], NZCompany.prototype, "irdNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(15),
        allowNull: true,
        validate: {
            len: [9, 15],
        },
    }),
    __metadata("design:type", String)
], NZCompany.prototype, "gstNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: false,
    }),
    __metadata("design:type", Object)
], NZCompany.prototype, "registeredAddress", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], NZCompany.prototype, "addressForService", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
    }),
    __metadata("design:type", Date)
], NZCompany.prototype, "incorporationDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: true,
    }),
    __metadata("design:type", Date)
], NZCompany.prototype, "annualReturnFilingMonth", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.STRING),
        allowNull: true,
    }),
    __metadata("design:type", Array)
], NZCompany.prototype, "natureOfBusiness", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
    }),
    __metadata("design:type", Array)
], NZCompany.prototype, "directors", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
    }),
    __metadata("design:type", Array)
], NZCompany.prototype, "shareholders", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: true,
    }),
    __metadata("design:type", Boolean)
], NZCompany.prototype, "isActive", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: true,
    }),
    __metadata("design:type", Boolean)
], NZCompany.prototype, "isVerified", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], NZCompany.prototype, "lastVerified", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], NZCompany.prototype, "complianceChecks", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], NZCompany.prototype, "metadata", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Donation_model_1.Donation),
    __metadata("design:type", Array)
], NZCompany.prototype, "donations", void 0);
exports.NZCompany = NZCompany = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'nz_companies',
        timestamps: true,
        indexes: [
            { fields: ['nz_company_number'], unique: true },
            { fields: ['legal_name'] },
            { fields: ['ird_number'] },
            { fields: ['gst_number'] },
            { fields: ['company_status'] },
            { fields: ['last_verified'] },
        ],
    })
], NZCompany);
exports.default = NZCompany;
//# sourceMappingURL=NZCompany.model.js.map
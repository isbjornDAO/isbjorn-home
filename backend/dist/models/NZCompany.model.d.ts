import { Model } from 'sequelize-typescript';
import { Donation } from './Donation.model';
export declare enum CompanyType {
    LIMITED = "Limited",
    UNLIMITED = "Unlimited",
    LIMITED_PARTNERSHIP = "Limited Partnership",
    INCORPORATED_SOCIETY = "Incorporated Society",
    CHARITABLE_TRUST = "Charitable Trust",
    UNIT_TRUST = "Unit Trust",
    OVERSEAS_COMPANY = "Overseas Company"
}
export declare enum CompanyStatus {
    REGISTERED = "Registered",
    REMOVED = "Removed",
    LIQUIDATION = "Liquidation",
    RECEIVERSHIP = "Receivership"
}
export declare class NZCompany extends Model {
    id: string;
    nzCompanyNumber: string;
    legalName: string;
    tradingName?: string;
    companyType: CompanyType;
    companyStatus: CompanyStatus;
    irdNumber?: string;
    gstNumber?: string;
    registeredAddress: {
        street: string;
        suburb?: string;
        city: string;
        region: string;
        postcode?: string;
        country: string;
    };
    addressForService?: {
        street: string;
        suburb?: string;
        city: string;
        region: string;
        postcode?: string;
        country: string;
    };
    incorporationDate: Date;
    annualReturnFilingMonth?: Date;
    natureOfBusiness?: string[];
    directors?: Array<{
        name: string;
        appointmentDate: Date;
        address?: string;
    }>;
    shareholders?: Array<{
        name: string;
        shareClass: string;
        numberOfShares: number;
    }>;
    isActive: boolean;
    isVerified: boolean;
    lastVerified: Date;
    complianceChecks?: {
        irdVerified: boolean;
        gstVerified: boolean;
        annualReturnUpToDate: boolean;
        lastComplianceCheck: Date;
    };
    metadata?: {
        dataSource: string;
        lastUpdatedFromRegister: Date;
        apiVersion?: string;
    };
    donations: Donation[];
    get formattedAddress(): string;
    get isCompliant(): boolean;
}
export default NZCompany;
//# sourceMappingURL=NZCompany.model.d.ts.map
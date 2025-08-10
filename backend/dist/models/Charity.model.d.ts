import { Model } from 'sequelize-typescript';
import { Donation } from './Donation.model';
export declare class Charity extends Model {
    id: string;
    charityNumber: string;
    name: string;
    description: string;
    category: string;
    website?: string;
    email: string;
    phone?: string;
    logoUrl?: string;
    charityPhoto?: string;
    icon?: string;
    location?: string;
    bankAccount: string;
    irdNumber: string;
    taxDeductible: boolean;
    gstRegistered: boolean;
    isActive: boolean;
    totalReceived: number;
    donationCount: number;
    donations: Donation[];
    createdAt: Date;
    updatedAt: Date;
}
export default Charity;
//# sourceMappingURL=Charity.model.d.ts.map
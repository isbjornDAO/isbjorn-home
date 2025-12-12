import { Model } from 'sequelize-typescript';
import { Donation } from './Donation.model';
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare class User extends Model {
    id: string;
    email?: string;
    password?: string;
    walletAddress?: string;
    username?: string;
    companyName?: string;
    taxId?: string;
    nzbn?: string;
    role: UserRole;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    phone?: string;
    website?: string;
    description?: string;
    logoUrl?: string;
    isActive: boolean;
    emailVerified: boolean;
    emailVerificationToken?: string;
    emailVerifiedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    lastLoginAt?: Date;
    loginCount: number;
    preferences?: {
        receiveNewsletter: boolean;
        receiveImpactReports: boolean;
        publicProfile: boolean;
        defaultCurrency: string;
    };
    stripeCustomerId?: string;
    x402WalletId?: string;
    xp: number;
    level: number;
    coins: number;
    badges?: string[];
    collectables?: {
        id: string;
        name: string;
        claimedAt: Date;
    }[];
    lastDonationDate?: Date;
    donationStreak: number;
    longestDonationStreak: number;
    lastActive?: Date;
    currentStreak: number;
    longestStreak: number;
    spiritAnimal?: string;
    donations: Donation[];
    static hashPassword(user: User): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    toJSON(): any;
}
export default User;
//# sourceMappingURL=User.model.d.ts.map
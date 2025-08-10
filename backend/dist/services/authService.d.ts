import { User } from '../models/User.model';
interface RegisterData {
    email: string;
    password: string;
    companyName: string;
    taxId?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
}
interface LoginResponse {
    user: User;
    token: string;
    refreshToken: string;
}
export declare class AuthService {
    private generateTokens;
    register(data: RegisterData): Promise<LoginResponse>;
    login(email: string, password: string): Promise<LoginResponse>;
    refreshToken(refreshToken: string): Promise<{
        token: string;
    }>;
    getCurrentUser(userId: string): Promise<User>;
    updateProfile(userId: string, updates: Partial<User>): Promise<User>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    verifyToken(token: string): any;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=authService.d.ts.map
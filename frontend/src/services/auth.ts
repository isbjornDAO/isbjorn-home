import { apiService } from './api';
import { User } from '@/types';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  companyName: string;
  nzbn?: string;
  taxId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface WalletAuthRequest {
  walletAddress: string;
  signature: string;
  message: string;
  companyName?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/login', data);
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/register', data);
  }

  async getWalletMessage(walletAddress: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/auth/wallet/message', { walletAddress });
  }

  async loginWithWallet(data: WalletAuthRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/wallet/authenticate', data);
  }

  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/auth/me');
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    return apiService.patch<User>('/auth/profile', updates);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiService.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async refreshToken(): Promise<{ token: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    return apiService.post<{ token: string }>('/auth/refresh', {
      refreshToken,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    return apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    return apiService.post('/auth/reset-password', {
      token,
      newPassword,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    return apiService.post('/auth/verify-email', { token });
  }

  async resendVerificationEmail(): Promise<void> {
    return apiService.post('/auth/resend-verification');
  }
}

export const authService = new AuthService();
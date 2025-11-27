export interface User {
  id: string;
  email: string;
  companyName: string;
  role: 'user' | 'admin';
  taxId?: string;
  address?: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Donation {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  projectId: string;
  status: 'pending' | 'completed' | 'failed';
  x402PaymentId?: string;
  blockchainTxHash?: string;
  receiptUrl?: string;
  taxDeductible: boolean;
  message?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  goalAmount: number;
  raisedAmount: number;
  location: string;
  category: 'habitat' | 'research' | 'rescue' | 'education';
  status: 'active' | 'completed' | 'upcoming';
  walletAddress: string;
  milestones: Milestone[];
  impactMetrics: ImpactMetric[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  achievedAmount: number;
  targetDate: Date;
  achievedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ImpactMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface Receipt {
  id: string;
  donationId: string;
  receiptNumber: string;
  issueDate: Date;
  amount: number;
  currency: string;
  taxDeductibleAmount: number;
  donor: {
    name: string;
    taxId: string;
    address: Address;
  };
  pdfUrl: string;
  emailSent: boolean;
}

export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  timestamp: Date;
}

export interface DashboardStats {
  totalDonations: number;
  totalAmount: number;
  projectsSupported: number;
  impactScore: number;
  recentDonations: Donation[];
  monthlyTrend: TrendData[];
}

export interface TrendData {
  month: string;
  amount: number;
  count: number;
}

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}
import { Model } from 'sequelize-typescript';
import { Donation } from './Donation.model';
export declare enum ProjectCategory {
    HABITAT = "habitat",
    RESEARCH = "research",
    RESCUE = "rescue",
    EDUCATION = "education"
}
export declare enum ProjectStatus {
    UPCOMING = "upcoming",
    ACTIVE = "active",
    COMPLETED = "completed",
    PAUSED = "paused"
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
export declare class Project extends Model {
    id: string;
    name: string;
    description: string;
    longDescription?: string;
    imageUrl: string;
    imageGallery?: string[];
    goalAmount: number;
    raisedAmount: number;
    location: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    category: ProjectCategory;
    status: ProjectStatus;
    walletAddress: string;
    milestones: Milestone[];
    impactMetrics: ImpactMetric[];
    startDate?: Date;
    endDate?: Date;
    partners?: {
        name: string;
        website?: string;
        logoUrl?: string;
        description?: string;
    }[];
    tags?: string[];
    isActive: boolean;
    acceptingDonations: boolean;
    donorCount: number;
    averageRating?: number;
    viewCount: number;
    updates?: string;
    lastUpdateAt?: Date;
    donations: Donation[];
    get progressPercentage(): number;
    get isCompleted(): boolean;
}
export default Project;
//# sourceMappingURL=Project.model.d.ts.map
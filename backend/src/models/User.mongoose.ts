import mongoose, { Document, Schema, CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IUser extends Document {
  email?: string;
  password?: string;
  walletAddress?: string;
  walletSignature?: string;
  companyName: string;
  nzbn?: string;
  taxId?: string;
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
  oauth?: {
    google?: {
      id: string;
      email?: string;
      displayName?: string;
      photo?: string;
    };
    twitter?: {
      id: string;
      username?: string;
      displayName?: string;
      photo?: string;
    };
    proton?: {
      id: string;
      email?: string;
      displayName?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;

  // Methods
  validatePassword(password: string): Promise<boolean>;
  toJSON(): any;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true, // Allow multiple nulls for wallet-only users
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Allow empty for wallet-only users
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    password: {
      type: String,
      minlength: 8,
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple nulls
      lowercase: true,
      trim: true,
    },
    walletSignature: {
      type: String,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    nzbn: {
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    phone: String,
    website: String,
    description: String,
    logoUrl: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerifiedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLoginAt: Date,
    loginCount: {
      type: Number,
      default: 0,
    },
    preferences: {
      receiveNewsletter: {
        type: Boolean,
        default: true,
      },
      receiveImpactReports: {
        type: Boolean,
        default: true,
      },
      publicProfile: {
        type: Boolean,
        default: false,
      },
      defaultCurrency: {
        type: String,
        default: 'nzd',
      },
    },
    stripeCustomerId: String,
    x402WalletId: String,
    oauth: {
      google: {
        id: String,
        email: String,
        displayName: String,
        photo: String,
      },
      twitter: {
        id: String,
        username: String,
        displayName: String,
        photo: String,
      },
      proton: {
        id: String,
        email: String,
        displayName: String,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc: any, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.walletSignature;
        return ret;
      },
    },
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ companyName: 1 });
UserSchema.index({ createdAt: -1 });

// Hash password before saving
UserSchema.pre('save', async function(next: (err?: CallbackError) => void) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Validate password method
UserSchema.methods.validatePassword = async function(password: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

// Validation: Require either email+password OR walletAddress OR OAuth
UserSchema.pre('validate', function(next: (err?: CallbackError) => void) {
  const hasEmailAuth = this.email && this.password;
  const hasWalletAuth = this.walletAddress;
  const hasOAuth = this.oauth && (this.oauth.google?.id || this.oauth.twitter?.id || this.oauth.proton?.id);

  if (!hasEmailAuth && !hasWalletAuth && !hasOAuth) {
    next(new Error('User must have either email+password, wallet address, or OAuth provider') as CallbackError);
  } else {
    next();
  }
});

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;

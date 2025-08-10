import axios from 'axios';
import { logger } from '../utils/logger';
import { User } from '../models/User.model';
import { Donation } from '../models/Donation.model';
import { Charity } from '../models/Charity.model';

export interface XeroAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tenantId: string;
}

export interface XeroContact {
  contactID?: string;
  name: string;
  emailAddress?: string;
  taxNumber?: string;
  accountNumber?: string;
}

export interface XeroInvoice {
  invoiceID?: string;
  invoiceNumber: string;
  type: 'ACCREC' | 'ACCPAY';
  contact: XeroContact;
  date: string;
  dueDate: string;
  lineAmountTypes: 'Exclusive' | 'Inclusive' | 'NoTax';
  lineItems: XeroLineItem[];
  status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED';
  reference?: string;
}

export interface XeroLineItem {
  description: string;
  quantity: number;
  unitAmount: number;
  accountCode: string;
  taxType: string;
}

export class XeroIntegrationService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private baseUrl: string = 'https://api.xero.com/api.xro/2.0';
  private authUrl: string = 'https://identity.xero.com/connect/authorize';
  private tokenUrl: string = 'https://identity.xero.com/connect/token';

  constructor() {
    this.clientId = process.env.XERO_CLIENT_ID || '';
    this.clientSecret = process.env.XERO_CLIENT_SECRET || '';
    this.redirectUri = process.env.XERO_REDIRECT_URI || 'http://localhost:3000/integrations/xero/callback';
    
    if (!this.clientId || !this.clientSecret) {
      logger.warn('Xero credentials not configured - integration disabled');
    }
  }

  /**
   * Generate Xero OAuth authorization URL
   */
  getAuthorizationUrl(userId: string, state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'accounting.transactions accounting.contacts accounting.settings',
      state: state || userId
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(code: string): Promise<XeroAuthTokens> {
    try {
      const response = await axios.post(
        this.tokenUrl,
        {
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const data = response.data;
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        tenantId: data.tenant_id
      };
    } catch (error) {
      logger.error('Xero token exchange error:', error);
      throw new Error('Failed to authenticate with Xero');
    }
  }

  /**
   * Refresh access tokens
   */
  async refreshAccessToken(refreshToken: string): Promise<XeroAuthTokens> {
    try {
      const response = await axios.post(
        this.tokenUrl,
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const data = response.data;
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        tenantId: data.tenant_id
      };
    } catch (error) {
      logger.error('Xero token refresh error:', error);
      throw new Error('Failed to refresh Xero tokens');
    }
  }

  /**
   * Create or update contact in Xero
   */
  async syncContact(user: User, tokens: XeroAuthTokens): Promise<string> {
    try {
      const contact: XeroContact = {
        name: user.companyName,
        emailAddress: user.email,
        taxNumber: user.taxId,
        accountNumber: user.id.slice(0, 8)
      };

      const response = await this.makeXeroRequest(
        'PUT',
        '/Contacts',
        tokens,
        { Contacts: [contact] }
      );

      return response.data.Contacts[0].ContactID;
    } catch (error) {
      logger.error('Xero contact sync error:', error);
      throw new Error('Failed to sync contact with Xero');
    }
  }

  /**
   * Create donation entry in Xero as a journal entry
   */
  async createDonationEntry(donation: Donation, user: User, charity: Charity, tokens: XeroAuthTokens): Promise<string> {
    try {
      // Create journal entry for the donation
      const journalLines = [
        {
          AccountCode: '1200', // Bank account (asset)
          Description: `Donation to ${charity.name}`,
          NetAmount: donation.amount
        },
        {
          AccountCode: '4000', // Donation income
          Description: `Donation from ${user.companyName}`,
          NetAmount: -donation.amount
        }
      ];

      const manualJournal = {
        Narration: `Donation processed through Isbjorn Platform - Receipt: ${donation.id}`,
        JournalLines: journalLines,
        Date: donation.createdAt.toISOString().split('T')[0],
        Reference: `DONATION-${donation.id.slice(-8)}`
      };

      const response = await this.makeXeroRequest(
        'PUT',
        '/ManualJournals',
        tokens,
        { ManualJournals: [manualJournal] }
      );

      logger.info(`Donation ${donation.id} synced to Xero`, {
        xeroJournalId: response.data.ManualJournals[0].ManualJournalID,
        amount: donation.amount,
        charity: charity.name
      });

      return response.data.ManualJournals[0].ManualJournalID;
    } catch (error) {
      logger.error('Xero donation entry error:', error);
      throw new Error('Failed to create donation entry in Xero');
    }
  }

  /**
   * Create expense entry for platform fee
   */
  async createPlatformFeeEntry(donation: Donation, platformFee: number, tokens: XeroAuthTokens): Promise<string> {
    try {
      const journalLines = [
        {
          AccountCode: '6000', // Platform fee expense
          Description: 'Isbjorn Platform Fee',
          NetAmount: platformFee
        },
        {
          AccountCode: '1200', // Bank account reduction
          Description: 'Platform fee deduction',
          NetAmount: -platformFee
        }
      ];

      const manualJournal = {
        Narration: `Platform fee for donation ${donation.id}`,
        JournalLines: journalLines,
        Date: donation.createdAt.toISOString().split('T')[0],
        Reference: `FEE-${donation.id.slice(-8)}`
      };

      const response = await this.makeXeroRequest(
        'PUT',
        '/ManualJournals',
        tokens,
        { ManualJournals: [manualJournal] }
      );

      return response.data.ManualJournals[0].ManualJournalID;
    } catch (error) {
      logger.error('Xero platform fee entry error:', error);
      throw new Error('Failed to create platform fee entry in Xero');
    }
  }

  /**
   * Get Xero organisation details
   */
  async getOrganisation(tokens: XeroAuthTokens): Promise<any> {
    try {
      const response = await this.makeXeroRequest('GET', '/Organisation', tokens);
      return response.data.Organisations[0];
    } catch (error) {
      logger.error('Xero organisation fetch error:', error);
      throw new Error('Failed to fetch organisation details from Xero');
    }
  }

  /**
   * Get chart of accounts
   */
  async getChartOfAccounts(tokens: XeroAuthTokens): Promise<any[]> {
    try {
      const response = await this.makeXeroRequest('GET', '/Accounts', tokens);
      return response.data.Accounts;
    } catch (error) {
      logger.error('Xero chart of accounts fetch error:', error);
      throw new Error('Failed to fetch chart of accounts from Xero');
    }
  }

  /**
   * Bulk sync multiple donations
   */
  async bulkSyncDonations(donations: Donation[], userTokens: Map<string, XeroAuthTokens>): Promise<void> {
    try {
      for (const donation of donations) {
        const tokens = userTokens.get(donation.userId);
        if (!tokens) {
          logger.warn(`No Xero tokens found for user ${donation.userId}`);
          continue;
        }

        const [user, charity] = await Promise.all([
          User.findByPk(donation.userId),
          Charity.findByPk(donation.charityId)
        ]);

        if (user && charity) {
          await this.createDonationEntry(donation, user, charity, tokens);
          
          // Add platform fee entry if applicable
          const platformFee = donation.amount * 0.015; // 1.5% platform fee
          if (platformFee > 0) {
            await this.createPlatformFeeEntry(donation, platformFee, tokens);
          }
        }

        // Rate limiting - don't overwhelm Xero API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      logger.error('Bulk sync error:', error);
      throw error;
    }
  }

  /**
   * Make authenticated request to Xero API
   */
  private async makeXeroRequest(method: string, endpoint: string, tokens: XeroAuthTokens, data?: any): Promise<any> {
    try {
      // Check if token needs refresh
      if (tokens.expiresAt < new Date()) {
        tokens = await this.refreshAccessToken(tokens.refreshToken);
      }

      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Xero-Tenant-Id': tokens.tenantId,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data
      };

      const response = await axios(config);
      return response;
    } catch (error) {
      logger.error(`Xero API request error (${method} ${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Validate Xero connection
   */
  async validateConnection(tokens: XeroAuthTokens): Promise<boolean> {
    try {
      await this.getOrganisation(tokens);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const xeroIntegrationService = new XeroIntegrationService();
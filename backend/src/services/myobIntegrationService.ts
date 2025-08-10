import axios from 'axios';
import { logger } from '../utils/logger';
import { User } from '../models/User.model';
import { Donation } from '../models/Donation.model';
import { Charity } from '../models/Charity.model';

export interface MYOBAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  companyFileId: string;
  companyFileUri: string;
}

export interface MYOBCustomer {
  UID?: string;
  CompanyName: string;
  LastName?: string;
  FirstName?: string;
  IsIndividual: boolean;
  Addresses: MYOBAddress[];
  Phone1?: string;
  Email?: string;
  ABN?: string;
  TaxCode: {
    UID: string;
    Code: string;
  };
}

export interface MYOBAddress {
  Location: number; // 1 = Business, 2 = Postal
  Street: string;
  City: string;
  State: string;
  PostCode: string;
  Country: string;
}

export interface MYOBGeneralJournal {
  UID?: string;
  Date: string;
  Memo: string;
  IsTaxInclusive: boolean;
  Lines: MYOBJournalLine[];
}

export interface MYOBJournalLine {
  Account: {
    UID: string;
    DisplayID: string;
  };
  Amount: number;
  Memo: string;
  IsCredit: boolean;
  TaxCode: {
    UID: string;
    Code: string;
  };
}

export class MYOBIntegrationService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private baseUrl: string = 'https://secure.myob.com/oauth2/account';
  private apiUrl: string = 'https://api.myob.com/accountright';
  private authUrl: string = 'https://secure.myob.com/oauth2/account/authorize';
  private tokenUrl: string = 'https://secure.myob.com/oauth2/v1/authorize';

  constructor() {
    this.clientId = process.env.MYOB_CLIENT_ID || '';
    this.clientSecret = process.env.MYOB_CLIENT_SECRET || '';
    this.redirectUri = process.env.MYOB_REDIRECT_URI || 'http://localhost:3000/integrations/myob/callback';
    
    if (!this.clientId || !this.clientSecret) {
      logger.warn('MYOB credentials not configured - integration disabled');
    }
  }

  /**
   * Generate MYOB OAuth authorization URL
   */
  getAuthorizationUrl(userId: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'CompanyFile',
      state: state || userId
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(code: string): Promise<MYOBAuthTokens> {
    try {
      const response = await axios.post(
        this.tokenUrl,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          scope: 'CompanyFile',
          code,
          grant_type: 'authorization_code'
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const data = response.data;
      
      // Get company files to set default
      const companyFiles = await this.getCompanyFiles(data.access_token);
      const defaultFile = companyFiles[0]; // Use first company file
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        companyFileId: defaultFile.Id,
        companyFileUri: defaultFile.Uri
      };
    } catch (error) {
      logger.error('MYOB token exchange error:', error);
      throw new Error('Failed to authenticate with MYOB');
    }
  }

  /**
   * Refresh access tokens
   */
  async refreshAccessToken(refreshToken: string): Promise<MYOBAuthTokens> {
    try {
      const response = await axios.post(
        this.tokenUrl,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const data = response.data;
      
      // Get company files again
      const companyFiles = await this.getCompanyFiles(data.access_token);
      const defaultFile = companyFiles[0];
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        companyFileId: defaultFile.Id,
        companyFileUri: defaultFile.Uri
      };
    } catch (error) {
      logger.error('MYOB token refresh error:', error);
      throw new Error('Failed to refresh MYOB tokens');
    }
  }

  /**
   * Get available company files
   */
  async getCompanyFiles(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'x-myobapi-version': 'v2',
            'Accept-Encoding': 'gzip,deflate'
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('MYOB company files fetch error:', error);
      throw new Error('Failed to fetch MYOB company files');
    }
  }

  /**
   * Create or update customer in MYOB
   */
  async syncCustomer(user: User, tokens: MYOBAuthTokens): Promise<string> {
    try {
      const customer: MYOBCustomer = {
        CompanyName: user.companyName,
        IsIndividual: false,
        Email: user.email,
        ABN: user.taxId,
        Addresses: user.address ? [{
          Location: 1, // Business address
          Street: user.address.street,
          City: user.address.city,
          State: user.address.state,
          PostCode: user.address.postalCode,
          Country: user.address.country
        }] : [],
        TaxCode: {
          UID: await this.getDefaultTaxCodeUID(tokens),
          Code: 'GST'
        }
      };

      const response = await this.makeMYOBRequest(
        'POST',
        '/Contact/Customer',
        tokens,
        customer
      );

      return response.headers.location.split('/').pop();
    } catch (error) {
      logger.error('MYOB customer sync error:', error);
      throw new Error('Failed to sync customer with MYOB');
    }
  }

  /**
   * Create donation entry in MYOB as a general journal
   */
  async createDonationEntry(donation: Donation, user: User, charity: Charity, tokens: MYOBAuthTokens): Promise<string> {
    try {
      const [bankAccountUID, donationIncomeUID, taxCodeUID] = await Promise.all([
        this.getBankAccountUID(tokens),
        this.getDonationIncomeAccountUID(tokens),
        this.getDefaultTaxCodeUID(tokens)
      ]);

      const generalJournal: MYOBGeneralJournal = {
        Date: donation.createdAt.toISOString().split('T')[0],
        Memo: `Donation to ${charity.name} from ${user.companyName}`,
        IsTaxInclusive: false,
        Lines: [
          {
            Account: {
              UID: bankAccountUID,
              DisplayID: '1-1100' // Bank account
            },
            Amount: donation.amount,
            Memo: `Donation received - ${charity.name}`,
            IsCredit: false,
            TaxCode: {
              UID: taxCodeUID,
              Code: 'FRE' // Tax-free
            }
          },
          {
            Account: {
              UID: donationIncomeUID,
              DisplayID: '4-1000' // Donation income
            },
            Amount: donation.amount,
            Memo: `Donation from ${user.companyName}`,
            IsCredit: true,
            TaxCode: {
              UID: taxCodeUID,
              Code: 'FRE'
            }
          }
        ]
      };

      const response = await this.makeMYOBRequest(
        'POST',
        '/GeneralLedger/GeneralJournal',
        tokens,
        generalJournal
      );

      logger.info(`Donation ${donation.id} synced to MYOB`, {
        myobJournalId: response.headers.location.split('/').pop(),
        amount: donation.amount,
        charity: charity.name
      });

      return response.headers.location.split('/').pop();
    } catch (error) {
      logger.error('MYOB donation entry error:', error);
      throw new Error('Failed to create donation entry in MYOB');
    }
  }

  /**
   * Create platform fee entry
   */
  async createPlatformFeeEntry(donation: Donation, platformFee: number, tokens: MYOBAuthTokens): Promise<string> {
    try {
      const [bankAccountUID, expenseAccountUID, taxCodeUID] = await Promise.all([
        this.getBankAccountUID(tokens),
        this.getPlatformFeeAccountUID(tokens),
        this.getDefaultTaxCodeUID(tokens)
      ]);

      const generalJournal: MYOBGeneralJournal = {
        Date: donation.createdAt.toISOString().split('T')[0],
        Memo: `Platform fee for donation ${donation.id}`,
        IsTaxInclusive: false,
        Lines: [
          {
            Account: {
              UID: expenseAccountUID,
              DisplayID: '6-1000' // Platform fee expense
            },
            Amount: platformFee,
            Memo: 'Isbjorn Platform Fee',
            IsCredit: false,
            TaxCode: {
              UID: taxCodeUID,
              Code: 'GST'
            }
          },
          {
            Account: {
              UID: bankAccountUID,
              DisplayID: '1-1100' // Bank account reduction
            },
            Amount: platformFee,
            Memo: 'Platform fee deduction',
            IsCredit: true,
            TaxCode: {
              UID: taxCodeUID,
              Code: 'GST'
            }
          }
        ]
      };

      const response = await this.makeMYOBRequest(
        'POST',
        '/GeneralLedger/GeneralJournal',
        tokens,
        generalJournal
      );

      return response.headers.location.split('/').pop();
    } catch (error) {
      logger.error('MYOB platform fee entry error:', error);
      throw new Error('Failed to create platform fee entry in MYOB');
    }
  }

  /**
   * Get chart of accounts
   */
  async getChartOfAccounts(tokens: MYOBAuthTokens): Promise<any[]> {
    try {
      const response = await this.makeMYOBRequest('GET', '/GeneralLedger/Account', tokens);
      return response.data.Items || response.data;
    } catch (error) {
      logger.error('MYOB chart of accounts fetch error:', error);
      throw new Error('Failed to fetch chart of accounts from MYOB');
    }
  }

  /**
   * Get company information
   */
  async getCompanyInformation(tokens: MYOBAuthTokens): Promise<any> {
    try {
      const response = await this.makeMYOBRequest('GET', '/Company/Preferences', tokens);
      return response.data;
    } catch (error) {
      logger.error('MYOB company information fetch error:', error);
      throw new Error('Failed to fetch company information from MYOB');
    }
  }

  /**
   * Bulk sync multiple donations
   */
  async bulkSyncDonations(donations: Donation[], userTokens: Map<string, MYOBAuthTokens>): Promise<void> {
    try {
      for (const donation of donations) {
        const tokens = userTokens.get(donation.userId);
        if (!tokens) {
          logger.warn(`No MYOB tokens found for user ${donation.userId}`);
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

        // Rate limiting - don't overwhelm MYOB API
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      logger.error('MYOB bulk sync error:', error);
      throw error;
    }
  }

  /**
   * Make authenticated request to MYOB API
   */
  private async makeMYOBRequest(method: string, endpoint: string, tokens: MYOBAuthTokens, data?: any): Promise<any> {
    try {
      // Check if token needs refresh
      if (tokens.expiresAt < new Date()) {
        tokens = await this.refreshAccessToken(tokens.refreshToken);
      }

      const config = {
        method,
        url: `${tokens.companyFileUri}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'x-myobapi-version': 'v2',
          'Accept-Encoding': 'gzip,deflate',
          'Content-Type': 'application/json'
        },
        data
      };

      const response = await axios(config);
      return response;
    } catch (error) {
      logger.error(`MYOB API request error (${method} ${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Helper methods to get account UIDs
   */
  private async getBankAccountUID(tokens: MYOBAuthTokens): Promise<string> {
    const accounts = await this.getChartOfAccounts(tokens);
    const bankAccount = accounts.find(acc => acc.Type === 'Bank' || acc.DisplayID.includes('1100'));
    return bankAccount?.UID || accounts.find(acc => acc.Type === 'Asset')?.UID || '';
  }

  private async getDonationIncomeAccountUID(tokens: MYOBAuthTokens): Promise<string> {
    const accounts = await this.getChartOfAccounts(tokens);
    const incomeAccount = accounts.find(acc => 
      acc.Type === 'Income' || 
      acc.Name?.toLowerCase().includes('donation') ||
      acc.DisplayID.includes('4000')
    );
    return incomeAccount?.UID || accounts.find(acc => acc.Type === 'Income')?.UID || '';
  }

  private async getPlatformFeeAccountUID(tokens: MYOBAuthTokens): Promise<string> {
    const accounts = await this.getChartOfAccounts(tokens);
    const expenseAccount = accounts.find(acc => 
      acc.Type === 'Expense' || 
      acc.Name?.toLowerCase().includes('fee') ||
      acc.DisplayID.includes('6000')
    );
    return expenseAccount?.UID || accounts.find(acc => acc.Type === 'Expense')?.UID || '';
  }

  private async getDefaultTaxCodeUID(tokens: MYOBAuthTokens): Promise<string> {
    try {
      const response = await this.makeMYOBRequest('GET', '/GeneralLedger/TaxCode', tokens);
      const taxCodes = response.data.Items || response.data;
      const gstFree = taxCodes.find((tc: any) => tc.Code === 'FRE' || tc.Code === 'GST');
      return gstFree?.UID || taxCodes[0]?.UID || '';
    } catch (error) {
      logger.error('Error fetching tax codes:', error);
      return '';
    }
  }

  /**
   * Validate MYOB connection
   */
  async validateConnection(tokens: MYOBAuthTokens): Promise<boolean> {
    try {
      await this.getCompanyInformation(tokens);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const myobIntegrationService = new MYOBIntegrationService();
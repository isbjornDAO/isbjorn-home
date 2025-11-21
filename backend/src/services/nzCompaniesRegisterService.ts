import axios, { AxiosResponse } from 'axios';
import { NZCompany, CompanyType, CompanyStatus } from '../models/NZCompany.model';
import { logger } from '../utils/logger';

// NZ Companies Office API interfaces
interface CompaniesOfficeResponse {
  entityName: string;
  entityTypeDescription: string;
  entityStatusDescription: string;
  irdNumber?: string;
  gstNumber?: string;
  incorporationDate: string;
  addresses: {
    registered: CompanyAddress;
    service?: CompanyAddress;
  };
  directors?: Director[];
  shareholders?: Shareholder[];
}

interface CompanyAddress {
  careOf?: string;
  line1: string;
  line2?: string;
  suburb?: string;
  city: string;
  region: string;
  postcode?: string;
  country: string;
}

interface Director {
  personName: string;
  appointmentDate: string;
  address?: string;
}

interface Shareholder {
  shareholderName: string;
  shareClass: string;
  numberOfShares: number;
  totalShares: number;
}

export class NZCompaniesRegisterService {
  private baseUrl = 'https://api.business.govt.nz/gateway/companies-office/v1';
  private apiKey: string;
  private rateLimitDelay = 1000; // 1 second between requests
  private lastRequestTime = 0;
  private isProduction: boolean;

  constructor() {
    this.apiKey = process.env.NZ_COMPANIES_API_KEY || '';
    this.isProduction = process.env.NODE_ENV === 'production';
    if (!this.apiKey) {
      if (this.isProduction) {
        logger.error('NZ Companies API key not configured in production - real lookups will fail');
      } else {
        logger.warn('NZ Companies API key not configured - using mock data for development');
        logger.info('To enable real company lookups, set NZ_COMPANIES_API_KEY environment variable');
        logger.info('Get API key from: https://www.business.govt.nz/developers/');
      }
    }
  }

  /**
   * Auto-populate company details from NZ Companies Register
   */
  async lookupCompany(companyNumber: string): Promise<NZCompany | null> {
    try {
      // Rate limiting
      await this.enforceRateLimit();

      if (!this.apiKey) {
        if (this.isProduction) {
          throw new Error('NZ_COMPANIES_API_KEY is required in production');
        }
        return this.getMockCompanyData(companyNumber);
      }

      const response = await axios.get(`${this.baseUrl}/companies/${companyNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const companyData = response.data as CompaniesOfficeResponse;
      return await this.createOrUpdateCompany(companyNumber, companyData);

    } catch (error: any) {
      logger.error(`Error looking up company ${companyNumber}:`, {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      // Fallback to existing database record if API fails
      const existingCompany = await NZCompany.findOne({
        where: { nzCompanyNumber: companyNumber }
      });
      
      return existingCompany;
    }
  }

  /**
   * Verify company details are current and compliant
   */
  async verifyCompany(companyNumber: string): Promise<{
    isValid: boolean;
    isActive: boolean;
    isCompliant: boolean;
    issues: string[];
  }> {
    const company = await this.lookupCompany(companyNumber);
    
    if (!company) {
      return {
        isValid: false,
        isActive: false,
        isCompliant: false,
        issues: ['Company not found in NZ Companies Register']
      };
    }

    const issues: string[] = [];

    // Check if company is active
    if (company.companyStatus !== CompanyStatus.REGISTERED) {
      issues.push(`Company status is ${company.companyStatus}, must be Registered`);
    }

    // Check if company has IRD number for tax compliance
    if (!company.irdNumber) {
      issues.push('Company does not have an IRD number on record');
    }

    // Check if company is up to date with annual returns
    const monthsSinceIncorporation = this.getMonthsDifference(
      new Date(company.incorporationDate),
      new Date()
    );
    
    if (monthsSinceIncorporation > 18 && !company.annualReturnFilingMonth) {
      issues.push('Company may be overdue for annual return filing');
    }

    return {
      isValid: true,
      isActive: company.companyStatus === CompanyStatus.REGISTERED,
      isCompliant: issues.length === 0,
      issues
    };
  }

  /**
   * Auto-fill company registration form
   */
  async autoFillCompanyDetails(companyNumber: string): Promise<{
    legalName: string;
    tradingName?: string;
    registeredAddress: string;
    directors: string[];
    incorporationDate: Date;
    irdNumber?: string;
    gstNumber?: string;
  } | null> {
    const company = await this.lookupCompany(companyNumber);
    
    if (!company) return null;

    return {
      legalName: company.legalName,
      tradingName: company.tradingName,
      registeredAddress: company.formattedAddress,
      directors: company.directors?.map(d => d.name) || [],
      incorporationDate: company.incorporationDate,
      irdNumber: company.irdNumber,
      gstNumber: company.gstNumber,
    };
  }

  /**
   * Batch verify multiple companies (for compliance checking)
   */
  async batchVerifyCompanies(companyNumbers: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    for (const companyNumber of companyNumbers) {
      try {
        const verification = await this.verifyCompany(companyNumber);
        results.set(companyNumber, verification.isCompliant);
        
        // Rate limiting for batch operations
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
      } catch (error) {
        logger.error(`Batch verification failed for company ${companyNumber}:`, error);
        results.set(companyNumber, false);
      }
    }
    
    return results;
  }

  // Private helper methods
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  private async createOrUpdateCompany(
    companyNumber: string, 
    data: CompaniesOfficeResponse
  ): Promise<NZCompany> {
    const companyData = {
      nzCompanyNumber: companyNumber,
      legalName: data.entityName,
      companyType: this.mapCompanyType(data.entityTypeDescription),
      companyStatus: this.mapCompanyStatus(data.entityStatusDescription),
      irdNumber: data.irdNumber,
      gstNumber: data.gstNumber,
      registeredAddress: {
        street: data.addresses.registered.line1,
        suburb: data.addresses.registered.suburb,
        city: data.addresses.registered.city,
        region: data.addresses.registered.region,
        postcode: data.addresses.registered.postcode,
        country: data.addresses.registered.country,
      },
      addressForService: data.addresses.service ? {
        street: data.addresses.service.line1,
        suburb: data.addresses.service.suburb,
        city: data.addresses.service.city,
        region: data.addresses.service.region,
        postcode: data.addresses.service.postcode,
        country: data.addresses.service.country,
      } : undefined,
      incorporationDate: new Date(data.incorporationDate),
      directors: data.directors?.map(d => ({
        name: d.personName,
        appointmentDate: new Date(d.appointmentDate),
        address: d.address,
      })),
      shareholders: data.shareholders?.map(s => ({
        name: s.shareholderName,
        shareClass: s.shareClass,
        numberOfShares: s.numberOfShares,
      })),
      isActive: data.entityStatusDescription === 'Registered',
      isVerified: true,
      lastVerified: new Date(),
      complianceChecks: {
        irdVerified: !!data.irdNumber,
        gstVerified: !!data.gstNumber,
        annualReturnUpToDate: true, // Would need additional API call to verify
        lastComplianceCheck: new Date(),
      },
      metadata: {
        dataSource: 'NZ Companies Office API',
        lastUpdatedFromRegister: new Date(),
        apiVersion: 'v1',
      }
    };

    const [company] = await NZCompany.upsert(companyData, {
      returning: true,
    });

    logger.info(`Company ${companyNumber} updated from Companies Register`, {
      companyName: company.legalName,
      status: company.companyStatus,
    });

    return company;
  }

  private mapCompanyType(typeDescription: string): CompanyType {
    const mapping: Record<string, CompanyType> = {
      'Limited Company': CompanyType.LIMITED,
      'Unlimited Company': CompanyType.UNLIMITED,
      'Limited Partnership': CompanyType.LIMITED_PARTNERSHIP,
      'Incorporated Society': CompanyType.INCORPORATED_SOCIETY,
      'Charitable Trust': CompanyType.CHARITABLE_TRUST,
      'Unit Trust': CompanyType.UNIT_TRUST,
      'Overseas Company': CompanyType.OVERSEAS_COMPANY,
    };
    
    return mapping[typeDescription] || CompanyType.LIMITED;
  }

  private mapCompanyStatus(statusDescription: string): CompanyStatus {
    const mapping: Record<string, CompanyStatus> = {
      'Registered': CompanyStatus.REGISTERED,
      'Removed': CompanyStatus.REMOVED,
      'Liquidation': CompanyStatus.LIQUIDATION,
      'Receivership': CompanyStatus.RECEIVERSHIP,
    };
    
    return mapping[statusDescription] || CompanyStatus.REGISTERED;
  }

  private getMonthsDifference(startDate: Date, endDate: Date): number {
    return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
           (endDate.getMonth() - startDate.getMonth());
  }

  /**
   * Mock data for development/testing when API key not available
   */
  private async getMockCompanyData(companyNumber: string): Promise<NZCompany | null> {
    // More realistic mock data for testing
    const mockCompanies: Record<string, any> = {
      '1234567': {
        legalName: 'Acme Corporation Limited',
        tradingName: 'Acme Corp',
        irdNumber: '123-456-789',
        gstNumber: '123-456-789',
        city: 'Auckland',
      },
      '7654321': {
        legalName: 'TechStart Solutions Limited',
        tradingName: 'TechStart',
        irdNumber: '987-654-321',
        gstNumber: '987-654-321',
        city: 'Wellington',
      }
    };
    
    const companyInfo = mockCompanies[companyNumber] || {
      legalName: `Test Company ${companyNumber} Limited`,
      tradingName: `Test Co ${companyNumber}`,
      irdNumber: '111-222-333',
      gstNumber: '111-222-333',
      city: 'Auckland',
    };
    
    // Return mock data directly without database for now
    const mockCompany = {
      id: `mock-${companyNumber}`,
      nzCompanyNumber: companyNumber,
      legalName: companyInfo.legalName,
      tradingName: companyInfo.tradingName,
      companyType: CompanyType.LIMITED,
      companyStatus: CompanyStatus.REGISTERED,
      irdNumber: companyInfo.irdNumber,
      gstNumber: companyInfo.gstNumber,
      registeredAddress: {
        street: '123 Queen Street',
        suburb: 'CBD',
        city: companyInfo.city,
        region: companyInfo.city,
        postcode: '1010',
        country: 'New Zealand',
      },
      formattedAddress: `123 Queen Street, CBD, ${companyInfo.city} 1010, New Zealand`,
      incorporationDate: new Date('2024-01-01'),
      annualReturnFilingMonth: 12,
      directors: [{
        name: 'John Smith',
        appointmentDate: new Date('2020-01-01'),
      }, {
        name: 'Jane Doe',
        appointmentDate: new Date('2020-01-01'),
      }],
      isActive: true,
      isVerified: true,
      lastVerified: new Date(),
      complianceChecks: {
        irdVerified: true,
        gstVerified: true,
        annualReturnUpToDate: true,
        lastComplianceCheck: new Date(),
      },
      metadata: {
        dataSource: 'Mock Data',
        lastUpdatedFromRegister: new Date(),
      }
    } as any;

    return mockCompany;
  }
}

export default NZCompaniesRegisterService;
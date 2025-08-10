import axios from 'axios';
import { logger } from '../utils/logger';
import { Charity } from '../models/Charity.model';
import { User } from '../models/User.model';

export interface IRDVerificationResult {
  valid: boolean;
  companyName?: string;
  irdNumber?: string;
  gstRegistered?: boolean;
  businessType?: string;
  error?: string;
}

export interface DoneeOrganisationStatus {
  isDoneeOrganisation: boolean;
  doneeNumber?: string;
  taxDeductibleStatus: 'full' | 'partial' | 'none';
  lastVerified: Date;
}

export class IRDComplianceService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.IRD_API_KEY || '';
    this.baseUrl = process.env.IRD_API_URL || 'https://services.ird.govt.nz/gateway/gws/rest';
    
    if (!this.apiKey) {
      logger.warn('IRD API key not configured - using mock compliance data for development');
    }
  }

  /**
   * Verify a business IRD number and get company details
   */
  async verifyBusinessIRD(irdNumber: string, companyName?: string): Promise<IRDVerificationResult> {
    try {
      if (!this.apiKey) {
        // Mock verification for development
        return this.getMockBusinessVerification(irdNumber, companyName);
      }

      const response = await axios.post(
        `${this.baseUrl}/business/verify`,
        {
          irdNumber: irdNumber.replace(/[^0-9]/g, ''),
          companyName: companyName
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;
      return {
        valid: data.valid,
        companyName: data.businessName,
        irdNumber: data.irdNumber,
        gstRegistered: data.gstRegistered,
        businessType: data.businessType
      };
    } catch (error) {
      logger.error('IRD business verification error:', error);
      return {
        valid: false,
        error: 'Unable to verify IRD number'
      };
    }
  }

  /**
   * Verify charity donee organisation status
   */
  async verifyDoneeOrganisation(charityId: string): Promise<DoneeOrganisationStatus> {
    try {
      const charity = await Charity.findByPk(charityId);
      if (!charity) {
        throw new Error('Charity not found');
      }

      if (!this.apiKey) {
        // Mock verification for development
        return this.getMockDoneeStatus(charity.irdNumber);
      }

      const response = await axios.post(
        `${this.baseUrl}/charity/donee-status`,
        {
          irdNumber: charity.irdNumber,
          charityNumber: charity.charityNumber
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;
      return {
        isDoneeOrganisation: data.isDoneeOrganisation,
        doneeNumber: data.doneeNumber,
        taxDeductibleStatus: data.taxDeductibleStatus,
        lastVerified: new Date()
      };
    } catch (error) {
      logger.error('Donee organisation verification error:', error);
      return {
        isDoneeOrganisation: false,
        taxDeductibleStatus: 'none',
        lastVerified: new Date()
      };
    }
  }

  /**
   * Generate IRD-compliant receipt number
   */
  generateIRDReceiptNumber(charityId: string, donationId: string): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const charityCode = charityId.slice(0, 4).toUpperCase();
    const donationCode = donationId.slice(-6).toUpperCase();
    
    return `${charityCode}-${year}${month}-${donationCode}`;
  }

  /**
   * Validate donation amount for IRD compliance
   */
  validateDonationAmount(amount: number, currency: string = 'NZD'): boolean {
    // IRD minimum donation amount is $5 NZD for tax deductibility
    if (currency === 'NZD') {
      return amount >= 5;
    }
    // For other currencies, convert to NZD (simplified - would use real exchange rates)
    const nzdAmount = this.convertToNZD(amount, currency);
    return nzdAmount >= 5;
  }

  /**
   * Generate IRD-compliant donation receipt data
   */
  async generateIRDReceiptData(donationId: string, userId: string, charityId: string, amount: number): Promise<any> {
    try {
      const [user, charity] = await Promise.all([
        User.findByPk(userId),
        Charity.findByPk(charityId)
      ]);

      if (!user || !charity) {
        throw new Error('User or charity not found');
      }

      // Verify donee status
      const doneeStatus = await this.verifyDoneeOrganisation(charityId);
      
      const receiptNumber = this.generateIRDReceiptNumber(charityId, donationId);
      const currentDate = new Date();

      return {
        receiptNumber,
        donationDate: currentDate.toISOString().split('T')[0],
        amount: `$${amount.toFixed(2)} NZD`,
        donorName: user.companyName,
        donorAddress: this.formatAddress(user.address),
        charityLegalName: charity.name,
        charityIRDNumber: charity.irdNumber,
        charityNumber: charity.charityNumber,
        isDoneeOrganisation: doneeStatus.isDoneeOrganisation,
        doneeNumber: doneeStatus.doneeNumber,
        taxDeductibleStatus: doneeStatus.taxDeductibleStatus,
        legalStatement: this.generateLegalStatement(doneeStatus),
        authorisedPerson: {
          name: 'Isbjorn Platform',
          designation: 'Automated Receipt System',
          digitalSignature: true
        }
      };
    } catch (error) {
      logger.error('IRD receipt data generation error:', error);
      throw error;
    }
  }

  /**
   * Submit donation to IRD reporting system (if required)
   */
  async submitToIRDReporting(donationData: any): Promise<boolean> {
    try {
      if (!this.apiKey) {
        logger.info('IRD reporting not configured - skipping submission');
        return true;
      }

      // For donations over $200, submit to IRD
      const amount = parseFloat(donationData.amount.replace(/[^0-9.]/g, ''));
      if (amount < 200) {
        return true; // No reporting required
      }

      const response = await axios.post(
        `${this.baseUrl}/reporting/donation`,
        {
          receiptNumber: donationData.receiptNumber,
          donationDate: donationData.donationDate,
          amount: amount,
          donorIRD: donationData.donorIRDNumber,
          charityIRD: donationData.charityIRDNumber,
          taxYear: new Date().getFullYear()
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.success;
    } catch (error) {
      logger.error('IRD reporting submission error:', error);
      return false;
    }
  }

  // Helper methods
  private getMockBusinessVerification(irdNumber: string, companyName?: string): IRDVerificationResult {
    return {
      valid: true,
      companyName: companyName || 'Test Company Ltd',
      irdNumber: irdNumber,
      gstRegistered: true,
      businessType: 'Company'
    };
  }

  private getMockDoneeStatus(irdNumber: string): DoneeOrganisationStatus {
    return {
      isDoneeOrganisation: true,
      doneeNumber: `DRG-${irdNumber.slice(-4)}`,
      taxDeductibleStatus: 'full',
      lastVerified: new Date()
    };
  }

  private convertToNZD(amount: number, currency: string): number {
    // Simplified currency conversion - would use real exchange rates
    const exchangeRates: { [key: string]: number } = {
      'USD': 1.65,
      'AUD': 1.08,
      'EUR': 1.78,
      'GBP': 2.02
    };
    return amount * (exchangeRates[currency] || 1);
  }

  private formatAddress(address: any): string {
    if (!address) return 'Address not provided';
    
    return [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean).join(', ');
  }

  private generateLegalStatement(doneeStatus: DoneeOrganisationStatus): string {
    if (!doneeStatus.isDoneeOrganisation) {
      return 'This donation is not eligible for tax deduction as the organisation is not a registered donee organisation.';
    }

    switch (doneeStatus.taxDeductibleStatus) {
      case 'full':
        return 'This receipt is for a donation to an approved donee organisation. You can claim a tax credit for this donation.';
      case 'partial':
        return 'This receipt is for a donation to an approved donee organisation. Only a portion of this donation may be eligible for tax credit.';
      default:
        return 'This donation may not be eligible for tax deduction. Please consult your tax advisor.';
    }
  }
}

export const irdComplianceService = new IRDComplianceService();
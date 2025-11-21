import { IRDCompliantDonation, ComplianceStatus } from '../models/IRDCompliantDonation.model';
import { NZCompany } from '../models/NZCompany.model';
import { Charity } from '../models/Charity.model';
import NZCompaniesRegisterService from './nzCompaniesRegisterService';
import NZCharitiesService from './nzCharitiesService';
import IRDReceiptService from './irdReceiptService';
import { logger } from '../utils/logger';
import { stripe } from '../utils/stripe';
import AvalancheL1Service from './AvalancheL1Service';

interface StreamlinedDonationRequest {
  // Step 1: Company auto-lookup
  nzCompanyNumber: string;
  
  // Step 2: Charity selection from pre-verified dropdown
  charityId: string;
  
  // Step 3: Amount and payment
  amount: number;
  stripePaymentMethodId: string;
  
  // Optional
  message?: string;
  recurringMonthly?: boolean;
  
  // Auto-populated from integrations
  companyContactEmail: string;
  accountantEmail?: string;
}

interface StreamlinedDonationResponse {
  success: boolean;
  donationId: string;
  receiptNumber: string;
  processingTimeMs: number;
  receipt: {
    pdfUrl: string;
    emailSent: boolean;
  };
  accounting: {
    xeroExported: boolean;
    myobExported: boolean;
  };
  blockchain?: {
    transactionHash: string;
  };
}

export class StreamlinedDonationService {
  private companiesService: NZCompaniesRegisterService;
  private charitiesService: NZCharitiesService;
  private receiptService: IRDReceiptService;

  constructor() {
    this.companiesService = new NZCompaniesRegisterService();
    this.charitiesService = new NZCharitiesService();
    this.receiptService = new IRDReceiptService();
  }

  /**
   * THE 2-MINUTE DONATION PROCESS
   * Auto-fills everything, processes payment, generates receipt, exports to accounting
   */
  async processStreamlinedDonation(
    request: StreamlinedDonationRequest
  ): Promise<StreamlinedDonationResponse> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting streamlined donation process', {
        companyNumber: request.nzCompanyNumber,
        charityId: request.charityId,
        amount: request.amount,
      });

      // Step 1: Auto-populate company details (runs in parallel with charity lookup)
      const [company, charity] = await Promise.all([
        this.getOrCreateCompany(request.nzCompanyNumber),
        this.getVerifiedCharity(request.charityId),
      ]);

      if (!company || !charity) {
        throw new Error('Company or charity verification failed');
      }

      // Step 2: Validate donee organisation status
      if (!charity.isDoneeOrganisation) {
        throw new Error('Selected charity is not a verified donee organisation');
      }

      // Step 3: Process Stripe payment
      const paymentIntent = await this.processStripePayment({
        amount: request.amount * 100, // Convert to cents
        paymentMethodId: request.stripePaymentMethodId,
        companyName: company.legalName,
        charityName: charity.legalName,
      });

      // Step 4: Create IRD-compliant donation record
      const donation = await this.createIRDCompliantDonation({
        company,
        charity,
        amount: request.amount,
        stripePaymentId: paymentIntent.id,
        message: request.message,
      });

      // Step 5: Generate IRD-compliant receipt (<5 seconds)
      const receiptResult = await this.receiptService.generateIRDCompliantReceipt(donation.id);

      // Step 6: Auto-email receipt to company and accountant
      const emailResult = await this.receiptService.emailReceipt(donation.id, {
        donor: request.companyContactEmail,
        accountant: request.accountantEmail,
      });

      // Step 7: Export to accounting software (async flags only here)
      const accountingExports = await this.exportToAccountingSoftware(donation.id);

      // Step 8: Optional blockchain recording
      let blockchainTx: string | undefined;
      if (process.env.ENABLE_BLOCKCHAIN === 'true') {
        blockchainTx = await this.recordOnBlockchain(donation, company, charity, request);
      }

      // Update donation as completed
      await donation.update({
        complianceStatus: ComplianceStatus.COMPLIANT,
        accountingExportStatus: accountingExports.xeroExported ? 'exported' : 'pending',
      });

      const processingTime = Date.now() - startTime;

      logger.info('Streamlined donation completed successfully', {
        donationId: donation.id,
        receiptNumber: donation.receiptNumber,
        processingTimeMs: processingTime,
        company: company.legalName,
        charity: charity.name,
        amount: request.amount,
      });

      return {
        success: true,
        donationId: donation.id,
        receiptNumber: donation.receiptNumber,
        processingTimeMs: processingTime,
        receipt: {
          pdfUrl: receiptResult.pdfPath,
          emailSent: emailResult.emailSent,
        },
        accounting: accountingExports,
        blockchain: blockchainTx ? { transactionHash: blockchainTx } : undefined,
      };

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      logger.error('Streamlined donation failed', {
        error: error.message,
        processingTimeMs: processingTime,
        request,
      });

      throw new Error(`Donation processing failed: ${error.message}`);
    }
  }

  /**
   * Get pre-verified charities for instant dropdown population
   */
  async getVerifiedCharitiesDropdown(): Promise<Array<{
    id: string;
    name: string;
    legalName: string;
    category: string;
    logoUrl?: string;
    description: string;
    totalDonations: number;
  }>> {
    try {
      const charities = await Charity.findAll({
        where: { isActive: true },
        attributes: [
          'id', 'name', /* no legalName in model */ 'category', 'logoUrl', 
          'description', 'donationCount', 'totalReceived'
        ],
        order: [['name', 'ASC']],
        limit: 100,
      });

      return charities.map(charity => ({
        id: charity.id,
        name: charity.name,
        legalName: (charity as any).legalName || charity.name,
        category: charity.category,
        logoUrl: charity.logoUrl,
        description: charity.description,
        totalDonations: charity.donationCount,
      }));

    } catch (error) {
      logger.error('Error getting verified charities dropdown:', error);
      return [];
    }
  }

  /**
   * Auto-populate company form on company number entry
   */
  async autoPopulateCompanyForm(nzCompanyNumber: string): Promise<{
    legalName: string;
    registeredAddress: string;
    directors: string[];
    isCompliant: boolean;
    canDonate: boolean;
    issues: string[];
  } | null> {
    try {
      const verification = await this.companiesService.verifyCompany(nzCompanyNumber);
      const companyDetails = await this.companiesService.autoFillCompanyDetails(nzCompanyNumber);

      if (!companyDetails) {
        return null;
      }

      return {
        legalName: companyDetails.legalName,
        registeredAddress: companyDetails.registeredAddress,
        directors: companyDetails.directors,
        isCompliant: verification.isCompliant,
        canDonate: verification.isActive && verification.isCompliant,
        issues: verification.issues,
      };

    } catch (error) {
      logger.error('Error auto-populating company form:', error);
      return null;
    }
  }

  /**
   * Get donation history for compliance dashboard
   */
  async getCompanyDonationHistory(nzCompanyNumber: string, taxYear?: number): Promise<Array<{
    id: string;
    receiptNumber: string;
    charityName: string;
    amount: number;
    donationDate: Date;
    taxYear: number;
    receiptPdfUrl: string;
    irdCompliant: boolean;
  }>> {
    try {
      const company = await NZCompany.findOne({
        where: { nzCompanyNumber }
      });

      if (!company) {
        return [];
      }

      const whereClause: any = { companyId: company.id };
      if (taxYear) {
        whereClause.taxYear = taxYear;
      }

      const donations = await IRDCompliantDonation.findAll({
        where: whereClause,
        include: [
          { model: Charity, as: 'charity', attributes: ['name'] }
        ],
        order: [['donationDate', 'DESC']],
        limit: 100,
      });

      return donations.map(donation => ({
        id: donation.id,
        receiptNumber: donation.receiptNumber,
        charityName: donation.charity!.name,
        amount: donation.donationAmountNzd,
        donationDate: donation.donationDate,
        taxYear: donation.taxYear,
        receiptPdfUrl: `/api/receipts/${donation.id}/download`,
        irdCompliant: donation.isIrdCompliant,
      }));

    } catch (error) {
      logger.error('Error getting donation history:', error);
      return [];
    }
  }

  // Private helper methods
  private async getOrCreateCompany(nzCompanyNumber: string): Promise<NZCompany | null> {
    let company = await NZCompany.findOne({
      where: { nzCompanyNumber }
    });

    if (!company) {
      // Auto-populate from Companies Register
      company = await this.companiesService.lookupCompany(nzCompanyNumber);
    }

    return company;
  }

  private async getVerifiedCharity(charityId: string): Promise<Charity | null> {
    const charity = await Charity.findOne({
      where: { 
        id: charityId,
        isDoneeOrganisation: true,
        isActive: true,
        verificationStatus: 'verified',
      }
    });

    return charity;
  }

  private async processStripePayment(params: {
    amount: number;
    paymentMethodId: string;
    companyName: string;
    charityName: string;
  }): Promise<Stripe.PaymentIntent> {
    const isProduction = process.env.NODE_ENV === 'production';
    const allowMocks = process.env.MOCK_STRIPE === 'true' && !isProduction;

    if (allowMocks) {
      // Development-only mock path
      return {
        id: `pi_mock_${Date.now()}`,
        object: 'payment_intent',
        amount: params.amount,
        currency: 'nzd',
        status: 'succeeded',
      } as unknown as Stripe.PaymentIntent;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: 'nzd',
      payment_method: params.paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/donation/success`,
      description: `Donation from ${params.companyName} to ${params.charityName}`,
      metadata: {
        company: params.companyName,
        charity: params.charityName,
        platform: 'Isbjorn',
      },
    });

    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment failed: ${paymentIntent.status}`);
    }

    return paymentIntent;
  }

  private async createIRDCompliantDonation(params: {
    company: NZCompany;
    charity: Charity;
    amount: number;
    stripePaymentId: string;
    message?: string;
  }): Promise<IRDCompliantDonation> {
    const { company, charity, amount, stripePaymentId, message } = params;

    const donation = await IRDCompliantDonation.create({
      companyId: company.id,
      charityId: charity.id,
      donorLegalName: company.legalName,
      donorRegisteredAddress: company.formattedAddress,
      donationAmountNzd: amount,
      donationDate: new Date(),
      recipientCharityLegalName: charity.legalName,
      recipientDiaCharitiesNumber: charity.diaCharitiesNumber,
      recipientIrdNumber: charity.irdNumber,
      stripePaymentId,
      metadata: {
        donationMessage: message,
        processingTime: 0, // Will be updated
        platform: 'isbjorn-streamlined',
      },
    });

    return donation;
  }

  private async exportToAccountingSoftware(donationId: string): Promise<{
    xeroExported: boolean;
    myobExported: boolean;
  }> {
    return {
      // Accounting sync is handled by dedicated integration flows, not this streamlined path
      xeroExported: false,
      myobExported: false,
    };
  }

  private async recordOnBlockchain(
    donation: IRDCompliantDonation,
    company: NZCompany,
    charity: Charity,
    request: StreamlinedDonationRequest
  ): Promise<string | undefined> {
    try {
      const avaxPriceNzd = parseFloat(process.env.AVAX_PRICE_NZD || '50');
      const amountInWei = AvalancheL1Service.nzdToWei(donation.donationAmountNzd, avaxPriceNzd);
      const donorAddress = AvalancheL1Service.generateDonorAddress(
        company.nzCompanyNumber,
        request.companyContactEmail
      );
      const charityAddress = AvalancheL1Service.generateCharityAddress(charity.id);

      const txHash = await AvalancheL1Service.recordDonation(
        donation.id,
        donorAddress,
        charityAddress,
        amountInWei,
        donation.receiptNumber
      );

      return txHash || undefined;
    } catch (error) {
      logger.error('Error recording donation on Avalanche L1:', error);
      return undefined;
    }
  }
}

export default StreamlinedDonationService;
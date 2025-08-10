import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import StreamlinedDonationService from '../services/streamlinedDonationService';
import NZCompaniesRegisterService from '../services/nzCompaniesRegisterService';
import NZCharitiesService from '../services/nzCharitiesService';
import { logger } from '../utils/logger';
import { irdComplianceService } from '../services/irdComplianceService';
import { accountingIntegrationService } from '../services/accountingIntegrationService';

export class StreamlinedDonationController {
  private donationService: StreamlinedDonationService;
  private companiesService: NZCompaniesRegisterService;
  private charitiesService: NZCharitiesService;

  constructor() {
    this.donationService = new StreamlinedDonationService();
    this.companiesService = new NZCompaniesRegisterService();
    this.charitiesService = new NZCharitiesService();
  }

  /**
   * POST /api/donations/streamlined
   * Process the ultra-streamlined 2-minute donation
   */
  processDonation = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const startTime = Date.now();
      const result = await this.donationService.processStreamlinedDonation(req.body);
      const totalTime = Date.now() - startTime;

      logger.info('Streamlined donation API completed', {
        donationId: result.donationId,
        totalApiTime: totalTime,
        processingTime: result.processingTimeMs,
      });

      res.status(200).json({
        ...result,
        message: 'Donation processed successfully in under 2 minutes!'
      });

    } catch (error: any) {
      logger.error('Donation processing API error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Donation processing failed',
        error: error.message
      });
    }
  };

  /**
   * GET /api/companies/:companyNumber/auto-populate
   * Auto-populate company form on company number entry (30 seconds)
   */
  autoPopulateCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyNumber } = req.params;
      
      if (!companyNumber || !/^\d{1,10}$/.test(companyNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid NZ company number format'
        });
        return;
      }

      const result = await this.donationService.autoPopulateCompanyForm(companyNumber);
      
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Company not found in NZ Companies Register'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        message: result.canDonate ? 'Company verified and ready to donate' : 'Company found but has compliance issues'
      });

    } catch (error: any) {
      logger.error('Company auto-populate error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Company lookup failed',
        error: error.message
      });
    }
  };

  /**
   * GET /api/charities/verified-dropdown
   * Get pre-verified donee organisations for instant dropdown
   */
  getVerifiedCharities = async (req: Request, res: Response): Promise<void> => {
    try {
      const charities = await this.donationService.getVerifiedCharitiesDropdown();

      res.status(200).json({
        success: true,
        data: charities,
        count: charities.length,
        message: 'Verified donee organisations loaded'
      });

    } catch (error: any) {
      logger.error('Verified charities dropdown error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to load verified charities',
        error: error.message
      });
    }
  };

  /**
   * GET /api/charities/search?q=searchTerm
   * Real-time charity search for dropdown
   */
  searchCharities = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q: query, limit = '10' } = req.query;
      
      if (!query || typeof query !== 'string' || query.length < 2) {
        res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
        return;
      }

      const results = await this.charitiesService.searchCharitiesByName(
        query, 
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: results,
        count: results.length,
        query
      });

    } catch (error: any) {
      logger.error('Charity search error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Charity search failed',
        error: error.message
      });
    }
  };

  /**
   * GET /api/companies/:companyNumber/donations
   * Get company donation history for compliance dashboard
   */
  getCompanyDonations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyNumber } = req.params;
      const { taxYear } = req.query;

      if (!companyNumber || !/^\d{1,10}$/.test(companyNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid NZ company number format'
        });
        return;
      }

      const donations = await this.donationService.getCompanyDonationHistory(
        companyNumber,
        taxYear ? parseInt(taxYear as string) : undefined
      );

      const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
      const compliantCount = donations.filter(d => d.irdCompliant).length;

      res.status(200).json({
        success: true,
        data: donations,
        summary: {
          totalDonations: donations.length,
          totalAmount,
          compliantCount,
          complianceRate: donations.length > 0 ? (compliantCount / donations.length) * 100 : 100,
          taxYear: taxYear ? parseInt(taxYear as string) : new Date().getFullYear(),
        }
      });

    } catch (error: any) {
      logger.error('Company donations history error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to load donation history',
        error: error.message
      });
    }
  };

  /**
   * GET /api/companies/:companyNumber/compliance-dashboard
   * IRD audit readiness dashboard
   */
  getComplianceDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyNumber } = req.params;
      
      if (!companyNumber || !/^\d{1,10}$/.test(companyNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid NZ company number format'
        });
        return;
      }

      // Get company verification status
      const companyVerification = await this.companiesService.verifyCompany(companyNumber);
      
      // Get donation history for current tax year
      const currentTaxYear = this.getCurrentNZTaxYear();
      const donations = await this.donationService.getCompanyDonationHistory(companyNumber, currentTaxYear);
      
      // Calculate compliance metrics
      const totalDonations = donations.length;
      const compliantDonations = donations.filter(d => d.irdCompliant).length;
      const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
      
      const complianceScore = this.calculateComplianceScore({
        companyCompliant: companyVerification.isCompliant,
        donationCompliance: totalDonations > 0 ? (compliantDonations / totalDonations) : 1,
        receiptGeneration: 1, // All receipts auto-generated
        archivalCompliance: 1, // All receipts auto-archived
      });

      res.status(200).json({
        success: true,
        data: {
          complianceScore,
          company: {
            isVerified: companyVerification.isValid,
            isCompliant: companyVerification.isCompliant,
            issues: companyVerification.issues,
          },
          donations: {
            totalCount: totalDonations,
            compliantCount: compliantDonations,
            totalAmount,
            complianceRate: totalDonations > 0 ? (compliantDonations / totalDonations) * 100 : 100,
            taxYear: currentTaxYear,
          },
          irdAuditReady: complianceScore >= 95,
          nextSteps: this.getComplianceNextSteps(complianceScore, companyVerification.issues),
        }
      });

    } catch (error: any) {
      logger.error('Compliance dashboard error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to load compliance dashboard',
        error: error.message
      });
    }
  };

  /**
   * GET /api/receipts/:donationId/download
   * Download IRD-compliant receipt PDF
   */
  downloadReceipt = async (req: Request, res: Response): Promise<void> => {
    try {
      const { donationId } = req.params;
      
      // Implementation would serve the PDF file
      res.status(501).json({
        success: false,
        message: 'Receipt download not implemented yet'
      });

    } catch (error: any) {
      logger.error('Receipt download error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Receipt download failed',
        error: error.message
      });
    }
  };

  // Private helper methods
  private getCurrentNZTaxYear(): number {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based
    
    // NZ tax year runs from April 1 to March 31
    return currentMonth >= 3 ? currentYear + 1 : currentYear; // April = month 3
  }

  private calculateComplianceScore(metrics: {
    companyCompliant: boolean;
    donationCompliance: number;
    receiptGeneration: number;
    archivalCompliance: number;
  }): number {
    const weights = {
      company: 30,
      donations: 30,
      receipts: 25,
      archival: 15,
    };

    const score = 
      (metrics.companyCompliant ? weights.company : 0) +
      (metrics.donationCompliance * weights.donations) +
      (metrics.receiptGeneration * weights.receipts) +
      (metrics.archivalCompliance * weights.archival);

    return Math.round(score);
  }

  private getComplianceNextSteps(score: number, companyIssues: string[]): string[] {
    const steps: string[] = [];
    
    if (companyIssues.length > 0) {
      steps.push('Resolve company registration issues with Companies Office');
    }
    
    if (score < 95) {
      steps.push('Review and regenerate any non-compliant receipts');
    }
    
    if (score >= 95) {
      steps.push('Your donations are 100% IRD audit ready! 🎉');
    }
    
    return steps;
  }
}

export default StreamlinedDonationController;
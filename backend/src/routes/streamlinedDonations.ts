import express from 'express';
import { body, param, query } from 'express-validator';
import StreamlinedDonationController from '../controllers/streamlinedDonationController';
import { authenticateToken } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rateLimiter';

const router = express.Router();
const controller = new StreamlinedDonationController();

// Validation rules
const donationValidation = [
  body('nzCompanyNumber')
    .isString()
    .isLength({ min: 1, max: 10 })
    .matches(/^\d+$/)
    .withMessage('Valid NZ company number required'),
  body('charityId')
    .isUUID()
    .withMessage('Valid charity ID required'),
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least $1'),
  body('stripePaymentMethodId')
    .isString()
    .notEmpty()
    .withMessage('Stripe payment method required'),
  body('companyContactEmail')
    .isEmail()
    .withMessage('Valid contact email required'),
  body('accountantEmail')
    .optional()
    .isEmail()
    .withMessage('Valid accountant email required'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters'),
];

const companyNumberValidation = [
  param('companyNumber')
    .isString()
    .isLength({ min: 1, max: 10 })
    .matches(/^\d+$/)
    .withMessage('Valid NZ company number required'),
];

const searchValidation = [
  query('q')
    .isString()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

/**
 * @swagger
 * /api/donations/streamlined:
 *   post:
 *     summary: Process ultra-streamlined NZ business donation
 *     tags: [Streamlined Donations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nzCompanyNumber
 *               - charityId
 *               - amount
 *               - stripePaymentMethodId
 *               - companyContactEmail
 *             properties:
 *               nzCompanyNumber:
 *                 type: string
 *                 description: NZ company registration number
 *                 example: "1234567"
 *               charityId:
 *                 type: string
 *                 format: uuid
 *                 description: Pre-verified charity ID
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 description: Donation amount in NZD
 *                 example: 100.00
 *               stripePaymentMethodId:
 *                 type: string
 *                 description: Stripe payment method ID
 *               companyContactEmail:
 *                 type: string
 *                 format: email
 *                 description: Company contact email for receipt
 *               accountantEmail:
 *                 type: string
 *                 format: email
 *                 description: Optional accountant email for receipt
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional donation message
 *     responses:
 *       200:
 *         description: Donation processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 donationId:
 *                   type: string
 *                 receiptNumber:
 *                   type: string
 *                 processingTimeMs:
 *                   type: number
 *                 receipt:
 *                   type: object
 *                   properties:
 *                     pdfUrl:
 *                       type: string
 *                     emailSent:
 *                       type: boolean
 *       400:
 *         description: Validation error
 *       500:
 *         description: Processing failed
 */
router.post(
  '/streamlined',
  rateLimitMiddleware({ windowMs: 60000, max: 5 }), // 5 donations per minute
  donationValidation,
  controller.processDonation
);

/**
 * @swagger
 * /api/companies/{companyNumber}/auto-populate:
 *   get:
 *     summary: Auto-populate company form from NZ Companies Register
 *     tags: [Company Lookup]
 *     parameters:
 *       - in: path
 *         name: companyNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: NZ company registration number
 *     responses:
 *       200:
 *         description: Company details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     legalName:
 *                       type: string
 *                     registeredAddress:
 *                       type: string
 *                     directors:
 *                       type: array
 *                       items:
 *                         type: string
 *                     isCompliant:
 *                       type: boolean
 *                     canDonate:
 *                       type: boolean
 *                     issues:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Company not found
 *       500:
 *         description: Lookup failed
 */
router.get(
  '/companies/:companyNumber/auto-populate',
  rateLimitMiddleware({ windowMs: 60000, max: 20 }), // 20 lookups per minute
  companyNumberValidation,
  controller.autoPopulateCompany
);

/**
 * @swagger
 * /api/companies/search:
 *   get:
 *     summary: Search for companies by name
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query (min 2 chars)
 *     responses:
 *       200:
 *         description: List of companies found
 *       400:
 *         description: Invalid search query
 */
router.get(
  '/companies/search',
  searchValidation,
  controller.searchCompanies
);

/**
 * @swagger
 * /api/charities/verified-dropdown:
 *   get:
 *     summary: Get pre-verified donee organisations for dropdown
 *     tags: [Charities]
 *     responses:
 *       200:
 *         description: Verified charities list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       legalName:
 *                         type: string
 *                       category:
 *                         type: string
 *                       logoUrl:
 *                         type: string
 *                       description:
 *                         type: string
 *                       totalDonations:
 *                         type: number
 */
router.get(
  '/charities/verified-dropdown',
  rateLimitMiddleware({ windowMs: 60000, max: 30 }),
  controller.getVerifiedCharities
);

/**
 * @swagger
 * /api/charities/search:
 *   get:
 *     summary: Real-time charity search
 *     tags: [Charities]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Invalid search query
 */
router.get(
  '/charities/search',
  rateLimitMiddleware({ windowMs: 60000, max: 60 }), // 60 searches per minute
  searchValidation,
  controller.searchCharities
);

/**
 * @swagger
 * /api/companies/{companyNumber}/donations:
 *   get:
 *     summary: Get company donation history
 *     tags: [Company Donations]
 *     parameters:
 *       - in: path
 *         name: companyNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: NZ company registration number
 *       - in: query
 *         name: taxYear
 *         schema:
 *           type: integer
 *         description: Tax year filter
 *     responses:
 *       200:
 *         description: Donation history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       receiptNumber:
 *                         type: string
 *                       charityName:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       donationDate:
 *                         type: string
 *                         format: date
 *                       taxYear:
 *                         type: integer
 *                       receiptPdfUrl:
 *                         type: string
 *                       irdCompliant:
 *                         type: boolean
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalDonations:
 *                       type: number
 *                     totalAmount:
 *                       type: number
 *                     compliantCount:
 *                       type: number
 *                     complianceRate:
 *                       type: number
 */
router.get(
  '/companies/:companyNumber/donations',
  companyNumberValidation,
  controller.getCompanyDonations
);

/**
 * @swagger
 * /api/companies/{companyNumber}/compliance-dashboard:
 *   get:
 *     summary: Get IRD compliance dashboard data
 *     tags: [Compliance]
 *     parameters:
 *       - in: path
 *         name: companyNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: NZ company registration number
 *     responses:
 *       200:
 *         description: Compliance dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     complianceScore:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                     company:
 *                       type: object
 *                       properties:
 *                         isVerified:
 *                           type: boolean
 *                         isCompliant:
 *                           type: boolean
 *                         issues:
 *                           type: array
 *                           items:
 *                             type: string
 *                     donations:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: number
 *                         compliantCount:
 *                           type: number
 *                         totalAmount:
 *                           type: number
 *                         complianceRate:
 *                           type: number
 *                         taxYear:
 *                           type: number
 *                     irdAuditReady:
 *                       type: boolean
 *                     nextSteps:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get(
  '/companies/:companyNumber/compliance-dashboard',
  companyNumberValidation,
  controller.getComplianceDashboard
);

/**
 * @swagger
 * /api/receipts/{donationId}/download:
 *   get:
 *     summary: Download IRD-compliant receipt PDF
 *     tags: [Receipts]
 *     parameters:
 *       - in: path
 *         name: donationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Donation ID
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Receipt not found
 */
router.get(
  '/receipts/:donationId/download',
  param('donationId').isString().notEmpty(),
  controller.downloadReceipt
);

export default router;
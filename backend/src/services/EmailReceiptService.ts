import sgMail from '@sendgrid/mail';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface ReceiptData {
  donationId: string;
  donorName: string;
  donorEmail: string;
  companyName: string;
  companyNumber: string;
  charityName: string;
  charityNumber: string;
  amount: number;
  currency: string;
  date: Date;
  receiptNumber: string;
  transactionId?: string;
  blockchainTxHash?: string;
  accountantEmail?: string;
}

class EmailReceiptService {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = !!process.env.SENDGRID_API_KEY;
    if (!this.isEnabled) {
      logger.warn('⚠️ SendGrid not configured - email receipts disabled');
    } else {
      logger.info('✅ Email receipt service initialized');
    }
  }

  /**
   * Generate IRD-compliant PDF receipt
   */
  async generatePDFReceipt(data: ReceiptData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const chunks: Buffer[] = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20)
           .fillColor('#1f2937')
           .text('TAX RECEIPT', 50, 50);

        doc.fontSize(14)
           .text('Isbjorn Foundation', 50, 80)
           .text('Auckland, New Zealand', 50, 95)
           .text('Charity Registration: CC12345', 50, 110)
           .text('IRD Number: IRD123456789', 50, 125);

        // Receipt details
        doc.fontSize(16)
           .fillColor('#374151')
           .text('DONATION RECEIPT', 50, 180);

        const startY = 220;
        const lineHeight = 25;
        let currentY = startY;

        const details = [
          ['Receipt Number:', data.receiptNumber],
          ['Date:', data.date.toLocaleDateString('en-NZ')],
          ['Donor:', data.donorName],
          ['Company:', data.companyName],
          ['Company Number:', data.companyNumber],
          ['Charity:', data.charityName],
          ['Charity Number:', data.charityNumber],
          ['Amount:', `${data.currency} $${data.amount.toLocaleString()}`],
          ['Transaction ID:', data.transactionId || 'N/A']
        ];

        doc.fontSize(12);
        details.forEach(([label, value]) => {
          doc.fillColor('#6b7280')
             .text(label, 50, currentY)
             .fillColor('#1f2937')
             .text(value, 200, currentY);
          currentY += lineHeight;
        });

        // IRD Compliance section
        currentY += 30;
        doc.fontSize(14)
           .fillColor('#dc2626')
           .text('IRD TAX COMPLIANCE', 50, currentY);

        currentY += 30;
        doc.fontSize(10)
           .fillColor('#374151')
           .text('This receipt is issued for tax purposes under New Zealand tax law.', 50, currentY)
           .text('The donation was made to an approved donee organisation.', 50, currentY + 15)
           .text('No goods or services were provided in return for this donation.', 50, currentY + 30)
           .text('This receipt should be retained for IRD audit purposes.', 50, currentY + 45);

        // Blockchain verification (if available)
        if (data.blockchainTxHash) {
          currentY += 80;
          doc.fontSize(12)
             .fillColor('#059669')
             .text('BLOCKCHAIN VERIFICATION', 50, currentY);
          
          doc.fontSize(10)
             .fillColor('#374151')
             .text(`Transaction Hash: ${data.blockchainTxHash}`, 50, currentY + 20)
             .text('This donation has been permanently recorded on the Avalanche blockchain.', 50, currentY + 35);
        }

        // Footer
        doc.fontSize(8)
           .fillColor('#6b7280')
           .text(`Generated on ${new Date().toLocaleString('en-NZ')}`, 50, 750)
           .text('Isbjorn Foundation - Protecting Arctic Wildlife', 50, 765)
           .text('https://isbjorn.co.nz', 50, 780);

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send receipt email with PDF attachment
   */
  async sendReceipt(data: ReceiptData): Promise<boolean> {
    if (!this.isEnabled) {
      logger.warn('SendGrid not enabled, skipping email send');
      return false;
    }

    try {
      logger.info(`📧 Sending receipt email to ${data.donorEmail}`);

      // Generate PDF receipt
      const pdfBuffer = await this.generatePDFReceipt(data);

      // Create email content
      const emailHTML = this.generateEmailHTML(data);
      const emailText = this.generateEmailText(data);

      // Prepare recipients
      const recipients = [data.donorEmail];
      if (data.accountantEmail) {
        recipients.push(data.accountantEmail);
      }

      // Send emails
      const emailPromises = recipients.map(email => 
        this.sendSingleEmail(email, data, emailHTML, emailText, pdfBuffer)
      );

      await Promise.all(emailPromises);
      
      logger.info(`✅ Receipt emails sent successfully to ${recipients.join(', ')}`);
      return true;

    } catch (error) {
      logger.error('❌ Failed to send receipt email:', error);
      return false;
    }
  }

  /**
   * Send individual email
   */
  private async sendSingleEmail(
    email: string,
    data: ReceiptData,
    html: string,
    text: string,
    pdfBuffer: Buffer
  ): Promise<void> {
    const msg = {
      to: email,
      from: {
        email: process.env.FROM_EMAIL || 'donations@isbjorn.co.nz',
        name: process.env.FROM_NAME || 'Isbjorn Foundation'
      },
      subject: `Tax Receipt - Donation #${data.receiptNumber}`,
      text,
      html,
      attachments: [
        {
          content: pdfBuffer.toString('base64'),
          filename: `receipt-${data.receiptNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    await sgMail.send(msg);
  }

  /**
   * Generate HTML email content
   */
  private generateEmailHTML(data: ReceiptData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Donation Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .receipt-details { background-color: #f8fafc; padding: 15px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .amount { font-size: 24px; font-weight: bold; color: #059669; }
          .footer { background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🐻‍❄️ Thank you for your donation!</h1>
          <p>Isbjorn Foundation</p>
        </div>
        
        <div class="content">
          <p>Dear ${data.donorName},</p>
          
          <p>Thank you for your generous donation to <strong>${data.charityName}</strong>. Your contribution helps make a real difference in protecting Arctic wildlife and supporting important causes.</p>
          
          <div class="receipt-details">
            <h3>Donation Details</h3>
            <p><strong>Receipt Number:</strong> ${data.receiptNumber}</p>
            <p><strong>Date:</strong> ${data.date.toLocaleDateString('en-NZ')}</p>
            <p><strong>Charity:</strong> ${data.charityName}</p>
            <p><strong>Amount:</strong> <span class="amount">${data.currency} $${data.amount.toLocaleString()}</span></p>
            ${data.blockchainTxHash ? `<p><strong>Blockchain Hash:</strong> ${data.blockchainTxHash}</p>` : ''}
          </div>
          
          <p><strong>📄 IRD Tax Receipt:</strong> Your official tax receipt is attached as a PDF. Please keep this for your tax records.</p>
          
          ${data.blockchainTxHash ? '<p><strong>🔗 Blockchain Verification:</strong> Your donation has been permanently recorded on the Avalanche blockchain for complete transparency.</p>' : ''}
          
          <p>If you have any questions about your donation or need additional documentation, please don't hesitate to contact us.</p>
          
          <p>With gratitude,<br>The Isbjorn Foundation Team</p>
        </div>
        
        <div class="footer">
          <p>Isbjorn Foundation | Auckland, New Zealand | Charity Registration: CC12345</p>
          <p>This email was generated automatically. Please do not reply to this email.</p>
          <p><a href="https://isbjorn.co.nz">https://isbjorn.co.nz</a></p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text email content
   */
  private generateEmailText(data: ReceiptData): string {
    return `
      DONATION RECEIPT - Isbjorn Foundation
      
      Dear ${data.donorName},
      
      Thank you for your generous donation to ${data.charityName}.
      
      DONATION DETAILS:
      Receipt Number: ${data.receiptNumber}
      Date: ${data.date.toLocaleDateString('en-NZ')}
      Charity: ${data.charityName}
      Amount: ${data.currency} $${data.amount.toLocaleString()}
      ${data.blockchainTxHash ? `Blockchain Hash: ${data.blockchainTxHash}` : ''}
      
      Your official IRD tax receipt is attached as a PDF.
      
      ${data.blockchainTxHash ? 'Your donation has been permanently recorded on the Avalanche blockchain for complete transparency.' : ''}
      
      With gratitude,
      The Isbjorn Foundation Team
      
      ---
      Isbjorn Foundation
      Auckland, New Zealand
      Charity Registration: CC12345
      https://isbjorn.co.nz
    `;
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, name: string, companyName?: string): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      const msg = {
        to: email,
        from: {
          email: process.env.FROM_EMAIL || 'welcome@isbjorn.co.nz',
          name: process.env.FROM_NAME || 'Isbjorn Foundation'
        },
        subject: 'Welcome to Isbjorn Foundation',
        html: `
          <h1>🐻‍❄️ Welcome to Isbjorn Foundation!</h1>
          <p>Dear ${name},</p>
          <p>Thank you for joining the Isbjorn Foundation platform${companyName ? ` on behalf of ${companyName}` : ''}.</p>
          <p>You can now easily make tax-deductible donations to verified New Zealand charities with instant IRD-compliant receipts.</p>
          <p><a href="${process.env.FRONTEND_URL}/donate">Start donating today</a></p>
          <p>Best regards,<br>The Isbjorn Team</p>
        `
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Test email configuration
   */
  async testConfiguration(): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      const testEmail = process.env.TEST_EMAIL || 'admin@isbjorn.co.nz';
      const msg = {
        to: testEmail,
        from: process.env.FROM_EMAIL || 'test@isbjorn.co.nz',
        subject: 'Isbjorn Email Test',
        text: 'This is a test email from the Isbjorn platform.',
        html: '<p>This is a test email from the Isbjorn platform.</p>'
      };

      await sgMail.send(msg);
      logger.info('✅ Email test successful');
      return true;
    } catch (error) {
      logger.error('❌ Email test failed:', error);
      return false;
    }
  }
}

export default new EmailReceiptService();
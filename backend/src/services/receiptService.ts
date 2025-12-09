import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { s3Service } from '../utils/s3';
import { Donation } from '../models/Donation.model';

export class ReceiptService {
    /**
     * Generates a PDF tax receipt for a donation
     */
    async generateReceipt(donation: Donation): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const buffers: Buffer[] = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });

                // Header
                doc.fontSize(25).text('Isbjorn Foundation', { align: 'center' });
                doc.fontSize(12).text('Official Tax Receipt', { align: 'center' });
                doc.moveDown();

                // Donation Details
                doc.fontSize(12).text(`Receipt ID: ${donation.id}`);
                doc.text(`Date: ${new Date().toLocaleDateString()}`);
                doc.text(`Donor: ${donation.user?.companyName || 'Anonymous'}`); // Assuming user relation loaded
                doc.moveDown();

                doc.fontSize(14).font('Helvetica-Bold').text(`Amount Donated: $${donation.amount} ${donation.currency.toUpperCase()}`);
                doc.font('Helvetica');
                doc.moveDown();

                // Legal Text
                doc.fontSize(10).text('Isbjorn Foundation is a registered 501(c)(3) nonprofit organization. No goods or services were provided in exchange for this contribution.', { align: 'justify' });
                doc.moveDown();

                // Footer
                doc.fontSize(10).text('Thank you for supporting polar bear conservation.', { align: 'center' });

                doc.end();
            } catch (error) {
                logger.error('Error generating PDF receipt:', error);
                reject(error);
            }
        });
    }

    /**
     * Generate and upload receipt to S3
     */
    async generateAndUploadReceipt(donation: Donation): Promise<string> {
        try {
            // Generate PDF receipt
            const receiptBuffer = await this.generateReceipt(donation);

            // Upload to S3
            const s3Url = await s3Service.uploadReceipt(donation.id, receiptBuffer);

            logger.info(`Receipt generated and uploaded for donation ${donation.id}: ${s3Url}`);
            return s3Url;
        } catch (error) {
            logger.error('Error generating and uploading receipt:', error);
            throw error;
        }
    }

    /**
     * Get download URL for a receipt
     */
    async getReceiptDownloadUrl(donationId: string): Promise<string> {
        try {
            const downloadUrl = await s3Service.getReceiptDownloadUrl(donationId);
            return downloadUrl;
        } catch (error) {
            logger.error('Error getting receipt download URL:', error);
            throw error;
        }
    }
}

export const receiptService = new ReceiptService();

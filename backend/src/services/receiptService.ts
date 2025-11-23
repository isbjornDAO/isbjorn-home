import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
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
}

export const receiptService = new ReceiptService();

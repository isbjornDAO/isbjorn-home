// AWS S3 Client for receipt storage
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from './logger';

// S3 Configuration
const region = process.env.AWS_REGION || 'ap-southeast-2';
const bucket = process.env.AWS_S3_BUCKET || 'isbjorn-receipts-production';

// Initialize S3 Client
const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});

export class S3Service {
    private bucket: string;
    private client: S3Client;

    constructor() {
        this.bucket = bucket;
        this.client = s3Client;

        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            logger.warn('AWS credentials not configured. S3 storage will not work.');
        } else {
            logger.info(`S3 Service initialized: region=${region}, bucket=${bucket}`);
        }
    }

    /**
     * Upload a file to S3
     */
    async uploadFile(key: string, body: Buffer, contentType: string = 'application/pdf'): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
                ServerSideEncryption: 'AES256',
                Metadata: {
                    'uploaded-at': new Date().toISOString(),
                    'service': 'isbjorn-donation-platform'
                }
            });

            await this.client.send(command);

            const url = `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
            logger.info(`File uploaded to S3: ${key}`);

            return url;
        } catch (error) {
            logger.error('Error uploading file to S3:', error);
            throw new Error(`Failed to upload file to S3: ${error}`);
        }
    }

    /**
     * Get a signed URL for temporary access to a file
     */
    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key
            });

            const signedUrl = await getSignedUrl(this.client, command, { expiresIn });
            logger.info(`Generated signed URL for: ${key} (expires in ${expiresIn}s)`);

            return signedUrl;
        } catch (error) {
            logger.error('Error generating signed URL:', error);
            throw new Error(`Failed to generate signed URL: ${error}`);
        }
    }

    /**
     * Delete a file from S3
     */
    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key
            });

            await this.client.send(command);
            logger.info(`File deleted from S3: ${key}`);
        } catch (error) {
            logger.error('Error deleting file from S3:', error);
            throw new Error(`Failed to delete file from S3: ${error}`);
        }
    }

    /**
     * Upload a PDF receipt with standardized naming
     */
    async uploadReceipt(donationId: string, receiptBuffer: Buffer): Promise<string> {
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const key = `receipts/${timestamp}/${donationId}.pdf`;

        return await this.uploadFile(key, receiptBuffer, 'application/pdf');
    }

    /**
     * Get a temporary download link for a receipt (valid for 1 hour)
     */
    async getReceiptDownloadUrl(donationId: string): Promise<string> {
        // Find the receipt by searching for the donation ID
        // Note: This is a simplified version - in production, store the S3 key in the database
        const timestamp = new Date().toISOString().split('T')[0];
        const key = `receipts/${timestamp}/${donationId}.pdf`;

        return await this.getSignedUrl(key, 3600); // 1 hour expiry
    }
}

export const s3Service = new S3Service();

import { Application } from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import the Express app (we'll modify server.ts to export it)
import app from '../src/app';

// Vercel serverless function handler
export default app;

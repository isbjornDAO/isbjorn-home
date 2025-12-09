import express from 'express';
import axios from 'axios';
import { logger } from '../utils/logger';

const router = express.Router();

const NZBN_API_BASE = 'https://api.business.govt.nz/services/v4';
const NZBN_API_KEY = process.env.NZBN_API_KEY || '';

/**
 * Search NZBN Register for companies
 * GET /api/public/nzbn/search?query=companyname
 */
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string' || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query must be at least 2 characters'
      });
    }

    if (!NZBN_API_KEY || NZBN_API_KEY === 'mock_companies_api_key') {
      logger.warn('NZBN API key not configured, using mock data');

      // Return mock data for development
      const mockCompanies = [
        { nzbn: '9429000000001', entityName: 'Test Company Ltd', entityStatusDescription: 'Registered', entityTypeDescription: 'NZ Limited Company' },
        { nzbn: '9429000000002', entityName: 'Acme Corporation Limited', entityStatusDescription: 'Registered', entityTypeDescription: 'NZ Limited Company' },
        { nzbn: '9429000000003', entityName: 'Tech Innovations NZ Ltd', entityStatusDescription: 'Registered', entityTypeDescription: 'NZ Limited Company' },
        { nzbn: '9429000000004', entityName: 'Green Energy Solutions', entityStatusDescription: 'Registered', entityTypeDescription: 'NZ Limited Company' },
        { nzbn: '9429000000005', entityName: 'Pacific Consulting Group', entityStatusDescription: 'Registered', entityTypeDescription: 'NZ Limited Company' },
      ];

      const filtered = mockCompanies.filter(company =>
        company.entityName.toLowerCase().includes(query.toLowerCase()) ||
        company.nzbn.includes(query)
      );

      return res.json({
        success: true,
        data: filtered.map(c => ({
          nzbn: c.nzbn,
          name: c.entityName,
          status: c.entityStatusDescription,
          type: c.entityTypeDescription
        }))
      });
    }

    // Real API call
    const response = await axios.get(`${NZBN_API_BASE}/nzbn-entities`, {
      params: {
        'search-term': query,
        'page-size': 10,
        'page-number': 1
      },
      headers: {
        'Ocp-Apim-Subscription-Key': NZBN_API_KEY,
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    const entities = response.data?.items || [];

    const results = entities.map((entity: any) => ({
      nzbn: entity.nzbn,
      name: entity.entityName,
      status: entity.entityStatusDescription,
      type: entity.entityTypeDescription,
      registrationDate: entity.registrationDate
    }));

    res.json({
      success: true,
      data: results
    });

  } catch (error: any) {
    logger.error('NZBN search error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.response?.status === 401) {
      return res.status(500).json({
        success: false,
        message: 'NZBN API authentication failed'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to search NZBN register'
    });
  }
});

/**
 * Get detailed information for a specific NZBN
 * GET /api/public/nzbn/:nzbn
 */
router.get('/:nzbn', async (req, res) => {
  try {
    const { nzbn } = req.params;

    if (!nzbn || !/^\d{13}$/.test(nzbn)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid NZBN format (must be 13 digits)'
      });
    }

    if (!NZBN_API_KEY || NZBN_API_KEY === 'mock_companies_api_key') {
      // Mock response
      return res.json({
        success: true,
        data: {
          nzbn,
          name: 'Mock Company Ltd',
          status: 'Registered',
          type: 'NZ Limited Company',
          registrationDate: '2020-01-01'
        }
      });
    }

    // Real API call
    const response = await axios.get(`${NZBN_API_BASE}/nzbn-entities/${nzbn}`, {
      headers: {
        'Ocp-Apim-Subscription-Key': NZBN_API_KEY,
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    const entity = response.data;

    res.json({
      success: true,
      data: {
        nzbn: entity.nzbn,
        name: entity.entityName,
        status: entity.entityStatusDescription,
        type: entity.entityTypeDescription,
        registrationDate: entity.registrationDate,
        addresses: entity.addresses
      }
    });

  } catch (error: any) {
    logger.error('NZBN lookup error:', error);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'NZBN not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to lookup NZBN'
    });
  }
});

export default router;

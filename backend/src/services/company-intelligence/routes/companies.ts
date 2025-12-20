/**
 * Company Intelligence API Routes
 * REST endpoints for company data management
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as companyService from '../services/companyService';
import * as fileStorage from '../services/fileStorage';
import type {
  CreateCompanyRequest,
  UpdateCompanyRequest,
  AddRelationshipRequest,
  AddFinancialRecordRequest,
  AddEventRequest,
  ListCompaniesQuery,
} from '../models/schemas';

const router = Router();

/**
 * Create company (manual entry)
 * POST /api/companies
 */
router.post('/', async (req, res) => {
  try {
    const data = req.body as CreateCompanyRequest;

    // Validate source is provided
    if (!data.source_name || !data.source_url) {
      return res.status(400).json({
        success: false,
        error: 'source_name and source_url are required',
      });
    }

    // Save raw file if provided
    let rawFilePath: string | undefined;
    if (data.raw_file_path) {
      rawFilePath = await fileStorage.saveRawFile(
        data.source_name,
        data.raw_file_path,
        req.body.raw_file_content // If file content is provided
      );
    }

    const company = await companyService.createCompany({
      ...data,
      raw_file_path: rawFilePath,
    });

    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create company',
    });
  }
});

/**
 * Update company (creates new version, never overwrites)
 * PUT /api/companies/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateCompanyRequest;

    // Validate source is provided
    if (!data.source_name || !data.source_url) {
      return res.status(400).json({
        success: false,
        error: 'source_name and source_url are required for updates',
      });
    }

    // Save raw file if provided
    let rawFilePath: string | undefined;
    if (data.raw_file_path) {
      rawFilePath = await fileStorage.saveRawFile(
        data.source_name,
        data.raw_file_path,
        req.body.raw_file_content
      );
    }

    const company = await companyService.updateCompany(id, {
      ...data,
      raw_file_path: rawFilePath,
    });

    res.json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update company',
    });
  }
});

/**
 * Get company (latest + historical)
 * GET /api/companies/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const includeHistory = req.query.history === 'true';

    const company = await companyService.getCompany(id, includeHistory);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch company',
    });
  }
});

/**
 * List companies
 * GET /api/companies
 */
router.get('/', async (req, res) => {
  try {
    const query = req.query as unknown as ListCompaniesQuery;
    const companies = await companyService.listCompanies(query);

    res.json({
      success: true,
      data: companies,
      count: companies.length,
    });
  } catch (error: any) {
    console.error('List companies error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list companies',
    });
  }
});

/**
 * Add relationship
 * POST /api/companies/:id/relationships
 */
router.post('/:id/relationships', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body as AddRelationshipRequest;

    if (!data.source_name || !data.source_url) {
      return res.status(400).json({
        success: false,
        error: 'source_name and source_url are required',
      });
    }

    const relationship = await companyService.addRelationship(id, data);

    res.status(201).json({
      success: true,
      data: relationship,
    });
  } catch (error: any) {
    console.error('Add relationship error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add relationship',
    });
  }
});

/**
 * Add financial record
 * POST /api/companies/:id/financials
 */
router.post('/:id/financials', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body as AddFinancialRecordRequest;

    if (!data.source_name || !data.source_url) {
      return res.status(400).json({
        success: false,
        error: 'source_name and source_url are required',
      });
    }

    const financial = await companyService.addFinancialRecord(id, data);

    res.status(201).json({
      success: true,
      data: financial,
    });
  } catch (error: any) {
    console.error('Add financial record error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add financial record',
    });
  }
});

/**
 * Add event
 * POST /api/companies/:id/events
 */
router.post('/:id/events', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body as AddEventRequest;

    if (!data.source_name || !data.source_url) {
      return res.status(400).json({
        success: false,
        error: 'source_name and source_url are required',
      });
    }

    const event = await companyService.addEvent(id, data);

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error('Add event error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add event',
    });
  }
});

/**
 * Audit endpoint - show full provenance for a company
 * GET /api/companies/:id/audit
 */
router.get('/:id/audit', async (req, res) => {
  try {
    const { id } = req.params;
    const audit = await companyService.getCompanyAudit(id);

    if (!audit) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    res.json({
      success: true,
      data: audit,
    });
  } catch (error: any) {
    console.error('Get audit error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch audit trail',
    });
  }
});

export default router;


/**
 * Company Service
 * Business logic for company intelligence operations
 */

import { v4 as uuidv4 } from 'uuid';
import { db, dbType } from '../../../database';
import type { pool } from '../../../database/postgresql';
import type {
  CompanyIdentity,
  CompanySource,
  CompanyRelationship,
  FinancialRecord,
  CompanyEvent,
  CompanyFull,
  ConfidenceLevel,
} from '../models/types';
import type {
  CreateCompanyRequest,
  UpdateCompanyRequest,
  AddRelationshipRequest,
  AddFinancialRecordRequest,
  AddEventRequest,
  ListCompaniesQuery,
} from '../models/schemas';

/**
 * Create or get source
 */
async function getOrCreateSource(
  sourceName: string,
  sourceUrl: string,
  licenseType?: string,
  rawFilePath?: string
): Promise<string> {
  const sourceId = uuidv4();
  const now = new Date().toISOString();

  if (dbType === 'postgresql') {
    const { pool } = await import('../../../database/postgresql');
    await pool.query(`
      INSERT INTO company_sources (id, source_name, source_url, license_type, raw_file_path, ingestion_timestamp, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT DO NOTHING
    `, [sourceId, sourceName, sourceUrl, licenseType || null, rawFilePath || null, now, now]);
  } else {
    const { db } = await import('../../../database/sqlite');
    db.prepare(`
      INSERT OR IGNORE INTO company_sources (id, source_name, source_url, license_type, raw_file_path, ingestion_timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(sourceId, sourceName, sourceUrl, licenseType || null, rawFilePath || null, now, now);
  }

  return sourceId;
}

/**
 * Create company
 */
export async function createCompany(data: CreateCompanyRequest): Promise<CompanyIdentity> {
  const sourceId = await getOrCreateSource(
    data.source_name,
    data.source_url,
    data.license_type,
    data.raw_file_path
  );

  const companyId = uuidv4();
  const now = new Date().toISOString();
  const confidence = data.confidence_level || 'MEDIUM';

  if (dbType === 'postgresql') {
    const { pool } = await import('../../../database/postgresql');
    await pool.query(`
      INSERT INTO companies (
        id, legal_name, org_number, country, incorporation_date, listing_status,
        tickers, isins, lei, version, source_id, confidence_level, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      companyId,
      data.legal_name,
      data.org_number || null,
      data.country || null,
      data.incorporation_date || null,
      data.listing_status || null,
      JSON.stringify(data.tickers || []),
      JSON.stringify(data.isins || []),
      data.lei || null,
      1,
      sourceId,
      confidence,
      now,
      now,
    ]);
  } else {
    const { db } = await import('../../../database/sqlite');
    db.prepare(`
      INSERT INTO companies (
        id, legal_name, org_number, country, incorporation_date, listing_status,
        tickers, isins, lei, version, source_id, confidence_level, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      companyId,
      data.legal_name,
      data.org_number || null,
      data.country || null,
      data.incorporation_date || null,
      data.listing_status || null,
      JSON.stringify(data.tickers || []),
      JSON.stringify(data.isins || []),
      data.lei || null,
      1,
      sourceId,
      confidence,
      now,
      now,
    );
  }

  return getCompanyById(companyId) as Promise<CompanyIdentity>;
}

/**
 * Update company (creates new version)
 */
export async function updateCompany(
  companyId: string,
  data: UpdateCompanyRequest
): Promise<CompanyIdentity> {
  // Get current version
  const current = await getCompanyById(companyId);
  if (!current) {
    throw new Error('Company not found');
  }

  // Save current version to history
  const versionId = uuidv4();
  const now = new Date().toISOString();

  if (dbType === 'postgresql') {
    const { pool } = await import('../../../database/postgresql');
    await pool.query(`
      INSERT INTO company_versions (
        id, company_id, version, legal_name, org_number, country, incorporation_date,
        listing_status, tickers, isins, lei, source_id, confidence_level, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      versionId,
      companyId,
      current.version,
      current.legal_name,
      current.org_number || null,
      current.country || null,
      current.incorporation_date || null,
      current.listing_status || null,
      JSON.stringify(current.tickers),
      JSON.stringify(current.isins),
      current.lei || null,
      current.source_id,
      current.confidence_level,
      now,
    ]);
  } else {
    const { db } = await import('../../../database/sqlite');
    db.prepare(`
      INSERT INTO company_versions (
        id, company_id, version, legal_name, org_number, country, incorporation_date,
        listing_status, tickers, isins, lei, source_id, confidence_level, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      versionId,
      companyId,
      current.version,
      current.legal_name,
      current.org_number || null,
      current.country || null,
      current.incorporation_date || null,
      current.listing_status || null,
      JSON.stringify(current.tickers),
      JSON.stringify(current.isins),
      current.lei || null,
      current.source_id,
      current.confidence_level,
      now,
    );
  }

  // Create new source
  const sourceId = await getOrCreateSource(
    data.source_name!,
    data.source_url!,
    data.license_type,
    data.raw_file_path
  );

  // Update company with new version
  const newVersion = current.version + 1;
  const confidence = data.confidence_level || current.confidence_level;

  if (dbType === 'postgresql') {
    const { pool } = await import('../../../database/postgresql');
    await pool.query(`
      UPDATE companies SET
        legal_name = COALESCE($1, legal_name),
        org_number = COALESCE($2, org_number),
        country = COALESCE($3, country),
        incorporation_date = COALESCE($4, incorporation_date),
        listing_status = COALESCE($5, listing_status),
        tickers = COALESCE($6, tickers),
        isins = COALESCE($7, isins),
        lei = COALESCE($8, lei),
        version = $9,
        source_id = $10,
        confidence_level = $11,
        updated_at = $12
      WHERE id = $13
    `, [
      data.legal_name || null,
      data.org_number || null,
      data.country || null,
      data.incorporation_date || null,
      data.listing_status || null,
      data.tickers ? JSON.stringify(data.tickers) : null,
      data.isins ? JSON.stringify(data.isins) : null,
      data.lei || null,
      newVersion,
      sourceId,
      confidence,
      now,
      companyId,
    ]);
  } else {
    const { db } = await import('../../../database/sqlite');
    db.prepare(`
      UPDATE companies SET
        legal_name = COALESCE(?, legal_name),
        org_number = COALESCE(?, org_number),
        country = COALESCE(?, country),
        incorporation_date = COALESCE(?, incorporation_date),
        listing_status = COALESCE(?, listing_status),
        tickers = COALESCE(?, tickers),
        isins = COALESCE(?, isins),
        lei = COALESCE(?, lei),
        version = ?,
        source_id = ?,
        confidence_level = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      data.legal_name || null,
      data.org_number || null,
      data.country || null,
      data.incorporation_date || null,
      data.listing_status || null,
      data.tickers ? JSON.stringify(data.tickers) : null,
      data.isins ? JSON.stringify(data.isins) : null,
      data.lei || null,
      newVersion,
      sourceId,
      confidence,
      now,
      companyId,
    );
  }

  return getCompanyById(companyId) as Promise<CompanyIdentity>;
}

/**
 * Get company by ID
 */
async function getCompanyById(companyId: string): Promise<CompanyIdentity | null> {
  let row: any;

  if (dbType === 'postgresql') {
    const { pool } = await import('../../../database/postgresql');
    const result = await pool.query(`
      SELECT * FROM companies WHERE id = $1 AND is_deleted = 0
    `, [companyId]);
    row = result.rows[0];
  } else {
    const { db } = await import('../../../database/sqlite');
    row = db.prepare('SELECT * FROM companies WHERE id = ? AND is_deleted = 0').get(companyId) as any;
  }

  if (!row) return null;

  return {
    id: row.id,
    legal_name: row.legal_name,
    org_number: row.org_number,
    country: row.country,
    incorporation_date: row.incorporation_date,
    listing_status: row.listing_status,
    tickers: JSON.parse(row.tickers || '[]'),
    isins: JSON.parse(row.isins || '[]'),
    lei: row.lei,
    version: row.version,
    is_deleted: Boolean(row.is_deleted),
    source_id: row.source_id,
    confidence_level: row.confidence_level,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Get company with full details
 */
export async function getCompany(companyId: string, includeHistory: boolean = false): Promise<CompanyFull | null> {
  const identity = await getCompanyById(companyId);
  if (!identity) return null;

  // Get relationships, financials, events, etc.
  // Simplified for now - full implementation would fetch all related data

  return {
    identity,
    relationships: [],
    financials: [],
    events: [],
    versions: [],
    sources: [],
  };
}

/**
 * List companies
 */
export async function listCompanies(query: ListCompaniesQuery): Promise<CompanyIdentity[]> {
  let rows: any[];

  if (dbType === 'postgresql') {
    const { pool } = await import('../../../database/postgresql');
    let sql = 'SELECT * FROM companies WHERE is_deleted = 0';
    const params: any[] = [];
    
    if (query.country) {
      sql += ' AND country = $' + (params.length + 1);
      params.push(query.country);
    }
    if (query.org_number) {
      sql += ' AND org_number = $' + (params.length + 1);
      params.push(query.org_number);
    }
    sql += ' ORDER BY created_at DESC';
    if (query.limit) {
      sql += ' LIMIT $' + (params.length + 1);
      params.push(query.limit);
    }
    if (query.offset) {
      sql += ' OFFSET $' + (params.length + 1);
      params.push(query.offset);
    }

    const result = await pool.query(sql, params);
    rows = result.rows;
  } else {
    const { db } = await import('../../../database/sqlite');
    let sql = 'SELECT * FROM companies WHERE is_deleted = 0';
    const params: any[] = [];
    
    if (query.country) {
      sql += ' AND country = ?';
      params.push(query.country);
    }
    if (query.org_number) {
      sql += ' AND org_number = ?';
      params.push(query.org_number);
    }
    sql += ' ORDER BY created_at DESC';
    if (query.limit) {
      sql += ' LIMIT ?';
      params.push(query.limit);
    }
    if (query.offset) {
      sql += ' OFFSET ?';
      params.push(query.offset);
    }

    rows = db.prepare(sql).all(...params) as any[];
  }

  return rows.map(row => ({
    id: row.id,
    legal_name: row.legal_name,
    org_number: row.org_number,
    country: row.country,
    incorporation_date: row.incorporation_date,
    listing_status: row.listing_status,
    tickers: JSON.parse(row.tickers || '[]'),
    isins: JSON.parse(row.isins || '[]'),
    lei: row.lei,
    version: row.version,
    is_deleted: Boolean(row.is_deleted),
    source_id: row.source_id,
    confidence_level: row.confidence_level,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

/**
 * Add relationship
 */
export async function addRelationship(
  companyId: string,
  data: AddRelationshipRequest
): Promise<CompanyRelationship> {
  const sourceId = await getOrCreateSource(
    data.source_name,
    data.source_url,
    data.license_type,
    data.raw_file_path
  );

  const relationshipId = uuidv4();
  const now = new Date().toISOString();
  const confidence = data.confidence_level || 'MEDIUM';

  if (dbType === 'postgresql') {
    const { pool } = await import('../../../database/postgresql');
    await pool.query(`
      INSERT INTO company_relationships (
        id, company_id, related_company_id, relationship_type, ownership_percentage,
        valid_from, valid_to, source_id, confidence_level, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      relationshipId,
      companyId,
      data.related_company_id,
      data.relationship_type,
      data.ownership_percentage || null,
      data.valid_from || null,
      data.valid_to || null,
      sourceId,
      confidence,
      now,
    ]);
  } else {
    const { db } = await import('../../../database/sqlite');
    db.prepare(`
      INSERT INTO company_relationships (
        id, company_id, related_company_id, relationship_type, ownership_percentage,
        valid_from, valid_to, source_id, confidence_level, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      relationshipId,
      companyId,
      data.related_company_id,
      data.relationship_type,
      data.ownership_percentage || null,
      data.valid_from || null,
      data.valid_to || null,
      sourceId,
      confidence,
      now,
    );
  }

  // Return relationship (simplified)
  return {
    id: relationshipId,
    company_id: companyId,
    related_company_id: data.related_company_id,
    relationship_type: data.relationship_type,
    ownership_percentage: data.ownership_percentage,
    valid_from: data.valid_from,
    valid_to: data.valid_to,
    source_id: sourceId,
    confidence_level: confidence,
    created_at: now,
  };
}

/**
 * Add financial record
 */
export async function addFinancialRecord(
  companyId: string,
  data: AddFinancialRecordRequest
): Promise<FinancialRecord> {
  const sourceId = await getOrCreateSource(
    data.source_name,
    data.source_url,
    data.license_type,
    data.raw_file_path
  );

  const financialId = uuidv4();
  const now = new Date().toISOString();
  const confidence = data.confidence_level || 'MEDIUM';

  if (dbType === 'postgresql') {
    const { pool } = await import('../../../database/postgresql');
    await pool.query(`
      INSERT INTO company_financials (
        id, company_id, fiscal_period, currency, revenue, ebitda, net_income,
        capex, total_debt, source_document, reported_date, source_id, confidence_level, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (company_id, fiscal_period, source_id) DO UPDATE SET
        revenue = EXCLUDED.revenue,
        ebitda = EXCLUDED.ebitda,
        net_income = EXCLUDED.net_income,
        capex = EXCLUDED.capex,
        total_debt = EXCLUDED.total_debt
    `, [
      financialId,
      companyId,
      data.fiscal_period,
      data.currency,
      data.revenue || null,
      data.ebitda || null,
      data.net_income || null,
      data.capex || null,
      data.total_debt || null,
      data.source_document || null,
      data.reported_date || null,
      sourceId,
      confidence,
      now,
    ]);
  } else {
    const { db } = await import('../../../database/sqlite');
    db.prepare(`
      INSERT OR REPLACE INTO company_financials (
        id, company_id, fiscal_period, currency, revenue, ebitda, net_income,
        capex, total_debt, source_document, reported_date, source_id, confidence_level, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      financialId,
      companyId,
      data.fiscal_period,
      data.currency,
      data.revenue || null,
      data.ebitda || null,
      data.net_income || null,
      data.capex || null,
      data.total_debt || null,
      data.source_document || null,
      data.reported_date || null,
      sourceId,
      confidence,
      now,
    );
  }

  return {
    id: financialId,
    company_id: companyId,
    fiscal_period: data.fiscal_period,
    currency: data.currency,
    revenue: data.revenue,
    ebitda: data.ebitda,
    net_income: data.net_income,
    capex: data.capex,
    total_debt: data.total_debt,
    source_document: data.source_document,
    reported_date: data.reported_date,
    source_id: sourceId,
    confidence_level: confidence,
    created_at: now,
  };
}

/**
 * Add event
 */
export async function addEvent(companyId: string, data: AddEventRequest): Promise<CompanyEvent> {
  const sourceId = await getOrCreateSource(
    data.source_name,
    data.source_url,
    data.license_type,
    data.raw_file_path
  );

  const eventId = uuidv4();
  const now = new Date().toISOString();
  const confidence = data.confidence_level || 'MEDIUM';

  if (dbType === 'postgresql') {
    const { pool } = await import('../../../database/postgresql');
    await pool.query(`
      INSERT INTO company_events (
        id, company_id, event_type, event_date, severity, description,
        source_reference, source_id, confidence_level, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      eventId,
      companyId,
      data.event_type,
      data.event_date,
      data.severity || null,
      data.description || null,
      data.source_reference || null,
      sourceId,
      confidence,
      now,
    ]);
  } else {
    const { db } = await import('../../../database/sqlite');
    db.prepare(`
      INSERT INTO company_events (
        id, company_id, event_type, event_date, severity, description,
        source_reference, source_id, confidence_level, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      companyId,
      data.event_type,
      data.event_date,
      data.severity || null,
      data.description || null,
      data.source_reference || null,
      sourceId,
      confidence,
      now,
    );
  }

  return {
    id: eventId,
    company_id: companyId,
    event_type: data.event_type,
    event_date: data.event_date,
    severity: data.severity,
    description: data.description,
    source_reference: data.source_reference,
    source_id: sourceId,
    confidence_level: confidence,
    created_at: now,
  };
}

/**
 * Get company audit trail
 */
export async function getCompanyAudit(companyId: string): Promise<any> {
  // Get all versions, sources, and changes
  // Simplified - full implementation would trace all changes
  const company = await getCompany(companyId, true);
  return {
    company_id: companyId,
    current_version: company?.identity.version,
    audit_trail: [],
  };
}


/**
 * SQLite Database Setup for SPECTR SYSTEMS
 * Handles all database operations for workflows, executions, and users
 * This is the original SQLite implementation
 */

// @ts-nocheck
import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { 
  Workflow, 
  WorkflowExecution, 
  WorkflowListItem,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  ExecutionFilters,
  ExecutionStatus
} from '../types';

// Initialize database
const dbPath = path.join(process.cwd(), 'data/spectr-systems.db');
const db = new Database(dbPath) as any; // Type assertion to avoid TS4023 error

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

/**
 * Initialize database tables
 */
export function initializeDatabase(): void {
  // Create workflows table
  db.exec(`
    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      nodes TEXT DEFAULT '[]',
      edges TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 0,
      organization_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    )
  `);

  // Ensure organizations table exists before migration (needed for foreign key)
  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Check if organization_id column exists (migration for existing databases)
  const tableInfo = db.prepare("PRAGMA table_info(workflows)").all() as Array<{ name: string; type: string; notnull: number; dflt_value: any; pk: number }>;
  const hasOrgId = tableInfo.some(col => col.name === 'organization_id');

  if (!hasOrgId) {
    console.log('🔄 Migrating workflows table to add organization_id column...');
    
    // Count existing workflows
    const countResult = db.prepare('SELECT COUNT(*) as count FROM workflows').get() as { count: number };
    const workflowCount = countResult.count;
    
    if (workflowCount > 0) {
      console.log(`🗑️  Deleting ${workflowCount} existing workflows (they are not user-specific)...`);
      db.prepare('DELETE FROM workflows').run();
    }

    // SQLite doesn't support ALTER TABLE ADD COLUMN with NOT NULL directly
    // We need to recreate the table
    console.log('🔄 Recreating workflows table with organization_id...');
    
    // Create new table with organization_id
    db.exec(`
      CREATE TABLE workflows_new (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        nodes TEXT DEFAULT '[]',
        edges TEXT DEFAULT '[]',
        is_active INTEGER DEFAULT 0,
        organization_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      )
    `);

    // Copy any remaining data (should be empty, but just in case)
    // We need to provide a default organization_id - use first organization or create a default
    const orgExists = db.prepare("SELECT id FROM organizations LIMIT 1").get() as { id: string } | undefined;
    
    if (orgExists) {
      const insertStmt = db.prepare(`
        INSERT INTO workflows_new 
        SELECT id, name, description, nodes, edges, is_active, 
               ? as organization_id,
               created_at, updated_at
        FROM workflows
      `);
      insertStmt.run(orgExists.id);
    }

    // Drop old table
    db.exec('DROP TABLE workflows');

    // Rename new table
    db.exec('ALTER TABLE workflows_new RENAME TO workflows');
    
    console.log('✅ Migration complete');
  }

  // Create index for organization_id
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_workflows_organization_id ON workflows(organization_id);
  `);

  // Create executions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS executions (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      workflow_name TEXT NOT NULL,
      status TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      duration INTEGER,
      node_results TEXT DEFAULT '[]',
      error TEXT,
      triggered_by TEXT NOT NULL,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON executions(workflow_id);
    CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
    CREATE INDEX IF NOT EXISTS idx_executions_start_time ON executions(start_time);
  `);

  // Create data store table for Store Data node
  db.exec(`
    CREATE TABLE IF NOT EXISTS data_store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // ==================== INTELLIGENCE TABLES ====================
  
  // Intelligence cases table
  db.exec(`
    CREATE TABLE IF NOT EXISTS intelligence_cases (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      workflow_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL
    )
  `);

  // Intelligence findings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS intelligence_findings (
      id TEXT PRIMARY KEY,
      case_id TEXT,
      workflow_id TEXT,
      node_id TEXT,
      source TEXT NOT NULL,
      data TEXT NOT NULL,
      entities TEXT DEFAULT '[]',
      geolocation TEXT,
      timestamp TEXT NOT NULL,
      confidence REAL DEFAULT 1.0,
      tags TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      FOREIGN KEY (case_id) REFERENCES intelligence_cases(id) ON DELETE CASCADE,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
    )
  `);

  // Intelligence entities table (for relationship mapping)
  db.exec(`
    CREATE TABLE IF NOT EXISTS intelligence_entities (
      id TEXT PRIMARY KEY,
      case_id TEXT,
      entity_type TEXT NOT NULL,
      entity_value TEXT NOT NULL,
      confidence REAL DEFAULT 1.0,
      metadata TEXT DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (case_id) REFERENCES intelligence_cases(id) ON DELETE CASCADE
    )
  `);

  // Intelligence entity relationships table
  db.exec(`
    CREATE TABLE IF NOT EXISTS intelligence_entity_relationships (
      id TEXT PRIMARY KEY,
      case_id TEXT,
      source_entity_id TEXT NOT NULL,
      target_entity_id TEXT NOT NULL,
      relationship_type TEXT NOT NULL,
      confidence REAL DEFAULT 1.0,
      metadata TEXT DEFAULT '{}',
      created_at TEXT NOT NULL,
      FOREIGN KEY (case_id) REFERENCES intelligence_cases(id) ON DELETE CASCADE,
      FOREIGN KEY (source_entity_id) REFERENCES intelligence_entities(id) ON DELETE CASCADE,
      FOREIGN KEY (target_entity_id) REFERENCES intelligence_entities(id) ON DELETE CASCADE
    )
  `);

  // Intelligence timeline table
  db.exec(`
    CREATE TABLE IF NOT EXISTS intelligence_timeline (
      id TEXT PRIMARY KEY,
      case_id TEXT,
      workflow_id TEXT,
      event_type TEXT NOT NULL,
      event_data TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      source TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (case_id) REFERENCES intelligence_cases(id) ON DELETE CASCADE,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
    )
  `);

  // Intelligence sources table (for tracking API usage and attribution)
  db.exec(`
    CREATE TABLE IF NOT EXISTS intelligence_sources (
      id TEXT PRIMARY KEY,
      source_name TEXT NOT NULL,
      source_type TEXT NOT NULL,
      api_key_id TEXT,
      requests_count INTEGER DEFAULT 0,
      last_used TEXT,
      rate_limit_remaining INTEGER,
      rate_limit_reset TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // ==================== USER & AUTH TABLES ====================
  
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified INTEGER DEFAULT 0,
      avatar TEXT,
      role TEXT DEFAULT 'user',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Email verification tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Password reset tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Organizations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // User-Organization relationships
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_organizations (
      user_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, organization_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for intelligence tables
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_intelligence_cases_name_unique ON intelligence_cases(name);
    CREATE INDEX IF NOT EXISTS idx_intelligence_findings_case_id ON intelligence_findings(case_id);
    CREATE INDEX IF NOT EXISTS idx_intelligence_findings_workflow_id ON intelligence_findings(workflow_id);
    CREATE INDEX IF NOT EXISTS idx_intelligence_findings_timestamp ON intelligence_findings(timestamp);
    CREATE INDEX IF NOT EXISTS idx_intelligence_findings_source ON intelligence_findings(source);
    CREATE INDEX IF NOT EXISTS idx_intelligence_entities_case_id ON intelligence_entities(case_id);
    CREATE INDEX IF NOT EXISTS idx_intelligence_entities_type_value ON intelligence_entities(entity_type, entity_value);
    CREATE INDEX IF NOT EXISTS idx_intelligence_timeline_case_id ON intelligence_timeline(case_id);
    CREATE INDEX IF NOT EXISTS idx_intelligence_timeline_timestamp ON intelligence_timeline(timestamp);
  `);

  // Create indexes for user tables
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(organization_id);
  `);

  // ==================== DATASETS TABLE ====================
  
  // Datasets/Products table for admin management
  db.exec(`
    CREATE TABLE IF NOT EXISTS datasets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      price REAL NOT NULL,
      featured INTEGER DEFAULT 0,
      formats TEXT DEFAULT '[]',
      size TEXT,
      icon TEXT,
      features TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      is_public INTEGER DEFAULT 0,
      config TEXT DEFAULT '{}',
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  
  // Add new columns if they don't exist (migration)
  try {
    db.exec(`ALTER TABLE datasets ADD COLUMN is_public INTEGER DEFAULT 0`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    db.exec(`ALTER TABLE datasets ADD COLUMN config TEXT DEFAULT '{}'`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Dataset purchases/subscriptions
  db.exec(`
    CREATE TABLE IF NOT EXISTS dataset_purchases (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      purchased_at TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for datasets
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_datasets_category ON datasets(category);
    CREATE INDEX IF NOT EXISTS idx_datasets_type ON datasets(type);
    CREATE INDEX IF NOT EXISTS idx_datasets_featured ON datasets(featured);
    CREATE INDEX IF NOT EXISTS idx_datasets_active ON datasets(is_active);
    CREATE INDEX IF NOT EXISTS idx_dataset_purchases_dataset_id ON dataset_purchases(dataset_id);
    CREATE INDEX IF NOT EXISTS idx_dataset_purchases_org_id ON dataset_purchases(organization_id);
  `);

  // ==================== COMPANY INTELLIGENCE TABLES ====================
  
  // Sources table - tracks all data sources
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_sources (
      id TEXT PRIMARY KEY,
      source_name TEXT NOT NULL,
      source_url TEXT NOT NULL,
      license_type TEXT,
      raw_file_path TEXT,
      ingestion_timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Companies table - core identity
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      legal_name TEXT NOT NULL,
      org_number TEXT,
      country TEXT,
      incorporation_date TEXT,
      listing_status TEXT,
      tickers TEXT DEFAULT '[]',
      isins TEXT DEFAULT '[]',
      lei TEXT,
      version INTEGER DEFAULT 1,
      is_deleted INTEGER DEFAULT 0,
      source_id TEXT NOT NULL,
      confidence_level TEXT DEFAULT 'MEDIUM',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (source_id) REFERENCES company_sources(id)
    )
  `);

  // Company versions - historical tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_versions (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      legal_name TEXT NOT NULL,
      org_number TEXT,
      country TEXT,
      incorporation_date TEXT,
      listing_status TEXT,
      tickers TEXT DEFAULT '[]',
      isins TEXT DEFAULT '[]',
      lei TEXT,
      source_id TEXT NOT NULL,
      confidence_level TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES company_sources(id)
    )
  `);

  // Company relationships
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_relationships (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      related_company_id TEXT NOT NULL,
      relationship_type TEXT NOT NULL,
      ownership_percentage REAL,
      valid_from TEXT,
      valid_to TEXT,
      source_id TEXT NOT NULL,
      confidence_level TEXT DEFAULT 'MEDIUM',
      created_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (related_company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES company_sources(id)
    )
  `);

  // Business profile
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_business_profiles (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      industry_codes TEXT DEFAULT '[]',
      business_segments TEXT DEFAULT '[]',
      operating_regions TEXT DEFAULT '[]',
      key_assets TEXT DEFAULT '{}',
      version INTEGER DEFAULT 1,
      source_id TEXT NOT NULL,
      confidence_level TEXT DEFAULT 'MEDIUM',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES company_sources(id)
    )
  `);

  // Financial records - versioned by fiscal period
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_financials (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      fiscal_period TEXT NOT NULL,
      currency TEXT NOT NULL,
      revenue REAL,
      ebitda REAL,
      net_income REAL,
      capex REAL,
      total_debt REAL,
      source_document TEXT,
      reported_date TEXT,
      source_id TEXT NOT NULL,
      confidence_level TEXT DEFAULT 'MEDIUM',
      created_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES company_sources(id),
      UNIQUE(company_id, fiscal_period, source_id)
    )
  `);

  // Workforce & governance
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_workforce (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      headcount INTEGER,
      headcount_by_region TEXT DEFAULT '{}',
      executives TEXT DEFAULT '[]',
      board_members TEXT DEFAULT '[]',
      version INTEGER DEFAULT 1,
      source_id TEXT NOT NULL,
      confidence_level TEXT DEFAULT 'MEDIUM',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES company_sources(id)
    )
  `);

  // Events
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_events (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_date TEXT NOT NULL,
      severity TEXT,
      description TEXT,
      source_reference TEXT,
      source_id TEXT NOT NULL,
      confidence_level TEXT DEFAULT 'MEDIUM',
      created_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES company_sources(id)
    )
  `);

  // Indexes for company intelligence
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_companies_org_number ON companies(org_number);
    CREATE INDEX IF NOT EXISTS idx_companies_country ON companies(country);
    CREATE INDEX IF NOT EXISTS idx_companies_version ON companies(version);
    CREATE INDEX IF NOT EXISTS idx_company_versions_company_id ON company_versions(company_id);
    CREATE INDEX IF NOT EXISTS idx_company_versions_version ON company_versions(version);
    CREATE INDEX IF NOT EXISTS idx_company_relationships_company_id ON company_relationships(company_id);
    CREATE INDEX IF NOT EXISTS idx_company_relationships_related_id ON company_relationships(related_company_id);
    CREATE INDEX IF NOT EXISTS idx_company_financials_company_id ON company_financials(company_id);
    CREATE INDEX IF NOT EXISTS idx_company_financials_period ON company_financials(fiscal_period);
    CREATE INDEX IF NOT EXISTS idx_company_events_company_id ON company_events(company_id);
    CREATE INDEX IF NOT EXISTS idx_company_events_date ON company_events(event_date);
  `);

  console.log('✅ Database initialized successfully');
}

// ============================================
// Workflow CRUD Operations
// ============================================

/**
 * Get all workflows (list view)
 */
export function getAllWorkflows(organizationId: string): WorkflowListItem[] {
  const stmt = db.prepare(`
    SELECT 
      w.id,
      w.name,
      w.description,
      w.nodes,
      w.is_active,
      w.created_at,
      w.updated_at,
      (SELECT MAX(start_time) FROM executions WHERE workflow_id = w.id) as last_executed
    FROM workflows w
    WHERE w.organization_id = ?
    ORDER BY w.updated_at DESC
  `);

  const rows = stmt.all(organizationId) as any[];

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    nodeCount: JSON.parse(row.nodes).length,
    isActive: Boolean(row.is_active),
    lastExecuted: row.last_executed || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

/**
 * Get a single workflow by ID
 */
export function getWorkflowById(id: string, organizationId: string): Workflow | null {
  const stmt = db.prepare(`
    SELECT * FROM workflows WHERE id = ? AND organization_id = ?
  `);

  const row = stmt.get(id, organizationId) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    nodes: JSON.parse(row.nodes),
    edges: JSON.parse(row.edges),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Create a new workflow
 */
export function createWorkflow(data: CreateWorkflowRequest, organizationId: string): Workflow {
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO workflows (id, name, description, nodes, edges, is_active, organization_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.name,
    data.description || '',
    JSON.stringify(data.nodes || []),
    JSON.stringify(data.edges || []),
    0,
    organizationId,
    now,
    now
  );

  return getWorkflowById(id, organizationId)!;
}

/**
 * Update an existing workflow
 */
export function updateWorkflow(id: string, data: UpdateWorkflowRequest, organizationId: string): Workflow | null {
  const existing = getWorkflowById(id, organizationId);
  if (!existing) return null;

  const now = new Date().toISOString();

  const stmt = db.prepare(`
    UPDATE workflows
    SET name = ?, description = ?, nodes = ?, edges = ?, is_active = ?, updated_at = ?
    WHERE id = ? AND organization_id = ?
  `);

  stmt.run(
    data.name ?? existing.name,
    data.description ?? existing.description,
    JSON.stringify(data.nodes ?? existing.nodes),
    JSON.stringify(data.edges ?? existing.edges),
    data.isActive !== undefined ? (data.isActive ? 1 : 0) : (existing.isActive ? 1 : 0),
    now,
    id,
    organizationId
  );

  return getWorkflowById(id, organizationId);
}

/**
 * Delete a workflow
 */
export function deleteWorkflow(id: string, organizationId: string): boolean {
  const stmt = db.prepare('DELETE FROM workflows WHERE id = ? AND organization_id = ?');
  const result = stmt.run(id, organizationId);
  return result.changes > 0;
}

/**
 * Delete all workflows
 */
export function deleteAllWorkflows(): number {
  const stmt = db.prepare('DELETE FROM workflows');
  const result = stmt.run();
  return result.changes;
}

// ============================================
// Execution Operations
// ============================================

/**
 * Create a new execution record
 */
export function createExecution(
  workflowId: string,
  workflowName: string,
  triggeredBy: 'manual' | 'webhook' | 'schedule'
): WorkflowExecution {
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO executions (id, workflow_id, workflow_name, status, start_time, node_results, triggered_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, workflowId, workflowName, 'running', now, '[]', triggeredBy);

  return {
    id,
    workflowId,
    workflowName,
    status: 'running',
    startTime: now,
    nodeResults: [],
    triggeredBy
  };
}

/**
 * Update execution status and results
 */
export function updateExecution(
  id: string,
  updates: Partial<WorkflowExecution>
): WorkflowExecution | null {
  const existing = getExecutionById(id);
  if (!existing) return null;

  const stmt = db.prepare(`
    UPDATE executions
    SET status = ?, end_time = ?, duration = ?, node_results = ?, error = ?
    WHERE id = ?
  `);

  stmt.run(
    updates.status ?? existing.status,
    updates.endTime ?? existing.endTime ?? null,
    updates.duration ?? existing.duration ?? null,
    JSON.stringify(updates.nodeResults ?? existing.nodeResults),
    updates.error ?? existing.error ?? null,
    id
  );

  return getExecutionById(id);
}

/**
 * Get execution by ID
 */
export function getExecutionById(id: string): WorkflowExecution | null {
  const stmt = db.prepare('SELECT * FROM executions WHERE id = ?');
  const row = stmt.get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    workflowId: row.workflow_id,
    workflowName: row.workflow_name,
    status: row.status as ExecutionStatus,
    startTime: row.start_time,
    endTime: row.end_time || undefined,
    duration: row.duration || undefined,
    nodeResults: JSON.parse(row.node_results),
    error: row.error || undefined,
    triggeredBy: row.triggered_by
  };
}

/**
 * Get executions with filters
 */
export function getExecutions(filters: ExecutionFilters = {}): WorkflowExecution[] {
  let query = 'SELECT * FROM executions WHERE 1=1';
  const params: any[] = [];

  if (filters.workflowId) {
    query += ' AND workflow_id = ?';
    params.push(filters.workflowId);
  }

  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters.startDate) {
    query += ' AND start_time >= ?';
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    query += ' AND start_time <= ?';
    params.push(filters.endDate);
  }

  query += ' ORDER BY start_time DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  if (filters.offset) {
    query += ' OFFSET ?';
    params.push(filters.offset);
  }

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as any[];

  return rows.map(row => ({
    id: row.id,
    workflowId: row.workflow_id,
    workflowName: row.workflow_name,
    status: row.status as ExecutionStatus,
    startTime: row.start_time,
    endTime: row.end_time || undefined,
    duration: row.duration || undefined,
    nodeResults: JSON.parse(row.node_results),
    error: row.error || undefined,
    triggeredBy: row.triggered_by
  }));
}

// ============================================
// Data Store Operations (for Store Data node)
// ============================================

/**
 * Set a value in the data store
 */
export function setDataStoreValue(key: string, value: string): void {
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO data_store (key, value, created_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?
  `);

  stmt.run(key, value, now, now, value, now);
}

/**
 * Get a value from the data store
 */
export function getDataStoreValue(key: string): string | null {
  const stmt = db.prepare('SELECT value FROM data_store WHERE key = ?');
  const row = stmt.get(key) as any;
  return row?.value || null;
}

/**
 * Delete a value from the data store
 */
export function deleteDataStoreValue(key: string): boolean {
  const stmt = db.prepare('DELETE FROM data_store WHERE key = ?');
  const result = stmt.run(key);
  return result.changes > 0;
}

// Export the database instance for direct access if needed
export { db };


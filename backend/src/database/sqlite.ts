/**
 * SQLite Database Setup for SPECTR SYSTEMS
 * Handles all database operations for workflows, executions, and users
 * This is the original SQLite implementation
 */

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
const db = new Database(dbPath);

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
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
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

  console.log('✅ Database initialized successfully');
}

// ============================================
// Workflow CRUD Operations
// ============================================

/**
 * Get all workflows (list view)
 */
export function getAllWorkflows(): WorkflowListItem[] {
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
    ORDER BY w.updated_at DESC
  `);

  const rows = stmt.all() as any[];

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
export function getWorkflowById(id: string): Workflow | null {
  const stmt = db.prepare(`
    SELECT * FROM workflows WHERE id = ?
  `);

  const row = stmt.get(id) as any;

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
export function createWorkflow(data: CreateWorkflowRequest): Workflow {
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO workflows (id, name, description, nodes, edges, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.name,
    data.description || '',
    JSON.stringify(data.nodes || []),
    JSON.stringify(data.edges || []),
    0,
    now,
    now
  );

  return getWorkflowById(id)!;
}

/**
 * Update an existing workflow
 */
export function updateWorkflow(id: string, data: UpdateWorkflowRequest): Workflow | null {
  const existing = getWorkflowById(id);
  if (!existing) return null;

  const now = new Date().toISOString();

  const stmt = db.prepare(`
    UPDATE workflows
    SET name = ?, description = ?, nodes = ?, edges = ?, is_active = ?, updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    data.name ?? existing.name,
    data.description ?? existing.description,
    JSON.stringify(data.nodes ?? existing.nodes),
    JSON.stringify(data.edges ?? existing.edges),
    data.isActive !== undefined ? (data.isActive ? 1 : 0) : (existing.isActive ? 1 : 0),
    now,
    id
  );

  return getWorkflowById(id);
}

/**
 * Delete a workflow
 */
export function deleteWorkflow(id: string): boolean {
  const stmt = db.prepare('DELETE FROM workflows WHERE id = ?');
  const result = stmt.run(id);
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


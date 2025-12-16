/**
 * PostgreSQL Database Setup for SPECTR SYSTEMS
 * PostgreSQL implementation using pg library
 */

import { Pool } from 'pg';
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

// Initialize PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'spectrsystems',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL !== 'false' ? { rejectUnauthorized: false } : false, // RDS requires SSL
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout
});

// Helper to convert SQLite-style queries to PostgreSQL
export function convertQuery(sql: string, params: any[] = []): { sql: string; params: any[] } {
  let pgSql = sql;
  const pgParams: any[] = [];
  let paramIndex = 1;
  
  // Replace all ? with $1, $2, etc.
  pgSql = pgSql.replace(/\?/g, () => {
    const placeholder = `$${paramIndex}`;
    if (params.length >= paramIndex) {
      pgParams.push(params[paramIndex - 1]);
    }
    paramIndex++;
    return placeholder;
  });
  
  return { sql: pgSql, params: pgParams.length > 0 ? pgParams : params };
}

/**
 * Initialize database tables
 */
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Create workflows table
    await client.query(`
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
    await client.query(`
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

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON executions(workflow_id);
      CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
      CREATE INDEX IF NOT EXISTS idx_executions_start_time ON executions(start_time);
    `);

    // Create data store table
    await client.query(`
      CREATE TABLE IF NOT EXISTS data_store (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Intelligence tables
    await client.query(`
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

    await client.query(`
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

    await client.query(`
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

    await client.query(`
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

    await client.query(`
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

    await client.query(`
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

    // User & Auth tables
    await client.query(`
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

    await client.query(`
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

    await client.query(`
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        plan TEXT DEFAULT 'free',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    await client.query(`
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

    // Create indexes
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_intelligence_cases_name_unique ON intelligence_cases(name);
      CREATE INDEX IF NOT EXISTS idx_intelligence_findings_case_id ON intelligence_findings(case_id);
      CREATE INDEX IF NOT EXISTS idx_intelligence_findings_workflow_id ON intelligence_findings(workflow_id);
      CREATE INDEX IF NOT EXISTS idx_intelligence_findings_timestamp ON intelligence_findings(timestamp);
      CREATE INDEX IF NOT EXISTS idx_intelligence_findings_source ON intelligence_findings(source);
      CREATE INDEX IF NOT EXISTS idx_intelligence_entities_case_id ON intelligence_entities(case_id);
      CREATE INDEX IF NOT EXISTS idx_intelligence_entities_type_value ON intelligence_entities(entity_type, entity_value);
      CREATE INDEX IF NOT EXISTS idx_intelligence_timeline_case_id ON intelligence_timeline(case_id);
      CREATE INDEX IF NOT EXISTS idx_intelligence_timeline_timestamp ON intelligence_timeline(timestamp);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(organization_id);
    `);

    console.log('✅ PostgreSQL database initialized successfully');
  } finally {
    client.release();
  }
}

// Workflow Operations
export async function getAllWorkflows(): Promise<WorkflowListItem[]> {
  const { sql, params } = convertQuery(`
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

  const result = await pool.query(sql, params);
  const rows = result.rows;

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

export async function getWorkflowById(id: string): Promise<Workflow | null> {
  const { sql, params } = convertQuery('SELECT * FROM workflows WHERE id = ?', [id]);
  const result = await pool.query(sql, params);
  const row = result.rows[0];

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

export async function createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
  const id = uuidv4();
  const now = new Date().toISOString();

  const { sql, params } = convertQuery(`
    INSERT INTO workflows (id, name, description, nodes, edges, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, data.name, data.description || '', JSON.stringify(data.nodes || []), JSON.stringify(data.edges || []), 0, now, now]);

  await pool.query(sql, params);
  return (await getWorkflowById(id))!;
}

export async function updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<Workflow | null> {
  const existing = await getWorkflowById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const { sql, params } = convertQuery(`
    UPDATE workflows
    SET name = ?, description = ?, nodes = ?, edges = ?, is_active = ?, updated_at = ?
    WHERE id = ?
  `, [
    data.name ?? existing.name,
    data.description ?? existing.description,
    JSON.stringify(data.nodes ?? existing.nodes),
    JSON.stringify(data.edges ?? existing.edges),
    data.isActive !== undefined ? (data.isActive ? 1 : 0) : (existing.isActive ? 1 : 0),
    now,
    id
  ]);

  await pool.query(sql, params);
  return await getWorkflowById(id);
}

export async function deleteWorkflow(id: string): Promise<boolean> {
  const { sql, params } = convertQuery('DELETE FROM workflows WHERE id = ?', [id]);
  const result = await pool.query(sql, params);
  return result.rowCount > 0;
}

export async function deleteAllWorkflows(): Promise<number> {
  const result = await pool.query('DELETE FROM workflows');
  return result.rowCount || 0;
}

// Execution Operations
export async function createExecution(
  workflowId: string,
  workflowName: string,
  triggeredBy: 'manual' | 'webhook' | 'schedule'
): Promise<WorkflowExecution> {
  const id = uuidv4();
  const now = new Date().toISOString();

  const { sql, params } = convertQuery(`
    INSERT INTO executions (id, workflow_id, workflow_name, status, start_time, node_results, triggered_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [id, workflowId, workflowName, 'running', now, '[]', triggeredBy]);

  await pool.query(sql, params);

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

export async function updateExecution(
  id: string,
  updates: Partial<WorkflowExecution>
): Promise<WorkflowExecution | null> {
  const existing = await getExecutionById(id);
  if (!existing) return null;

  const { sql, params } = convertQuery(`
    UPDATE executions
    SET status = ?, end_time = ?, duration = ?, node_results = ?, error = ?
    WHERE id = ?
  `, [
    updates.status ?? existing.status,
    updates.endTime ?? existing.endTime ?? null,
    updates.duration ?? existing.duration ?? null,
    JSON.stringify(updates.nodeResults ?? existing.nodeResults),
    updates.error ?? existing.error ?? null,
    id
  ]);

  await pool.query(sql, params);
  return await getExecutionById(id);
}

export async function getExecutionById(id: string): Promise<WorkflowExecution | null> {
  const { sql, params } = convertQuery('SELECT * FROM executions WHERE id = ?', [id]);
  const result = await pool.query(sql, params);
  const row = result.rows[0];

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

export async function getExecutions(filters: ExecutionFilters = {}): Promise<WorkflowExecution[]> {
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

  const { sql, params: pgParams } = convertQuery(query, params);
  const result = await pool.query(sql, pgParams);

  return result.rows.map(row => ({
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

// Data Store Operations
export async function setDataStoreValue(key: string, value: string): Promise<void> {
  const now = new Date().toISOString();
  const { sql, params } = convertQuery(`
    INSERT INTO data_store (key, value, created_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?
  `, [key, value, now, now, value, now]);

  await pool.query(sql, params);
}

export async function getDataStoreValue(key: string): Promise<string | null> {
  const { sql, params } = convertQuery('SELECT value FROM data_store WHERE key = ?', [key]);
  const result = await pool.query(sql, params);
  return result.rows[0]?.value || null;
}

export async function deleteDataStoreValue(key: string): Promise<boolean> {
  const { sql, params } = convertQuery('DELETE FROM data_store WHERE key = ?', [key]);
  const result = await pool.query(sql, params);
  return result.rowCount > 0;
}

// User Management Operations
export async function getUserByEmail(email: string): Promise<any | null> {
  const { sql, params } = convertQuery('SELECT * FROM users WHERE email = ?', [email]);
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

export async function getUserById(id: string): Promise<any | null> {
  const { sql, params } = convertQuery('SELECT * FROM users WHERE id = ?', [id]);
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

export async function createUser(data: {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  emailVerified?: boolean;
}): Promise<void> {
  const now = new Date().toISOString();
  const { sql, params } = convertQuery(`
    INSERT INTO users (id, email, name, password_hash, email_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [data.id, data.email, data.name, data.passwordHash, data.emailVerified ? 1 : 0, now, now]);
  await pool.query(sql, params);
}

export async function createOrganization(data: {
  id: string;
  name: string;
  plan?: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const { sql, params } = convertQuery(`
    INSERT INTO organizations (id, name, plan, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `, [data.id, data.name, data.plan || 'free', now, now]);
  await pool.query(sql, params);
}

export async function linkUserToOrganization(data: {
  userId: string;
  organizationId: string;
  role?: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const { sql, params } = convertQuery(`
    INSERT INTO user_organizations (user_id, organization_id, role, created_at)
    VALUES (?, ?, ?, ?)
  `, [data.userId, data.organizationId, data.role || 'admin', now]);
  await pool.query(sql, params);
}

export async function createEmailVerificationToken(data: {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const { sql, params } = convertQuery(`
    INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `, [data.id, data.userId, data.token, data.expiresAt, now]);
  await pool.query(sql, params);
}

export async function getEmailVerificationToken(token: string): Promise<any | null> {
  const { sql, params } = convertQuery(`
    SELECT evt.*, u.id as user_id, u.email, u.name, u.email_verified
    FROM email_verification_tokens evt
    JOIN users u ON evt.user_id = u.id
    WHERE evt.token = ? AND evt.used = 0 AND evt.expires_at > ?
  `, [token, new Date().toISOString()]);
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

export async function markEmailVerificationTokenAsUsed(tokenId: string): Promise<void> {
  const { sql, params } = convertQuery('UPDATE email_verification_tokens SET used = 1 WHERE id = ?', [tokenId]);
  await pool.query(sql, params);
}

export async function verifyUserEmail(userId: string): Promise<void> {
  const { sql, params } = convertQuery('UPDATE users SET email_verified = 1 WHERE id = ?', [userId]);
  await pool.query(sql, params);
}

export async function getUserOrganization(userId: string): Promise<any | null> {
  const { sql, params } = convertQuery(`
    SELECT o.*, uo.role
    FROM organizations o
    JOIN user_organizations uo ON o.id = uo.organization_id
    WHERE uo.user_id = ?
  `, [userId]);
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

export async function updateOrganizationPlan(organizationId: string, plan: string): Promise<void> {
  const now = new Date().toISOString();
  const { sql, params } = convertQuery(
    'UPDATE organizations SET plan = ?, updated_at = ? WHERE id = ?',
    [plan, now, organizationId]
  );
  await pool.query(sql, params);
}

export async function createPasswordResetToken(data: {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const { sql, params } = convertQuery(`
    INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `, [data.id, data.userId, data.token, data.expiresAt, now]);
  await pool.query(sql, params);
}

export async function getPasswordResetToken(token: string): Promise<any | null> {
  const { sql, params } = convertQuery(`
    SELECT prt.*, u.email, u.name
    FROM password_reset_tokens prt
    JOIN users u ON prt.user_id = u.id
    WHERE prt.token = ? AND prt.used = 0 AND prt.expires_at > ?
  `, [token, new Date().toISOString()]);
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

export async function markPasswordResetTokenAsUsed(tokenId: string): Promise<void> {
  const { sql, params } = convertQuery('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [tokenId]);
  await pool.query(sql, params);
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  const { sql, params } = convertQuery('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
  await pool.query(sql, params);
}

// Export pool for direct access if needed
export { pool };


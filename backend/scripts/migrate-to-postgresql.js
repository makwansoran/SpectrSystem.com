/**
 * Migration Script: SQLite to PostgreSQL
 * Migrates all data from SQLite to PostgreSQL (AWS RDS)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Database = require('better-sqlite3');
const { Client } = require('pg');
const path = require('path');

// SQLite connection
const sqlitePath = path.join(__dirname, '../data/spectr-systems.db');
const sqliteDb = new Database(sqlitePath);

// PostgreSQL connection
const pgClient = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// PostgreSQL schema creation
const createPostgreSQLSchema = `
-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  nodes TEXT DEFAULT '[]',
  edges TEXT DEFAULT '[]',
  is_active INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Executions table
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
);

-- Data store table
CREATE TABLE IF NOT EXISTS data_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Users table
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
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- User organizations
CREATE TABLE IF NOT EXISTS user_organizations (
  user_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, organization_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Intelligence cases
CREATE TABLE IF NOT EXISTS intelligence_cases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  workflow_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL
);

-- Intelligence findings
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
);

-- Intelligence entities
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
);

-- Intelligence entity relationships
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
);

-- Intelligence timeline
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
);

-- Intelligence sources
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
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_start_time ON executions(start_time);
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
`;

// Migration function
async function migrateTable(tableName, columns) {
  console.log(`\n📦 Migrating table: ${tableName}`);
  
  // Get data from SQLite
  const rows = sqliteDb.prepare(`SELECT * FROM ${tableName}`).all();
  console.log(`   Found ${rows.length} rows in SQLite`);
  
  if (rows.length === 0) {
    console.log(`   ⏭️  Skipping (no data)`);
    return;
  }
  
  // Clear existing data in PostgreSQL (if any)
  await pgClient.query(`DELETE FROM ${tableName}`);
  
  // Insert data into PostgreSQL
  if (rows.length > 0) {
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    for (const row of rows) {
      const values = columns.map(col => row[col] !== null && row[col] !== undefined ? row[col] : null);
      await pgClient.query(insertQuery, values);
    }
    
    console.log(`   ✅ Migrated ${rows.length} rows to PostgreSQL`);
  }
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...\n');
  
  try {
    // Connect to PostgreSQL
    console.log('📡 Connecting to PostgreSQL...');
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL\n');
    
    // Create schema
    console.log('📋 Creating PostgreSQL schema...');
    await pgClient.query(createPostgreSQLSchema);
    console.log('✅ Schema created\n');
    
    // Migrate tables in order (respecting foreign keys)
    const tables = [
      { name: 'users', columns: ['id', 'email', 'name', 'password_hash', 'email_verified', 'avatar', 'role', 'created_at', 'updated_at'] },
      { name: 'organizations', columns: ['id', 'name', 'plan', 'created_at', 'updated_at'] },
      { name: 'user_organizations', columns: ['user_id', 'organization_id', 'role', 'created_at'] },
      { name: 'workflows', columns: ['id', 'name', 'description', 'nodes', 'edges', 'is_active', 'created_at', 'updated_at'] },
      { name: 'executions', columns: ['id', 'workflow_id', 'workflow_name', 'status', 'start_time', 'end_time', 'duration', 'node_results', 'error', 'triggered_by'] },
      { name: 'data_store', columns: ['key', 'value', 'created_at', 'updated_at'] },
      { name: 'email_verification_tokens', columns: ['id', 'user_id', 'token', 'expires_at', 'used', 'created_at'] },
      { name: 'password_reset_tokens', columns: ['id', 'user_id', 'token', 'expires_at', 'used', 'created_at'] },
      { name: 'intelligence_cases', columns: ['id', 'name', 'description', 'workflow_id', 'status', 'created_at', 'updated_at'] },
      { name: 'intelligence_entities', columns: ['id', 'case_id', 'entity_type', 'entity_value', 'confidence', 'metadata', 'created_at', 'updated_at'] },
      { name: 'intelligence_findings', columns: ['id', 'case_id', 'workflow_id', 'node_id', 'source', 'data', 'entities', 'geolocation', 'timestamp', 'confidence', 'tags', 'created_at'] },
      { name: 'intelligence_entity_relationships', columns: ['id', 'case_id', 'source_entity_id', 'target_entity_id', 'relationship_type', 'confidence', 'metadata', 'created_at'] },
      { name: 'intelligence_timeline', columns: ['id', 'case_id', 'workflow_id', 'event_type', 'event_data', 'timestamp', 'source', 'created_at'] },
      { name: 'intelligence_sources', columns: ['id', 'source_name', 'source_type', 'api_key_id', 'requests_count', 'last_used', 'rate_limit_remaining', 'rate_limit_reset', 'created_at', 'updated_at'] }
    ];
    
    for (const table of tables) {
      await migrateTable(table.name, table.columns);
    }
    
    // Verify migration
    console.log('\n🔍 Verifying migration...\n');
    for (const table of tables) {
      const sqliteCount = sqliteDb.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get().count;
      const pgResult = await pgClient.query(`SELECT COUNT(*) as count FROM ${table.name}`);
      const pgCount = parseInt(pgResult.rows[0].count);
      
      if (sqliteCount === pgCount) {
        console.log(`✅ ${table.name}: ${sqliteCount} rows (match)`);
      } else {
        console.log(`⚠️  ${table.name}: SQLite=${sqliteCount}, PostgreSQL=${pgCount} (mismatch!)`);
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update backend/.env with PostgreSQL credentials');
    console.log('   2. Set DB_TYPE=postgresql in .env');
    console.log('   3. Restart backend server');
    console.log('   4. Test the application');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pgClient.end();
    sqliteDb.close();
  }
}

// Run migration
if (require.main === module) {
  migrate().catch(console.error);
}

module.exports = { migrate };


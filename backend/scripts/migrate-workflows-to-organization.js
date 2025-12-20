/**
 * Migration script to add organization_id to workflows table
 * 
 * This script:
 * 1. Adds organization_id column to workflows table
 * 2. Deletes all existing workflows (since they're not user-specific)
 * 3. Adds foreign key constraint
 * 
 * Run with: node scripts/migrate-workflows-to-organization.js
 */

require('dotenv').config();
const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

async function migrate() {
  console.log('🔄 Starting workflow organization migration...\n');

  if (dbType === 'postgresql') {
    await migratePostgreSQL();
  } else {
    migrateSQLite();
  }

  console.log('\n✅ Migration completed successfully!');
  console.log('   All existing workflows have been deleted.');
  console.log('   New workflows will be automatically associated with user organizations.');
}

async function migratePostgreSQL() {
  const { Pool } = require('pg');
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    const client = await pool.connect();
    
    console.log('📡 Connected to PostgreSQL');

    // Check if workflows table exists
    const tableExists = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'workflows'
    `);

    if (tableExists.rows.length === 0) {
      console.log('ℹ️  Workflows table does not exist yet.');
      console.log('   The table will be created with organization_id when the app starts.');
      console.log('   No migration needed.');
      client.release();
      await pool.end();
      return;
    }

    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'workflows' AND column_name = 'organization_id'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('⚠️  organization_id column already exists. Skipping migration.');
      client.release();
      await pool.end();
      return;
    }

    // Count existing workflows
    const countResult = await client.query('SELECT COUNT(*) as count FROM workflows');
    const workflowCount = parseInt(countResult.rows[0].count);
    console.log(`📊 Found ${workflowCount} existing workflows`);

    if (workflowCount > 0) {
      console.log('🗑️  Deleting all existing workflows (they are not user-specific)...');
      await client.query('DELETE FROM workflows');
      console.log('✅ Deleted all existing workflows');
    }

    // Add organization_id column (nullable first)
    console.log('➕ Adding organization_id column...');
    await client.query(`
      ALTER TABLE workflows 
      ADD COLUMN organization_id TEXT
    `);

    // Add foreign key constraint
    console.log('🔗 Adding foreign key constraint...');
    await client.query(`
      ALTER TABLE workflows 
      ADD CONSTRAINT fk_workflows_organization 
      FOREIGN KEY (organization_id) 
      REFERENCES organizations(id) 
      ON DELETE CASCADE
    `);

    // Make column NOT NULL
    console.log('🔒 Making organization_id NOT NULL...');
    await client.query(`
      ALTER TABLE workflows 
      ALTER COLUMN organization_id SET NOT NULL
    `);

    // Create index
    console.log('📇 Creating index on organization_id...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_workflows_organization_id 
      ON workflows(organization_id)
    `);

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

function migrateSQLite() {
  const Database = require('better-sqlite3');
  const dbPath = process.env.DB_PATH || './data/database.db';
  const db = new Database(dbPath);

  try {
    console.log('📡 Connected to SQLite');

    // Check if workflows table exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='workflows'
    `).get();

    if (!tableExists) {
      console.log('ℹ️  Workflows table does not exist yet.');
      console.log('   The table will be created with organization_id when the app starts.');
      console.log('   No migration needed.');
      db.close();
      return;
    }

    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(workflows)").all();
    const hasOrgId = tableInfo.some(col => col.name === 'organization_id');

    if (hasOrgId) {
      console.log('⚠️  organization_id column already exists. Skipping migration.');
      db.close();
      return;
    }

    // Count existing workflows
    const countResult = db.prepare('SELECT COUNT(*) as count FROM workflows').get();
    const workflowCount = countResult.count;
    console.log(`📊 Found ${workflowCount} existing workflows`);

    if (workflowCount > 0) {
      console.log('🗑️  Deleting all existing workflows (they are not user-specific)...');
      db.prepare('DELETE FROM workflows').run();
      console.log('✅ Deleted all existing workflows');
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

    // Copy data (should be empty, but just in case)
    db.exec(`
      INSERT INTO workflows_new 
      SELECT id, name, description, nodes, edges, is_active, 
             (SELECT id FROM organizations LIMIT 1) as organization_id,
             created_at, updated_at
      FROM workflows
    `);

    // Drop old table
    db.exec('DROP TABLE workflows');

    // Rename new table
    db.exec('ALTER TABLE workflows_new RENAME TO workflows');

    // Create index
    console.log('📇 Creating index on organization_id...');
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_workflows_organization_id 
      ON workflows(organization_id)
    `);

    db.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    db.close();
    throw error;
  }
}

// Run migration
migrate().catch(error => {
  console.error('❌ Migration error:', error);
  process.exit(1);
});


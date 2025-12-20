/**
 * Quick script to add organization_id column to workflows table
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking if organization_id column exists...');
    const check = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'workflows' AND column_name = 'organization_id'
    `);

    if (check.rows.length === 0) {
      console.log('➕ Adding organization_id column...');
      
      // Delete existing workflows
      await client.query('DELETE FROM workflows');
      console.log('✅ Deleted existing workflows');
      
      // Add column
      await client.query('ALTER TABLE workflows ADD COLUMN organization_id TEXT');
      console.log('✅ Added organization_id column');
      
      // Add foreign key
      await client.query(`
        ALTER TABLE workflows 
        ADD CONSTRAINT fk_workflows_organization 
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) 
        ON DELETE CASCADE
      `);
      console.log('✅ Added foreign key constraint');
      
      // Make NOT NULL
      await client.query('ALTER TABLE workflows ALTER COLUMN organization_id SET NOT NULL');
      console.log('✅ Made organization_id NOT NULL');
      
      // Create index
      await client.query('CREATE INDEX IF NOT EXISTS idx_workflows_organization_id ON workflows(organization_id)');
      console.log('✅ Created index');
      
      console.log('✅ Migration complete!');
    } else {
      console.log('✅ Column already exists');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();





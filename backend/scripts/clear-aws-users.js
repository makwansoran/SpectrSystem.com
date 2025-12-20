/**
 * Clear all users from AWS PostgreSQL database
 * This script connects to AWS RDS PostgreSQL and removes all users
 * 
 * Usage:
 *   Option 1: Run on AWS server (recommended)
 *     ssh -i your-key.pem ec2-user@your-server-ip
 *     cd ~/chainCommands/backend
 *     node scripts/clear-aws-users.js
 * 
 *   Option 2: Run locally with AWS credentials
 *     Set environment variables:
 *       DB_TYPE=postgresql
 *       DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
 *       DB_PORT=5432
 *       DB_NAME=your-database-name
 *       DB_USER=your-db-username
 *       DB_PASSWORD=your-db-password
 *     Then: node scripts/clear-aws-users.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Client } = require('pg');

// Get database credentials from environment
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false } // RDS requires SSL
};

// Validate required credentials
if (!dbConfig.host || !dbConfig.database || !dbConfig.user || !dbConfig.password) {
  console.error('❌ Missing required database credentials!');
  console.error('\nRequired environment variables:');
  console.error('  DB_HOST - Your RDS endpoint (e.g., your-db.region.rds.amazonaws.com)');
  console.error('  DB_NAME - Your database name');
  console.error('  DB_USER - Your database username');
  console.error('  DB_PASSWORD - Your database password');
  console.error('  DB_PORT - Database port (default: 5432)');
  console.error('\nMake sure these are set in your .env file or environment variables.');
  process.exit(1);
}

async function clearUsers() {
  const client = new Client(dbConfig);

  try {
    console.log(`📡 Connecting to PostgreSQL at ${dbConfig.host}...`);
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Get counts before deletion
    const userResult = await client.query('SELECT COUNT(*) as count FROM users');
    const orgResult = await client.query('SELECT COUNT(*) as count FROM organizations');
    const tokenResult = await client.query('SELECT COUNT(*) as count FROM email_verification_tokens');
    const resetTokenResult = await client.query('SELECT COUNT(*) as count FROM password_reset_tokens');

    const userCount = parseInt(userResult.rows[0].count);
    const orgCount = parseInt(orgResult.rows[0].count);
    const tokenCount = parseInt(tokenResult.rows[0].count);
    const resetTokenCount = parseInt(resetTokenResult.rows[0].count);

    console.log('📊 Current database state:');
    console.log(`  - ${userCount} users`);
    console.log(`  - ${orgCount} organizations`);
    console.log(`  - ${tokenCount} email verification tokens`);
    console.log(`  - ${resetTokenCount} password reset tokens\n`);

    if (userCount === 0) {
      console.log('✅ No users to delete. Database is already empty.');
      await client.end();
      return;
    }

    // Confirm deletion (in production, you might want to add a confirmation prompt)
    console.log('⚠️  WARNING: This will delete ALL users and related data!');
    console.log('   Starting deletion in 2 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Delete in order (respecting foreign keys)
    await client.query('DELETE FROM password_reset_tokens');
    console.log('✅ Deleted password reset tokens');

    await client.query('DELETE FROM email_verification_tokens');
    console.log('✅ Deleted email verification tokens');

    await client.query('DELETE FROM user_organizations');
    console.log('✅ Deleted user-organization links');

    await client.query('DELETE FROM organizations');
    console.log('✅ Deleted organizations');

    await client.query('DELETE FROM users');
    console.log('✅ Deleted users');

    console.log('\n✅ All users and related data cleared successfully from AWS database!');
    console.log('   You can now create a new account.');

  } catch (error) {
    console.error('\n❌ Error clearing data:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Could not connect to database. Check:');
      console.error('   - DB_HOST is correct');
      console.error('   - Database is accessible from this network');
      console.error('   - Security groups allow connections');
    } else if (error.code === '28P01') {
      console.error('   Authentication failed. Check:');
      console.error('   - DB_USER is correct');
      console.error('   - DB_PASSWORD is correct');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

clearUsers();


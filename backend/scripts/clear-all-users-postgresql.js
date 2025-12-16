/**
 * Clear all users and related data from PostgreSQL database
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function clearUsers() {
  try {
    await client.connect();
    console.log('📡 Connected to PostgreSQL\n');

    // Get counts before deletion
    const userResult = await client.query('SELECT COUNT(*) as count FROM users');
    const orgResult = await client.query('SELECT COUNT(*) as count FROM organizations');
    const tokenResult = await client.query('SELECT COUNT(*) as count FROM email_verification_tokens');
    const resetTokenResult = await client.query('SELECT COUNT(*) as count FROM password_reset_tokens');

    const userCount = parseInt(userResult.rows[0].count);
    const orgCount = parseInt(orgResult.rows[0].count);
    const tokenCount = parseInt(tokenResult.rows[0].count);
    const resetTokenCount = parseInt(resetTokenResult.rows[0].count);

    console.log('Found:');
    console.log(`  - ${userCount} users`);
    console.log(`  - ${orgCount} organizations`);
    console.log(`  - ${tokenCount} email verification tokens`);
    console.log(`  - ${resetTokenCount} password reset tokens\n`);

    if (userCount === 0) {
      console.log('✅ No users to delete. Database is already empty.');
      await client.end();
      return;
    }

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

    console.log('\n✅ All users and related data cleared successfully!');
    console.log('   You can now create a new account.');

  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

clearUsers();


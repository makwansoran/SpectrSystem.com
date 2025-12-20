/**
 * Clear all users and related data from the database
 * Automatically detects database type (SQLite or PostgreSQL)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Database = require('better-sqlite3');
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

async function clearUsers() {
  if (dbType === 'postgresql') {
    // PostgreSQL path
    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });

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
  } else {
    // SQLite path
    const dbPath = path.join(__dirname, '..', 'data', 'spectr-systems.db');

    if (!fs.existsSync(dbPath)) {
      console.log('❌ Database file not found:', dbPath);
      process.exit(1);
    }

    const db = new Database(dbPath);

    console.log('🗑️  Clearing all users and related data...\n');

    try {
      // Start transaction
      db.exec('BEGIN TRANSACTION');

      // Get counts before deletion
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
      const orgCount = db.prepare('SELECT COUNT(*) as count FROM organizations').get().count;
      const tokenCount = db.prepare('SELECT COUNT(*) as count FROM email_verification_tokens').get().count;
      const resetTokenCount = db.prepare('SELECT COUNT(*) as count FROM password_reset_tokens').get().count;

      console.log(`Found:`);
      console.log(`  - ${userCount} users`);
      console.log(`  - ${orgCount} organizations`);
      console.log(`  - ${tokenCount} email verification tokens`);
      console.log(`  - ${resetTokenCount} password reset tokens\n`);

      if (userCount === 0) {
        console.log('✅ No users to delete. Database is already empty.');
        db.exec('COMMIT');
        db.close();
        return;
      }

      // Delete in order (respecting foreign keys)
      db.prepare('DELETE FROM password_reset_tokens').run();
      console.log('✅ Deleted password reset tokens');

      db.prepare('DELETE FROM email_verification_tokens').run();
      console.log('✅ Deleted email verification tokens');

      db.prepare('DELETE FROM user_organizations').run();
      console.log('✅ Deleted user-organization links');

      db.prepare('DELETE FROM organizations').run();
      console.log('✅ Deleted organizations');

      db.prepare('DELETE FROM users').run();
      console.log('✅ Deleted users');

      // Commit transaction
      db.exec('COMMIT');

      console.log('\n✅ All users and related data cleared successfully!');
      console.log('   You can now create a new account.');

    } catch (error) {
      db.exec('ROLLBACK');
      console.error('❌ Error clearing data:', error.message);
      process.exit(1);
    } finally {
      db.close();
    }
  }
}

clearUsers();


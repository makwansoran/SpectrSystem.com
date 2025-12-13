/**
 * Clear all users and related data from the database
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

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


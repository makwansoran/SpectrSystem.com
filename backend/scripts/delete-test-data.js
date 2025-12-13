/**
 * Script to delete test user data
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/spectr-systems.db');
const db = new Database(dbPath);

console.log('=== DELETING TEST DATA ===\n');

try {
  // Start transaction
  db.exec('BEGIN TRANSACTION');

  // Delete email verification tokens
  const tokenCount = db.prepare('SELECT COUNT(*) as count FROM email_verification_tokens').get();
  db.prepare('DELETE FROM email_verification_tokens').run();
  console.log(`✓ Deleted ${tokenCount.count} email verification token(s)`);

  // Delete user-organization relationships
  const userOrgCount = db.prepare('SELECT COUNT(*) as count FROM user_organizations').get();
  db.prepare('DELETE FROM user_organizations').run();
  console.log(`✓ Deleted ${userOrgCount.count} user-organization relationship(s)`);

  // Delete users
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  db.prepare('DELETE FROM users').run();
  console.log(`✓ Deleted ${userCount.count} user(s)`);

  // Delete organizations
  const orgCount = db.prepare('SELECT COUNT(*) as count FROM organizations').get();
  db.prepare('DELETE FROM organizations').run();
  console.log(`✓ Deleted ${orgCount.count} organization(s)`);

  // Commit transaction
  db.exec('COMMIT');
  
  console.log('\n✅ All test data deleted successfully!');
  
  // Verify deletion
  console.log('\n=== VERIFICATION ===');
  const remainingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const remainingOrgs = db.prepare('SELECT COUNT(*) as count FROM organizations').get();
  const remainingTokens = db.prepare('SELECT COUNT(*) as count FROM email_verification_tokens').get();
  const remainingUserOrgs = db.prepare('SELECT COUNT(*) as count FROM user_organizations').get();
  
  console.log(`Users: ${remainingUsers.count}`);
  console.log(`Organizations: ${remainingOrgs.count}`);
  console.log(`Email verification tokens: ${remainingTokens.count}`);
  console.log(`User-organization relationships: ${remainingUserOrgs.count}`);
  
} catch (error) {
  db.exec('ROLLBACK');
  console.error('❌ Error deleting data:', error.message);
  process.exit(1);
} finally {
  db.close();
}


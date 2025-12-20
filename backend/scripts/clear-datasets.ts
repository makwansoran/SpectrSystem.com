/**
 * Clear All Datasets Script
 * Removes all fake/sample datasets from the database
 * Run with: npx tsx backend/scripts/clear-datasets.ts
 */

import { db } from '../src/database/sqlite';
import { pool } from '../src/database/postgresql';

const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

async function clearAllDatasets() {
  console.log('🗑️  Clearing all datasets from database...');
  
  try {
    if (dbType === 'postgresql') {
      // Delete all dataset purchases first (foreign key constraint)
      await pool.query('DELETE FROM dataset_purchases');
      console.log('✅ Cleared dataset_purchases');
      
      // Delete all datasets
      const result = await pool.query('DELETE FROM datasets');
      console.log(`✅ Deleted ${result.rowCount} datasets from PostgreSQL`);
    } else {
      // SQLite
      // Delete all dataset purchases first (foreign key constraint)
      db.prepare('DELETE FROM dataset_purchases').run();
      console.log('✅ Cleared dataset_purchases');
      
      // Delete all datasets
      const result = db.prepare('DELETE FROM datasets').run();
      console.log(`✅ Deleted ${result.changes} datasets from SQLite`);
    }
    
    console.log('✅ All datasets cleared successfully!');
    console.log('💡 You can now add real datasets through the admin panel.');
  } catch (error: any) {
    console.error('❌ Error clearing datasets:', error);
    process.exit(1);
  } finally {
    if (dbType === 'postgresql') {
      await pool.end();
    }
    process.exit(0);
  }
}

// Run the script
clearAllDatasets();


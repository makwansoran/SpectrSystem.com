/**
 * Script to check database tables and their contents
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/spectr-systems.db');
const db = new Database(dbPath);

console.log('=== DATABASE TABLES AND DATA ===\n');

// Get all tables
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  AND name NOT LIKE 'sqlite_%'
  ORDER BY name
`).all();

console.log(`Found ${tables.length} tables:\n`);

tables.forEach((table, index) => {
  const tableName = table.name;
  console.log(`${index + 1}. ${tableName}`);
  
  // Get row count
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
  console.log(`   Rows: ${count.count}`);
  
  // Get table schema
  const schema = db.prepare(`PRAGMA table_info(${tableName})`).all();
  console.log(`   Columns: ${schema.map(col => col.name).join(', ')}`);
  
  // Show sample data (first 5 rows)
  if (count.count > 0) {
    try {
      const sample = db.prepare(`SELECT * FROM ${tableName} LIMIT 5`).all();
      console.log(`   Sample data (first ${Math.min(5, count.count)} rows):`);
      sample.forEach((row, i) => {
        const rowData = Object.entries(row)
          .map(([key, value]) => {
            // Truncate long values
            const strValue = String(value);
            if (strValue.length > 50) {
              return `${key}: ${strValue.substring(0, 50)}...`;
            }
            return `${key}: ${value}`;
          })
          .join(', ');
        console.log(`      [${i + 1}] ${rowData}`);
      });
    } catch (error) {
      console.log(`   Error reading data: ${error.message}`);
    }
  } else {
    console.log(`   (empty)`);
  }
  
  console.log('');
});

db.close();
console.log('=== END ===');


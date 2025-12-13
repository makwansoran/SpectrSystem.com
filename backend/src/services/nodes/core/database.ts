/**
 * Database Node
 * SQLite database operations
 */

import type { DatabaseConfig } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';
import { db } from '../../../database';
import { interpolateVariables } from '../utils';

export const executeDatabase: NodeExecutor<DatabaseConfig> = async (
  config: DatabaseConfig,
  context: ExecutionContext
) => {
  if (!config.table) {
    throw new Error('Database node requires a table name');
  }

  const operation = config.operation || 'insert';
  const table = config.table || 'scraped_data';
  const where = config.where;
  const query = config.query;
  const limit = config.limit;

  console.log(`    🗄️ Database: ${operation.toUpperCase()} on ${table}`);

  try {
    // Get the input data
    const input = context.previousNodeOutput as Record<string, unknown>;
    const scraperData = input?.data || input;

    // Create table if it doesn't exist (for insert operations)
    if (operation === 'insert') {
      db.exec(`CREATE TABLE IF NOT EXISTS "${table}" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        url TEXT,
        content TEXT,
        data TEXT,
        scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    }

    switch (operation) {
      case 'insert': {
        if (!scraperData || typeof scraperData !== 'object') {
          throw new Error('No data to insert');
        }

        const dataObj = scraperData as Record<string, unknown>;
        const firstKey = Object.keys(dataObj)[0];
        const firstValue = dataObj[firstKey];

        if (Array.isArray(firstValue)) {
          // Multiple items - insert each as a row
          const keys = Object.keys(dataObj);
          const arrayLength = (firstValue as unknown[]).length;
          let insertedCount = 0;

          for (let i = 0; i < Math.min(arrayLength, 100); i++) {
            const row: Record<string, unknown> = {};
            keys.forEach(key => {
              const arr = dataObj[key];
              if (Array.isArray(arr) && arr[i] !== undefined) {
                row[key] = arr[i];
              }
            });

            const title = row['title'] || row['headlines'] || row['name'] || '';
            const url = row['url'] || row['link'] || row['href'] || '';
            const content = row['content'] || row['text'] || row['description'] || '';

            const stmt = db.prepare(`INSERT INTO "${table}" (title, url, content, data) VALUES (?, ?, ?, ?)`);
            stmt.run(String(title), String(url), String(content), JSON.stringify(row));
            insertedCount++;
          }

          return {
            inserted: true,
            table,
            count: insertedCount,
            message: `Inserted ${insertedCount} rows`
          };
        } else {
          // Single object - insert as one row
          const title = dataObj['title'] || dataObj['name'] || '';
          const url = dataObj['url'] || dataObj['link'] || '';
          const content = dataObj['content'] || dataObj['text'] || '';

          const stmt = db.prepare(`INSERT INTO "${table}" (title, url, content, data) VALUES (?, ?, ?, ?)`);
          const result = stmt.run(String(title), String(url), String(content), JSON.stringify(scraperData));

          return {
            inserted: true,
            table,
            id: result.lastInsertRowid,
            data: scraperData
          };
        }
      }

      case 'select': {
        let sql = `SELECT * FROM "${table}"`;
        if (where) sql += ` WHERE ${interpolateVariables(where, context)}`;
        if (limit) sql += ` LIMIT ${limit}`;

        const rows = db.prepare(sql).all();
        return {
          table,
          rows,
          count: rows.length
        };
      }

      case 'update': {
        const input = context.previousNodeOutput as Record<string, unknown>;
        const data = input?.data || input;

        if (!data || typeof data !== 'object') {
          throw new Error('No data to update');
        }

        const sets = Object.keys(data as object).map(k => `"${k}" = ?`).join(', ');
        const values = Object.values(data as object);

        let sql = `UPDATE "${table}" SET ${sets}`;
        if (where) sql += ` WHERE ${interpolateVariables(where, context)}`;

        const result = db.prepare(sql).run(...values);
        return {
          updated: true,
          table,
          changes: result.changes
        };
      }

      case 'delete': {
        let sql = `DELETE FROM "${table}"`;
        if (where) sql += ` WHERE ${interpolateVariables(where, context)}`;

        const result = db.prepare(sql).run();
        return {
          deleted: true,
          table,
          changes: result.changes
        };
      }

      case 'query': {
        const sql = interpolateVariables(query || '', context);

        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          const rows = db.prepare(sql).all();
          return { rows, count: rows.length };
        } else {
          const result = db.prepare(sql).run();
          return { executed: true, changes: result.changes };
        }
      }

      default:
        throw new Error(`Unknown database operation: ${operation}`);
    }
  } catch (error: any) {
    throw new Error(`Database error: ${error.message}`);
  }
};


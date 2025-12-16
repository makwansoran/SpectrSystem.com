/**
 * Database Node
 * Database operations (SQLite and PostgreSQL)
 */

import type { DatabaseConfig } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';
import { getDatabaseAdapter } from '../../../database/adapter';
import { interpolateVariables } from '../utils';

const dbAdapter = getDatabaseAdapter();
const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

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
      if (dbType === 'postgresql') {
        await dbAdapter.exec(`CREATE TABLE IF NOT EXISTS "${table}" (
          id SERIAL PRIMARY KEY,
          title TEXT,
          url TEXT,
          content TEXT,
          data TEXT,
          scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
      } else {
        await dbAdapter.exec(`CREATE TABLE IF NOT EXISTS "${table}" (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          url TEXT,
          content TEXT,
          data TEXT,
          scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
      }
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

            if (dbType === 'postgresql') {
              await dbAdapter.prepare(`INSERT INTO "${table}" (title, url, content, data) VALUES ($1, $2, $3, $4)`).run(
                String(title), String(url), String(content), JSON.stringify(row)
              );
            } else {
              await dbAdapter.prepare(`INSERT INTO "${table}" (title, url, content, data) VALUES (?, ?, ?, ?)`).run(
                String(title), String(url), String(content), JSON.stringify(row)
              );
            }
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

          if (dbType === 'postgresql') {
            const result = await dbAdapter.query(
              `INSERT INTO "${table}" (title, url, content, data) VALUES ($1, $2, $3, $4) RETURNING id`,
              [String(title), String(url), String(content), JSON.stringify(scraperData)]
            );
            return {
              inserted: true,
              table,
              id: result[0]?.id,
              data: scraperData
            };
          } else {
            await dbAdapter.prepare(`INSERT INTO "${table}" (title, url, content, data) VALUES (?, ?, ?, ?)`).run(
              String(title), String(url), String(content), JSON.stringify(scraperData)
            );
            // Query for last inserted ID
            const inserted = await dbAdapter.query(`SELECT last_insert_rowid() as id`);
            return {
              inserted: true,
              table,
              id: inserted[0]?.id,
              data: scraperData
            };
          }
        }
      }

      case 'select': {
        let sql = `SELECT * FROM "${table}"`;
        const params: any[] = [];
        
        if (where) {
          sql += ` WHERE ${interpolateVariables(where, context)}`;
        }
        if (limit) {
          if (dbType === 'postgresql') {
            sql += ` LIMIT $${params.length + 1}`;
            params.push(limit);
          } else {
            sql += ` LIMIT ?`;
            params.push(limit);
          }
        }

        const rows = await dbAdapter.prepare(sql).all(...params);
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

        const dataObj = data as Record<string, unknown>;
        const keys = Object.keys(dataObj);
        const values = Object.values(dataObj);
        
        let sets: string;
        if (dbType === 'postgresql') {
          sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        } else {
          sets = keys.map(k => `"${k}" = ?`).join(', ');
        }

        let sql = `UPDATE "${table}" SET ${sets}`;
        const allParams = [...values];
        
        if (where) {
          sql += ` WHERE ${interpolateVariables(where, context)}`;
        }

        await dbAdapter.prepare(sql).run(...allParams);
        // Note: changes count is not available in adapter interface
        // We'd need to query separately if needed
        return {
          updated: true,
          table,
          changes: 1 // Placeholder - actual count would require separate query
        };
      }

      case 'delete': {
        let sql = `DELETE FROM "${table}"`;
        if (where) sql += ` WHERE ${interpolateVariables(where, context)}`;

        await dbAdapter.prepare(sql).run();
        // Note: changes count is not available in adapter interface
        return {
          deleted: true,
          table,
          changes: 1 // Placeholder - actual count would require separate query
        };
      }

      case 'query': {
        const sql = interpolateVariables(query || '', context);

        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          const rows = await dbAdapter.query(sql);
          return { rows, count: rows.length };
        } else {
          await dbAdapter.exec(sql);
          return { executed: true, changes: 1 }; // Placeholder
        }
      }

      default:
        throw new Error(`Unknown database operation: ${operation}`);
    }
  } catch (error: any) {
    throw new Error(`Database error: ${error.message}`);
  }
};


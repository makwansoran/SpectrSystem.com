/**
 * Database Adapter
 * Abstracts database operations to support both SQLite and PostgreSQL
 */

import Database from 'better-sqlite3';
import { Client, Pool } from 'pg';
import path from 'path';

export type DatabaseType = 'sqlite' | 'postgresql';

export interface DatabaseAdapter {
  query(sql: string, params?: any[]): Promise<any[]>;
  exec(sql: string): Promise<void>;
  prepare(sql: string): {
    run: (...params: any[]) => Promise<void>;
    get: (...params: any[]) => Promise<any>;
    all: (...params: any[]) => Promise<any[]>;
  };
  close(): Promise<void>;
}

// SQLite Adapter
class SQLiteAdapter implements DatabaseAdapter {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as any[];
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }

  prepare(sql: string) {
    const stmt = this.db.prepare(sql);
    return {
      run: async (...params: any[]) => {
        stmt.run(...params);
      },
      get: async (...params: any[]) => {
        return stmt.get(...params);
      },
      all: async (...params: any[]) => {
        return stmt.all(...params) as any[];
      }
    };
  }

  async close(): Promise<void> {
    this.db.close();
  }
}

// PostgreSQL Adapter
class PostgreSQLAdapter implements DatabaseAdapter {
  private pool: Pool;

  constructor(config: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean;
  }) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    // Convert SQLite-style ? placeholders to PostgreSQL $1, $2, etc.
    let pgSql = sql;
    const pgParams: any[] = [];
    
    let paramIndex = 1;
    for (let i = 0; i < sql.length; i++) {
      if (sql[i] === '?' && (i === 0 || sql[i - 1] !== '?')) {
        pgSql = pgSql.replace('?', `$${paramIndex}`);
        pgParams.push(params[paramIndex - 1]);
        paramIndex++;
      }
    }
    
    const result = await this.pool.query(pgSql, pgParams.length > 0 ? pgParams : params);
    return result.rows;
  }

  async exec(sql: string): Promise<void> {
    // PostgreSQL doesn't support multiple statements in one exec
    // Split by semicolon and execute each
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    for (const statement of statements) {
      await this.pool.query(statement.trim());
    }
  }

  prepare(sql: string) {
    // Convert SQLite ? to PostgreSQL $1, $2, etc.
    let pgSql = sql;
    let paramIndex = 1;
    for (let i = 0; i < sql.length; i++) {
      if (sql[i] === '?' && (i === 0 || sql[i - 1] !== '?')) {
        pgSql = pgSql.replace('?', `$${paramIndex}`);
        paramIndex++;
      }
    }

    return {
      run: async (...params: any[]) => {
        await this.pool.query(pgSql, params);
      },
      get: async (...params: any[]) => {
        const result = await this.pool.query(pgSql, params);
        return result.rows[0] || null;
      },
      all: async (...params: any[]) => {
        const result = await this.pool.query(pgSql, params);
        return result.rows;
      }
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Factory function to create the appropriate adapter
export function createDatabaseAdapter(): DatabaseAdapter {
  const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase() as DatabaseType;

  if (dbType === 'postgresql') {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'spectrsystems',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true'
    };

    if (!config.password) {
      throw new Error('DB_PASSWORD is required for PostgreSQL');
    }

    return new PostgreSQLAdapter(config);
  } else {
    // Default to SQLite
    const dbPath = path.join(process.cwd(), 'data/spectr-systems.db');
    return new SQLiteAdapter(dbPath);
  }
}

// Export singleton instance
let dbAdapter: DatabaseAdapter | null = null;

export function getDatabaseAdapter(): DatabaseAdapter {
  if (!dbAdapter) {
    dbAdapter = createDatabaseAdapter();
  }
  return dbAdapter;
}


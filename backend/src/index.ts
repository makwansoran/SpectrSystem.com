/**
 * FlowCraft Backend Server
 * Main entry point for the Express server
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './database';
import workflowRoutes from './routes/workflows';
import executionRoutes from './routes/executions';
import intelligenceRoutes from './routes/intelligence';
import authRoutes from './routes/auth';
import organizationRoutes from './routes/organization';
import contactRoutes from './routes/contact';
import agentRoutes from './routes/agent';
import adminRoutes from './routes/admin';
import companyRoutes from './services/company-intelligence/routes/companies';
import { db } from './database';
import { getDatabaseAdapter } from './database/adapter';
import { verifyEmailConfig } from './services/email';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Get database adapter for cross-database compatibility
const dbAdapter = getDatabaseAdapter();

// Middleware
// CORS configuration - support both development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://spectrsystem.com',
  'https://www.spectrsystem.com',
  'https://d3a7goc7r9vv8s.cloudfront.net',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  // Support comma-separated multiple origins
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()) : [])
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}. Allowed origins:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Initialize database
// Note: initializeDatabase is async for PostgreSQL, sync for SQLite
const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();
if (dbType === 'postgresql') {
  (async () => {
    await initializeDatabase();
  })();
} else {
  initializeDatabase();
}

// Verify email configuration on startup
verifyEmailConfig();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/companies', companyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SPECTR SYSTEMS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test endpoint to check database tables
app.get('/api/test/db', async (req, res) => {
  try {
    const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();
    
    if (dbType === 'postgresql') {
      const tables = await dbAdapter.query(`
        SELECT table_name as name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'email_verification_tokens', 'organizations', 'user_organizations')
      `);
      
      const allTables = await dbAdapter.query(`
        SELECT table_name as name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      res.json({
        success: true,
        tables: tables.map((t: any) => t.name),
        allTables: allTables.map((t: any) => t.name),
      });
    } else {
      const tables = await dbAdapter.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name IN ('users', 'email_verification_tokens', 'organizations', 'user_organizations')
      `).all() as { name: string }[];
      
      const allTables = await dbAdapter.prepare(`
        SELECT name FROM sqlite_master WHERE type='table'
      `).all() as { name: string }[];
      
      res.json({
        success: true,
        tables: tables.map(t => t.name),
        allTables: allTables.map(t => t.name),
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get scraped data endpoint
app.get('/api/data', async (req, res) => {
  try {
    const table = req.query.table as string || 'scraped_data';
    const limit = parseInt(req.query.limit as string) || 100;
    const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();
    
    // Check if table exists
    let tableExists;
    if (dbType === 'postgresql') {
      const result = await dbAdapter.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
        [table]
      );
      tableExists = result.length > 0;
    } else {
      tableExists = await dbAdapter.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
      ).get(table);
    }
    
    if (!tableExists) {
      return res.json({ success: true, data: [], count: 0, tables: await getTableList() });
    }
    
    // Get rows
    let rows;
    if (dbType === 'postgresql') {
      rows = await dbAdapter.query(`SELECT * FROM "${table}" ORDER BY id DESC LIMIT $1`, [limit]);
    } else {
      rows = await dbAdapter.prepare(`SELECT * FROM "${table}" ORDER BY id DESC LIMIT ?`).all(limit);
    }
    
    res.json({ 
      success: true, 
      data: rows, 
      count: rows.length,
      table,
      tables: await getTableList()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get list of tables
app.get('/api/tables', async (req, res) => {
  try {
    res.json({ success: true, tables: await getTableList() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

async function getTableList(): Promise<string[]> {
  const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();
  
  if (dbType === 'postgresql') {
    const tables = await dbAdapter.query(`
      SELECT table_name as name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT IN ('workflows', 'executions', 'data_store')
    `) as { name: string }[];
    return tables.map(t => t.name);
  } else {
    const tables = await dbAdapter.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'workflows' AND name NOT LIKE 'executions' AND name NOT LIKE 'data_store'`
    ).all() as { name: string }[];
    return tables.map(t => t.name);
  }
}

// 404 handler
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.path} (original: ${req.originalUrl})`);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 SPECTR SYSTEMS Backend Server                       ║
║                                                           ║
║   Server running at: http://localhost:${PORT}              ║
║   API Base URL:      http://localhost:${PORT}/api          ║
║                                                           ║
║   Available endpoints:                                    ║
║   • GET    /api/health              - Health check        ║
║   • GET    /api/workflows           - List workflows      ║
║   • POST   /api/workflows           - Create workflow     ║
║   • GET    /api/workflows/:id       - Get workflow        ║
║   • PUT    /api/workflows/:id       - Update workflow     ║
║   • DELETE /api/workflows/:id       - Delete workflow     ║
║   • POST   /api/workflows/:id/execute - Execute workflow  ║
║   • GET    /api/executions          - List executions     ║
║   • GET    /api/agent/test          - Test agent route    ║
║   • POST   /api/agent/chat          - Agent chat          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});


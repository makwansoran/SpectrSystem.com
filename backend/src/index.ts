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
import { db } from './database';
import { verifyEmailConfig } from './services/email';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
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
app.get('/api/test/db', (req, res) => {
  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name IN ('users', 'email_verification_tokens', 'organizations', 'user_organizations')
    `).all() as { name: string }[];
    
    res.json({
      success: true,
      tables: tables.map(t => t.name),
      allTables: db.prepare(`
        SELECT name FROM sqlite_master WHERE type='table'
      `).all(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get scraped data endpoint
app.get('/api/data', (req, res) => {
  try {
    const table = req.query.table as string || 'scraped_data';
    const limit = parseInt(req.query.limit as string) || 100;
    
    // Check if table exists
    const tableExists = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
    ).get(table);
    
    if (!tableExists) {
      return res.json({ success: true, data: [], count: 0, tables: getTableList() });
    }
    
    const rows = db.prepare(`SELECT * FROM "${table}" ORDER BY id DESC LIMIT ?`).all(limit);
    res.json({ 
      success: true, 
      data: rows, 
      count: rows.length,
      table,
      tables: getTableList()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get list of tables
app.get('/api/tables', (req, res) => {
  try {
    res.json({ success: true, tables: getTableList() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function getTableList(): string[] {
  const tables = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'workflows' AND name NOT LIKE 'executions' AND name NOT LIKE 'data_store'`
  ).all() as { name: string }[];
  return tables.map(t => t.name);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
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
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});


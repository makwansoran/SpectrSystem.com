// @ts-nocheck
/**
 * Admin Routes
 * Handles admin operations: users management, statistics, and datasets
 * Currently accessible to all authenticated users (will be restricted later)
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { convertQuery, pool } from '../database/postgresql';
import { getDatabaseAdapter } from '../database/adapter';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();
const dbAdapter = getDatabaseAdapter();

/**
 * Middleware to verify authentication and admin role
 */
const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;

    // Check if user has admin role
    let user: any;
    if (dbType === 'postgresql') {
      const result = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.userId]);
      user = result.rows[0];
    } else {
      user = db.prepare('SELECT role FROM users WHERE id = ?').get(decoded.userId) as any;
    }

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
    next(error);
  }
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Apply authentication to all admin routes
router.use(authenticate);

// ==================== USERS MANAGEMENT ====================

/**
 * Get all users with pagination and filters
 */
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = (req.query.search as string) || '';
    const offset = (page - 1) * limit;

    let users: any[];
    let total: number;

    if (dbType === 'postgresql') {
      if (search) {
        const searchPattern = `%${search}%`;
        const usersResult = await pool.query(`
          SELECT u.*, 
                 o.name as organization_name,
                 o.plan as organization_plan
          FROM users u
          LEFT JOIN user_organizations uo ON u.id = uo.user_id
          LEFT JOIN organizations o ON uo.organization_id = o.id
          WHERE u.email ILIKE $1 OR u.name ILIKE $1
          ORDER BY u.created_at DESC
          LIMIT $2 OFFSET $3
        `, [searchPattern, limit, offset]);
        users = usersResult.rows;

        const countResult = await pool.query(`
          SELECT COUNT(*) as count
          FROM users
          WHERE email ILIKE $1 OR name ILIKE $1
        `, [searchPattern]);
        total = parseInt(countResult.rows[0].count);
      } else {
        const usersResult = await pool.query(`
          SELECT u.*, 
                 o.name as organization_name,
                 o.plan as organization_plan
          FROM users u
          LEFT JOIN user_organizations uo ON u.id = uo.user_id
          LEFT JOIN organizations o ON uo.organization_id = o.id
          ORDER BY u.created_at DESC
          LIMIT $1 OFFSET $2
        `, [limit, offset]);
        users = usersResult.rows;

        const countResult = await pool.query('SELECT COUNT(*) as count FROM users');
        total = parseInt(countResult.rows[0].count);
      }
    } else {
      if (search) {
        users = db.prepare(`
          SELECT u.*, 
                 o.name as organization_name,
                 o.plan as organization_plan
          FROM users u
          LEFT JOIN user_organizations uo ON u.id = uo.user_id
          LEFT JOIN organizations o ON uo.organization_id = o.id
          WHERE u.email LIKE ? OR u.name LIKE ?
          ORDER BY u.created_at DESC
          LIMIT ? OFFSET ?
        `).all(`%${search}%`, `%${search}%`, limit, offset) as any[];

        const countResult = db.prepare(`
          SELECT COUNT(*) as count
          FROM users
          WHERE email LIKE ? OR name LIKE ?
        `).get(`%${search}%`, `%${search}%`) as any;
        total = countResult.count;
      } else {
        users = db.prepare(`
          SELECT u.*, 
                 o.name as organization_name,
                 o.plan as organization_plan
          FROM users u
          LEFT JOIN user_organizations uo ON u.id = uo.user_id
          LEFT JOIN organizations o ON uo.organization_id = o.id
          ORDER BY u.created_at DESC
          LIMIT ? OFFSET ?
        `).all(limit, offset) as any[];

        const countResult = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
        total = countResult.count;
      }
    }

    res.json({
      success: true,
      data: {
        users: users.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          emailVerified: Boolean(u.email_verified),
          role: u.role,
          organizationName: u.organization_name,
          organizationPlan: u.organization_plan,
          createdAt: u.created_at,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
});

/**
 * Get user by ID
 */
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let user: any;
    if (dbType === 'postgresql') {
      const result = await pool.query(`
        SELECT u.*, 
               o.name as organization_name,
               o.plan as organization_plan,
               o.id as organization_id
        FROM users u
        LEFT JOIN user_organizations uo ON u.id = uo.user_id
        LEFT JOIN organizations o ON uo.organization_id = o.id
        WHERE u.id = $1
      `, [id]);
      user = result.rows[0];
    } else {
      user = db.prepare(`
        SELECT u.*, 
               o.name as organization_name,
               o.plan as organization_plan,
               o.id as organization_id
        FROM users u
        LEFT JOIN user_organizations uo ON u.id = uo.user_id
        LEFT JOIN organizations o ON uo.organization_id = o.id
        WHERE u.id = ?
      `).get(id) as any;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: Boolean(user.email_verified),
          role: user.role,
          organizationName: user.organization_name,
          organizationPlan: user.organization_plan,
          organizationId: user.organization_id,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
    });
  }
});

/**
 * Update user
 */
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, emailVerified } = req.body;

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (emailVerified !== undefined) {
      updates.push('email_verified = ?');
      values.push(emailVerified ? 1 : 0);
    }
    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    if (dbType === 'postgresql') {
      const setClause = updates.map((update, index) => {
        const field = update.split(' = ')[0];
        return `${field} = $${index + 1}`;
      }).join(', ');
      await pool.query(
        `UPDATE users SET ${setClause} WHERE id = $${updates.length + 1}`,
        values
      );
    } else {
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    res.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
    });
  }
});

/**
 * Delete user
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (dbType === 'postgresql') {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
    } else {
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
    });
  }
});

/**
 * Manually verify user email
 */
router.post('/users/:id/verify-email', async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();

    if (dbType === 'postgresql') {
      await pool.query(
        'UPDATE users SET email_verified = 1, updated_at = $1 WHERE id = $2',
        [now, id]
      );
    } else {
      db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?').run(now, id);
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email',
    });
  }
});

// ==================== STATISTICS ====================

/**
 * Get overview statistics
 */
router.get('/stats/overview', async (req, res) => {
  try {
    let stats: any;

    if (dbType === 'postgresql') {
      const [usersCount, orgsCount, workflowsCount, executionsCount, datasetsCount] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM users').then(r => parseInt(r.rows[0].count)),
        pool.query('SELECT COUNT(*) as count FROM organizations').then(r => parseInt(r.rows[0].count)),
        pool.query('SELECT COUNT(*) as count FROM workflows').then(r => parseInt(r.rows[0].count)),
        pool.query('SELECT COUNT(*) as count FROM executions').then(r => parseInt(r.rows[0].count)),
        pool.query('SELECT COUNT(*) as count FROM datasets').then(r => parseInt(r.rows[0].count)),
      ]);

      const verifiedUsers = await pool.query('SELECT COUNT(*) as count FROM users WHERE email_verified = 1')
        .then(r => parseInt(r.rows[0].count));

      const planStats = await pool.query(`
        SELECT plan, COUNT(*) as count
        FROM organizations
        GROUP BY plan
      `).then(r => r.rows);

      stats = {
        totalUsers: usersCount,
        verifiedUsers,
        totalOrganizations: orgsCount,
        totalWorkflows: workflowsCount,
        totalExecutions: executionsCount,
        totalDatasets: datasetsCount,
        planDistribution: planStats,
      };
    } else {
      const usersCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
      const verifiedUsers = (db.prepare('SELECT COUNT(*) as count FROM users WHERE email_verified = 1').get() as any).count;
      const orgsCount = (db.prepare('SELECT COUNT(*) as count FROM organizations').get() as any).count;
      const workflowsCount = (db.prepare('SELECT COUNT(*) as count FROM workflows').get() as any).count;
      const executionsCount = (db.prepare('SELECT COUNT(*) as count FROM executions').get() as any).count;
      const datasetsCount = (db.prepare('SELECT COUNT(*) as count FROM datasets').get() as any).count;

      const planStats = db.prepare(`
        SELECT plan, COUNT(*) as count
        FROM organizations
        GROUP BY plan
      `).all() as any[];

      stats = {
        totalUsers: usersCount,
        verifiedUsers,
        totalOrganizations: orgsCount,
        totalWorkflows: workflowsCount,
        totalExecutions: executionsCount,
        totalDatasets: datasetsCount,
        planDistribution: planStats,
      };
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
});

/**
 * Get user growth statistics
 */
router.get('/stats/users', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    let userGrowth: any[];

    if (dbType === 'postgresql') {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      userGrowth = await pool.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM users
        WHERE created_at >= $1
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [cutoffDate.toISOString()]).then(r => r.rows);
    } else {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      userGrowth = db.prepare(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM users
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `).all(cutoffDate.toISOString()) as any[];
    }

    res.json({
      success: true,
      data: userGrowth,
    });
  } catch (error: any) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics',
    });
  }
});

// ==================== DATASETS MANAGEMENT ====================

/**
 * Get all datasets
 */
router.get('/datasets', async (req, res) => {
  try {
    let datasets: any[];

    if (dbType === 'postgresql') {
      datasets = await pool.query(`
        SELECT d.*, u.name as created_by_name
        FROM datasets d
        LEFT JOIN users u ON d.created_by = u.id
        ORDER BY d.created_at DESC
      `).then(r => r.rows);
    } else {
      datasets = db.prepare(`
        SELECT d.*, u.name as created_by_name
        FROM datasets d
        LEFT JOIN users u ON d.created_by = u.id
        ORDER BY d.created_at DESC
      `).all() as any[];
    }

    res.json({
      success: true,
      data: datasets.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        category: d.category,
        type: d.type,
        price: d.price,
        featured: Boolean(d.featured),
        formats: JSON.parse(d.formats || '[]'),
        size: d.size,
        icon: d.icon,
        features: JSON.parse(d.features || '[]'),
        isActive: Boolean(d.is_active),
        isPublic: Boolean(d.is_public),
        config: d.config ? JSON.parse(d.config) : {},
        createdBy: d.created_by,
        createdByName: d.created_by_name,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      })),
    });
  } catch (error: any) {
    console.error('Get datasets error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch datasets',
    });
  }
});

/**
 * Get dataset by ID
 */
router.get('/datasets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let dataset: any;
    if (dbType === 'postgresql') {
      const result = await pool.query(`
        SELECT d.*, u.name as created_by_name
        FROM datasets d
        LEFT JOIN users u ON d.created_by = u.id
        WHERE d.id = $1
      `, [id]);
      dataset = result.rows[0];
    } else {
      dataset = db.prepare(`
        SELECT d.*, u.name as created_by_name
        FROM datasets d
        LEFT JOIN users u ON d.created_by = u.id
        WHERE d.id = ?
      `).get(id) as any;
    }

    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: 'Dataset not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        category: dataset.category,
        type: dataset.type,
        price: dataset.price,
        featured: Boolean(dataset.featured),
        formats: JSON.parse(dataset.formats || '[]'),
        size: dataset.size,
        icon: dataset.icon,
        features: JSON.parse(dataset.features || '[]'),
        isActive: Boolean(dataset.is_active),
        createdBy: dataset.created_by,
        createdByName: dataset.created_by_name,
        createdAt: dataset.created_at,
        updatedAt: dataset.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Get dataset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dataset',
    });
  }
});

/**
 * Create dataset
 */
router.post('/datasets', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      type,
      price,
      featured,
      formats,
      size,
      icon,
      features,
      isActive,
      isPublic,
      config,
    } = req.body;

    if (!name || !category || !type || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, category, type, and price are required',
      });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    if (dbType === 'postgresql') {
      await pool.query(`
        INSERT INTO datasets (
          id, name, description, category, type, price, featured,
          formats, size, icon, features, is_active, is_public, config, created_by,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [
        id,
        name,
        description || null,
        category,
        type,
        price,
        featured ? 1 : 0,
        JSON.stringify(formats || []),
        size || null,
        icon || null,
        JSON.stringify(features || []),
        isActive !== false ? 1 : 0,
        isPublic === true ? 1 : 0,
        JSON.stringify(config || {}),
        req.userId,
        now,
        now,
      ]);
    } else {
      db.prepare(`
        INSERT INTO datasets (
          id, name, description, category, type, price, featured,
          formats, size, icon, features, is_active, is_public, config, created_by,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        name,
        description || null,
        category,
        type,
        price,
        featured ? 1 : 0,
        JSON.stringify(formats || []),
        size || null,
        icon || null,
        JSON.stringify(features || []),
        isActive !== false ? 1 : 0,
        isPublic === true ? 1 : 0,
        JSON.stringify(config || {}),
        req.userId,
        now,
        now,
      );
    }

    res.json({
      success: true,
      data: { id },
      message: 'Dataset created successfully',
    });
  } catch (error: any) {
    console.error('Create dataset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create dataset',
    });
  }
});

/**
 * Update dataset
 */
router.put('/datasets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      type,
      price,
      featured,
      formats,
      size,
      icon,
      features,
      isActive,
      isPublic,
      config,
    } = req.body;

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (featured !== undefined) {
      updates.push('featured = ?');
      values.push(featured ? 1 : 0);
    }
    if (formats !== undefined) {
      updates.push('formats = ?');
      values.push(JSON.stringify(formats));
    }
    if (size !== undefined) {
      updates.push('size = ?');
      values.push(size);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }
    if (features !== undefined) {
      updates.push('features = ?');
      values.push(JSON.stringify(features));
    }
    if (isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }
    if (isPublic !== undefined) {
      updates.push('is_public = ?');
      values.push(isPublic ? 1 : 0);
    }
    if (config !== undefined) {
      updates.push('config = ?');
      values.push(JSON.stringify(config));
    }
    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    if (dbType === 'postgresql') {
      const setClause = updates.map((update, index) => {
        const field = update.split(' = ')[0];
        return `${field} = $${index + 1}`;
      }).join(', ');
      await pool.query(
        `UPDATE datasets SET ${setClause} WHERE id = $${updates.length + 1}`,
        values
      );
    } else {
      db.prepare(`UPDATE datasets SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    res.json({
      success: true,
      message: 'Dataset updated successfully',
    });
  } catch (error: any) {
    console.error('Update dataset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update dataset',
    });
  }
});

/**
 * Delete dataset
 */
router.delete('/datasets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (dbType === 'postgresql') {
      await pool.query('DELETE FROM datasets WHERE id = $1', [id]);
    } else {
      db.prepare('DELETE FROM datasets WHERE id = ?').run(id);
    }

    res.json({
      success: true,
      message: 'Dataset deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete dataset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete dataset',
    });
  }
});

/**
 * Toggle dataset featured status
 */
router.put('/datasets/:id/toggle-featured', async (req, res) => {
  try {
    const { id } = req.params;

    if (dbType === 'postgresql') {
      await pool.query(`
        UPDATE datasets 
        SET featured = CASE WHEN featured = 1 THEN 0 ELSE 1 END,
            updated_at = $1
        WHERE id = $2
      `, [new Date().toISOString(), id]);
    } else {
      // SQLite doesn't support CASE in UPDATE directly, so we need to check first
      const dataset = db.prepare('SELECT featured FROM datasets WHERE id = ?').get(id) as any;
      const newFeatured = dataset?.featured === 1 ? 0 : 1;
      db.prepare(`
        UPDATE datasets 
        SET featured = ?,
            updated_at = ?
        WHERE id = ?
      `).run(newFeatured, new Date().toISOString(), id);
    }

    res.json({
      success: true,
      message: 'Dataset featured status updated',
    });
  } catch (error: any) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update featured status',
    });
  }
});

/**
 * Toggle dataset active status
 */
router.put('/datasets/:id/toggle-active', async (req, res) => {
  try {
    const { id } = req.params;

    if (dbType === 'postgresql') {
      await pool.query(`
        UPDATE datasets 
        SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
            updated_at = $1
        WHERE id = $2
      `, [new Date().toISOString(), id]);
    } else {
      // SQLite doesn't support CASE in UPDATE directly, so we need to check first
      const dataset = db.prepare('SELECT is_active FROM datasets WHERE id = ?').get(id) as any;
      const newActive = dataset?.is_active === 1 ? 0 : 1;
      db.prepare(`
        UPDATE datasets 
        SET is_active = ?,
            updated_at = ?
        WHERE id = ?
      `).run(newActive, new Date().toISOString(), id);
    }

    res.json({
      success: true,
      message: 'Dataset active status updated',
    });
  } catch (error: any) {
    console.error('Toggle active error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update active status',
    });
  }
});

export default router;


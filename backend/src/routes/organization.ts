/**
 * Organization Routes
 * Handles organization management and plan updates
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { db, getUserOrganization, updateOrganizationPlan } from '../database';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Import PostgreSQL functions if using PostgreSQL
const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

/**
 * Middleware to verify JWT token
 */
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    (req as any).userId = decoded.userId;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
};

/**
 * Update organization plan
 */
router.put('/plan', authenticate, async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = (req as any).userId;

    if (!plan) {
      return res.status(400).json({
        success: false,
        error: 'Plan is required',
      });
    }

    // Validate plan
    const validPlans = ['free', 'standard', 'pro', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan. Must be one of: free, standard, pro, enterprise',
      });
    }

    // Get user's organization
    let userOrg;
    if (dbType === 'postgresql' && getUserOrganization) {
      userOrg = await getUserOrganization(userId);
    } else {
      userOrg = db.prepare(`
        SELECT o.id, o.plan
        FROM organizations o
        JOIN user_organizations uo ON o.id = uo.organization_id
        WHERE uo.user_id = ?
      `).get(userId) as any;
    }

    if (!userOrg) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found',
      });
    }

    // Update organization plan
    const now = new Date().toISOString();
    if (dbType === 'postgresql' && updateOrganizationPlan) {
      await updateOrganizationPlan(userOrg.id, plan);
      console.log(`✅ Plan updated to "${plan}" for organization ${userOrg.id}`);
    } else {
      const updateResult = db.prepare('UPDATE organizations SET plan = ?, updated_at = ? WHERE id = ?').run(plan, now, userOrg.id);
      const updatedOrg = db.prepare('SELECT plan FROM organizations WHERE id = ?').get(userOrg.id) as any;
      console.log(`✅ Plan updated to "${plan}" for organization ${userOrg.id}`);
      console.log(`   Verified: Organization plan is now "${updatedOrg?.plan}"`);
      console.log(`   Rows affected: ${updateResult.changes}`);
    }

    res.json({
      success: true,
      data: {
        plan,
        message: 'Plan updated successfully',
      },
    });
  } catch (error: any) {
    console.error('Update plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update plan',
    });
  }
});

/**
 * Get organization details
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Get user's organization
    let userOrg;
    if (dbType === 'postgresql' && getUserOrganization) {
      userOrg = await getUserOrganization(userId);
    } else {
      userOrg = db.prepare(`
        SELECT o.*, uo.role
        FROM organizations o
        JOIN user_organizations uo ON o.id = uo.organization_id
        WHERE uo.user_id = ?
      `).get(userId) as any;
    }

    if (!userOrg) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: userOrg.id,
        name: userOrg.name,
        plan: userOrg.plan,
        role: userOrg.role,
        createdAt: userOrg.created_at,
      },
    });
  } catch (error: any) {
    console.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get organization',
    });
  }
});

/**
 * Get organization usage stats
 */
router.get('/usage', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Get user's organization
    let userOrg;
    if (dbType === 'postgresql' && getUserOrganization) {
      userOrg = await getUserOrganization(userId);
    } else {
      userOrg = db.prepare(`
        SELECT o.id, o.plan
        FROM organizations o
        JOIN user_organizations uo ON o.id = uo.organization_id
        WHERE uo.user_id = ?
      `).get(userId) as any;
    }

    if (!userOrg) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found',
      });
    }

    const plan = userOrg.plan || 'free';

    // Define limits based on plan
    const planLimits: Record<string, any> = {
      free: {
        workflows: 3,
        executionsPerMonth: 100,
        storageGB: 1,
        apiCallsPerMonth: 1000,
        intelligenceProjects: 1,
        findingsPerMonth: 50,
      },
      standard: {
        workflows: 20,
        executionsPerMonth: 1000,
        storageGB: 10,
        apiCallsPerMonth: 10000,
        intelligenceProjects: 5,
        findingsPerMonth: 500,
      },
      pro: {
        workflows: 100,
        executionsPerMonth: 10000,
        storageGB: 100,
        apiCallsPerMonth: 100000,
        intelligenceProjects: 50,
        findingsPerMonth: 5000,
      },
      enterprise: {
        workflows: 'unlimited',
        executionsPerMonth: 'unlimited',
        storageGB: 'unlimited',
        apiCallsPerMonth: 'unlimited',
        intelligenceProjects: 'unlimited',
        findingsPerMonth: 'unlimited',
      },
    };

    const limits = planLimits[plan] || planLimits.free;

    // Get actual usage from database
    let workflowCount, executionCount, storageBytes, intelligenceProjectCount, findingsCount;
    
    if (dbType === 'postgresql' && db) {
      // Note: workflows table doesn't have organization_id, so we'll count all workflows for now
      const workflowResult = await db.query('SELECT COUNT(*) as count FROM workflows');
      workflowCount = { count: parseInt(workflowResult.rows[0].count) };

      // Executions for current month (PostgreSQL date format)
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const execResult = await db.query(
        "SELECT COUNT(*) as count FROM executions WHERE start_time LIKE $1",
        [`${currentMonth}%`]
      );
      executionCount = { count: parseInt(execResult.rows[0].count) };

      // Storage (simplified)
      const storageResult = await db.query(
        "SELECT COALESCE(SUM(LENGTH(value::text)), 0) as total_bytes FROM data_store"
      );
      storageBytes = { total_bytes: parseInt(storageResult.rows[0].total_bytes) || 0 };

      // Intelligence cases
      const intResult = await db.query('SELECT COUNT(*) as count FROM intelligence_cases');
      intelligenceProjectCount = { count: parseInt(intResult.rows[0].count) };

      // Findings for current month
      const findingsResult = await db.query(
        "SELECT COUNT(*) as count FROM intelligence_findings WHERE created_at LIKE $1",
        [`${currentMonth}%`]
      );
      findingsCount = { count: parseInt(findingsResult.rows[0].count) };
    } else {
      workflowCount = db.prepare(`SELECT COUNT(*) as count FROM workflows`).get() as any;
      executionCount = db.prepare(`
        SELECT COUNT(*) as count
        FROM executions
        WHERE strftime('%Y-%m', start_time) = strftime('%Y-%m', 'now')
      `).get() as any;
      storageBytes = db.prepare(`SELECT COALESCE(SUM(LENGTH(value)), 0) as total_bytes FROM data_store`).get() as any;
      intelligenceProjectCount = db.prepare(`SELECT COUNT(*) as count FROM intelligence_cases`).get() as any;
      findingsCount = db.prepare(`
        SELECT COUNT(*) as count
        FROM intelligence_findings
        WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
      `).get() as any;
    }

    const storageGB = (storageBytes?.total_bytes || 0) / (1024 * 1024 * 1024);

    // API calls would be tracked separately - for now, use execution count as proxy
    const apiCallsCount = executionCount?.count || 0;

    res.json({
      success: true,
      data: {
        workflows: {
          current: workflowCount?.count || 0,
          limit: limits.workflows,
        },
        executionsPerMonth: {
          current: executionCount?.count || 0,
          limit: limits.executionsPerMonth,
        },
        storageGB: {
          current: Math.round(storageGB * 100) / 100, // Round to 2 decimal places
          limit: limits.storageGB,
        },
        apiCallsPerMonth: {
          current: apiCallsCount,
          limit: limits.apiCallsPerMonth,
        },
        intelligenceProjects: {
          current: intelligenceProjectCount?.count || 0,
          limit: limits.intelligenceProjects,
        },
        findingsPerMonth: {
          current: findingsCount?.count || 0,
          limit: limits.findingsPerMonth,
        },
      },
    });
  } catch (error: any) {
    console.error('Get usage stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage stats',
    });
  }
});

export default router;


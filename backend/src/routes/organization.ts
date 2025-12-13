/**
 * Organization Routes
 * Handles organization management and plan updates
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
    const userOrg = db.prepare(`
      SELECT o.id, o.plan
      FROM organizations o
      JOIN user_organizations uo ON o.id = uo.organization_id
      WHERE uo.user_id = ?
    `).get(userId) as any;

    if (!userOrg) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found',
      });
    }

    // Update organization plan
    const now = new Date().toISOString();
    const updateResult = db.prepare('UPDATE organizations SET plan = ?, updated_at = ? WHERE id = ?').run(
      plan,
      now,
      userOrg.id
    );

    // Verify the update was successful
    const updatedOrg = db.prepare('SELECT plan FROM organizations WHERE id = ?').get(userOrg.id) as any;
    
    console.log(`✅ Plan updated to "${plan}" for organization ${userOrg.id}`);
    console.log(`   Verified: Organization plan is now "${updatedOrg?.plan}"`);
    console.log(`   Rows affected: ${updateResult.changes}`);

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
    const userOrg = db.prepare(`
      SELECT o.*, uo.role
      FROM organizations o
      JOIN user_organizations uo ON o.id = uo.organization_id
      WHERE uo.user_id = ?
    `).get(userId) as any;

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
    const userOrg = db.prepare(`
      SELECT o.id, o.plan
      FROM organizations o
      JOIN user_organizations uo ON o.id = uo.organization_id
      WHERE uo.user_id = ?
    `).get(userId) as any;

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
    const workflowCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM workflows
      WHERE organization_id = ?
    `).get(userOrg.id) as any;

    const executionCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM executions
      WHERE organization_id = ?
        AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get(userOrg.id) as any;

    // Calculate storage (simplified - in a real app, you'd sum file sizes)
    const storageBytes = db.prepare(`
      SELECT COALESCE(SUM(LENGTH(data)), 0) as total_bytes
      FROM data_store
      WHERE organization_id = ?
    `).get(userOrg.id) as any;
    const storageGB = (storageBytes?.total_bytes || 0) / (1024 * 1024 * 1024);

    const intelligenceProjectCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM intelligence_cases
      WHERE organization_id = ?
    `).get(userOrg.id) as any;

    const findingsCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM intelligence_findings
      WHERE organization_id = ?
        AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get(userOrg.id) as any;

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


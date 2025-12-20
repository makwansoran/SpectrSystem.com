/**
 * Workflow API Routes
 * RESTful endpoints for workflow CRUD and execution
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getExecutions,
  getUserOrganization,
  db
} from '../database';
import { executeWorkflow } from '../services/executor';
import { CreateWorkflowRequest, UpdateWorkflowRequest } from '../types';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

/**
 * Middleware to verify JWT token and get user organization
 */
const authenticate = async (req: Request, res: Response, next: any) => {
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
    const userId = decoded.userId;

    // Get user's organization
    let userOrg;
    if (dbType === 'postgresql' && getUserOrganization) {
      userOrg = await getUserOrganization(userId);
    } else {
      userOrg = (db as any).prepare(`
        SELECT o.*, uo.role
        FROM organizations o
        JOIN user_organizations uo ON o.id = uo.organization_id
        WHERE uo.user_id = ?
      `).get(userId);
    }

    if (!userOrg) {
      return res.status(403).json({
        success: false,
        error: 'User organization not found',
      });
    }

    (req as any).userId = userId;
    (req as any).organizationId = userOrg.id;
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
 * GET /api/workflows
 * List all workflows for the authenticated user's organization
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).organizationId;
    const workflows = dbType === 'postgresql' 
      ? await getAllWorkflows(organizationId) 
      : getAllWorkflows(organizationId);
    res.json({
      success: true,
      data: workflows || []
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflows'
    });
  }
});

/**
 * GET /api/workflows/:id
 * Get a single workflow by ID (must belong to user's organization)
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = (req as any).organizationId;
    const workflow = dbType === 'postgresql' 
      ? await getWorkflowById(id, organizationId) 
      : getWorkflowById(id, organizationId);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow'
    });
  }
});

/**
 * POST /api/workflows
 * Create a new workflow (associated with user's organization)
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const data: CreateWorkflowRequest = req.body;
    const organizationId = (req as any).organizationId;

    if (!data.name) {
      return res.status(400).json({
        success: false,
        error: 'Workflow name is required'
      });
    }

    const workflow = dbType === 'postgresql' 
      ? await createWorkflow(data, organizationId) 
      : createWorkflow(data, organizationId);

    res.status(201).json({
      success: true,
      data: workflow,
      message: 'Workflow created successfully'
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create workflow'
    });
  }
});

/**
 * PUT /api/workflows/:id
 * Update an existing workflow (must belong to user's organization)
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateWorkflowRequest = req.body;
    const organizationId = (req as any).organizationId;

    const workflow = dbType === 'postgresql' 
      ? await updateWorkflow(id, data, organizationId) 
      : updateWorkflow(id, data, organizationId);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      data: workflow,
      message: 'Workflow updated successfully'
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update workflow'
    });
  }
});

/**
 * DELETE /api/workflows/:id
 * Delete a workflow (must belong to user's organization)
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = (req as any).organizationId;
    const deleted = dbType === 'postgresql' 
      ? await deleteWorkflow(id, organizationId) 
      : deleteWorkflow(id, organizationId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete workflow'
    });
  }
});

/**
 * POST /api/workflows/:id/execute
 * Execute a workflow (must belong to user's organization)
 */
router.post('/:id/execute', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizationId = (req as any).organizationId;
    const workflow = dbType === 'postgresql' 
      ? await getWorkflowById(id, organizationId) 
      : getWorkflowById(id, organizationId);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    // Execute the workflow - ensure workflow is not a Promise
    const workflowResult = workflow instanceof Promise ? await workflow : workflow;
    if (!workflowResult) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }
    const execution = await executeWorkflow(workflowResult, 'manual', req.body.input);

    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute workflow'
    });
  }
});

/**
 * GET /api/workflows/:id/executions
 * Get execution history for a workflow (must belong to user's organization)
 */
router.get('/:id/executions', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit, offset } = req.query;
    const organizationId = (req as any).organizationId;

    // Verify workflow exists and belongs to user's organization
    const workflow = dbType === 'postgresql' 
      ? await getWorkflowById(id, organizationId) 
      : getWorkflowById(id, organizationId);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    const executions = dbType === 'postgresql' 
      ? await getExecutions({
          workflowId: id,
          limit: limit ? parseInt(limit as string) : 50,
          offset: offset ? parseInt(offset as string) : 0
        })
      : getExecutions({
          workflowId: id,
          limit: limit ? parseInt(limit as string) : 50,
          offset: offset ? parseInt(offset as string) : 0
        });

    res.json({
      success: true,
      data: executions || []
    });
  } catch (error) {
    console.error('Error fetching executions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch executions'
    });
  }
});

export default router;


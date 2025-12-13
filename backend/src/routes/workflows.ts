/**
 * Workflow API Routes
 * RESTful endpoints for workflow CRUD and execution
 */

import { Router, Request, Response } from 'express';
import {
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getExecutions
} from '../database';
import { executeWorkflow } from '../services/executor';
import { CreateWorkflowRequest, UpdateWorkflowRequest } from '../types';

const router = Router();

/**
 * GET /api/workflows
 * List all workflows
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const workflows = getAllWorkflows();
    res.json({
      success: true,
      data: workflows
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
 * Get a single workflow by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workflow = getWorkflowById(id);

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
 * Create a new workflow
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const data: CreateWorkflowRequest = req.body;

    if (!data.name) {
      return res.status(400).json({
        success: false,
        error: 'Workflow name is required'
      });
    }

    const workflow = createWorkflow(data);

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
 * Update an existing workflow
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateWorkflowRequest = req.body;

    const workflow = updateWorkflow(id, data);

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
 * Delete a workflow
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = deleteWorkflow(id);

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
 * Execute a workflow
 */
router.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workflow = getWorkflowById(id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    // Execute the workflow
    const execution = await executeWorkflow(workflow, 'manual', req.body.input);

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
 * Get execution history for a workflow
 */
router.get('/:id/executions', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit, offset } = req.query;

    // Verify workflow exists
    const workflow = getWorkflowById(id);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    const executions = getExecutions({
      workflowId: id,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0
    });

    res.json({
      success: true,
      data: executions
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


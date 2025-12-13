/**
 * Executions API Routes
 * Endpoints for execution history and logs
 */

import { Router, Request, Response } from 'express';
import { getExecutions, getExecutionById } from '../database';
import { ExecutionStatus } from '../types';

const router = Router();

/**
 * GET /api/executions
 * List all executions with optional filters
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { workflowId, status, startDate, endDate, limit, offset } = req.query;

    const executions = getExecutions({
      workflowId: workflowId as string,
      status: status as ExecutionStatus,
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limit ? parseInt(limit as string) : 100,
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

/**
 * GET /api/executions/:id
 * Get a single execution by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const execution = getExecutionById(id);

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }

    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    console.error('Error fetching execution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch execution'
    });
  }
});

export default router;


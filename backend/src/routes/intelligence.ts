/**
 * Intelligence Routes
 * OSINT/GEOINT API endpoints
 */

import { Router, Request, Response } from 'express';
import type { ApiResponse } from '../types';
import * as intelligenceDB from '../database/intelligence';

const router = Router();

// Get all intelligence projects
router.get('/projects', async (req: Request, res: Response<ApiResponse<any[]>>) => {
  try {
    const { status, workflowId } = req.query;
    const projects = intelligenceDB.getAllIntelligenceProjects({
      status: status as string,
      workflowId: workflowId as string,
    });
    
    // Add findings count to each project
    const projectsWithFindings = projects.map(project => ({
      ...project,
      findings: intelligenceDB.getIntelligenceFindings({ projectId: project.id }),
    }));

    res.json({
      success: true,
      data: projectsWithFindings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get intelligence project by ID
router.get('/projects/:id', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    const project = intelligenceDB.getIntelligenceProjectById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Add findings to project
    const findings = intelligenceDB.getIntelligenceFindings({ projectId: id });
    const entities = intelligenceDB.getIntelligenceEntitiesByProject(id);

    res.json({
      success: true,
      data: {
        ...project,
        findings,
        entities,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create new intelligence project
router.post('/projects', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { name, description, workflowId } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required',
      });
    }

    const project = intelligenceDB.createIntelligenceProject({
      name,
      description,
      workflowId,
    });

    res.json({
      success: true,
      data: {
        ...project,
        findings: [],
        entities: [],
      },
    });
  } catch (error: any) {
    // Check if it's a duplicate name error
    if (error.message && error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete all intelligence projects
router.delete('/projects', async (req: Request, res: Response<ApiResponse<{ deleted: number }>>) => {
  try {
    const deleted = intelligenceDB.deleteAllIntelligenceProjects();
    res.json({
      success: true,
      data: { deleted },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Legacy route for backward compatibility - redirects to projects
router.get('/cases', async (req: Request, res: Response<ApiResponse<any[]>>) => {
  try {
    const { status, workflowId } = req.query;
    const projects = intelligenceDB.getAllIntelligenceProjects({
      status: status as string,
      workflowId: workflowId as string,
    });
    
    const projectsWithFindings = projects.map(project => ({
      ...project,
      findings: intelligenceDB.getIntelligenceFindings({ projectId: project.id }),
    }));

    res.json({
      success: true,
      data: projectsWithFindings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/cases/:id', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    const project = intelligenceDB.getIntelligenceProjectById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const findings = intelligenceDB.getIntelligenceFindings({ projectId: id });
    const entities = intelligenceDB.getIntelligenceEntitiesByProject(id);

    res.json({
      success: true,
      data: {
        ...project,
        findings,
        entities,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/cases', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { name, description, workflowId } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required',
      });
    }

    const project = intelligenceDB.createIntelligenceProject({
      name,
      description,
      workflowId,
    });

    res.json({
      success: true,
      data: {
        ...project,
        findings: [],
        entities: [],
      },
    });
  } catch (error: any) {
    if (error.message && error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get intelligence findings
router.get('/findings', async (req: Request, res: Response<ApiResponse<any[]>>) => {
  try {
    const { projectId, caseId, workflowId, source, limit, offset } = req.query;
    const findings = intelligenceDB.getIntelligenceFindings({
      projectId: (projectId || caseId) as string,
      workflowId: workflowId as string,
      source: source as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: findings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get finding by ID
router.get('/findings/:id', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    const finding = intelligenceDB.getIntelligenceFindingById(id);
    
    if (!finding) {
      return res.status(404).json({
        success: false,
        error: 'Finding not found',
      });
    }

    res.json({
      success: true,
      data: finding,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Store intelligence finding
router.post('/findings', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const finding = req.body;
    
    if (!finding.source || !finding.data) {
      return res.status(400).json({
        success: false,
        error: 'Source and data are required',
      });
    }

    const storedFinding = intelligenceDB.createIntelligenceFinding({
      projectId: finding.projectId || finding.caseId,
      workflowId: finding.workflowId,
      nodeId: finding.nodeId,
      source: finding.source,
      data: finding.data,
      entities: finding.entities,
      geolocation: finding.geolocation,
      confidence: finding.confidence,
      tags: finding.tags,
      timestamp: finding.timestamp || new Date().toISOString(),
    });

    res.json({
      success: true,
      data: storedFinding,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Execute OSINT node
router.post('/osint/:nodeType', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { nodeType } = req.params;
    const { input, config } = req.body;
    
    let result: any;

    switch (nodeType) {
      case 'domain':
        const { executeDomainIntelligence } = await import('../services/intelligence/osint');
        result = await executeDomainIntelligence(input, config || {});
        break;
      
      case 'ip-geolocation':
        const { executeIPGeolocation } = await import('../services/intelligence/osint');
        result = await executeIPGeolocation(input, config || {});
        break;
      
      case 'entity-extraction':
        const { executeEntityExtraction } = await import('../services/intelligence/osint');
        result = await executeEntityExtraction(input, config || {});
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown OSINT node type: ${nodeType}`,
        });
    }

    // Optionally store the finding
    if (config?.storeFinding) {
      try {
        intelligenceDB.createIntelligenceFinding({
          projectId: config.projectId || config.caseId,
          workflowId: config.workflowId,
          nodeId: config.nodeId,
          source: nodeType,
          data: result.data,
          entities: result.entities,
          geolocation: result.geolocation,
          confidence: result.metadata.confidence,
        });
      } catch (err) {
        console.warn('Failed to store finding:', err);
      }
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Execute GEOINT node
router.post('/geoint/:nodeType', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    let { nodeType } = req.params;
    const { input, config } = req.body;
    
    // Strip 'geoint-' prefix if present
    if (nodeType.startsWith('geoint-')) {
      nodeType = nodeType.replace('geoint-', '');
    }
    
    let result: any;

    switch (nodeType) {
      case 'geocoding':
        const { executeGeocoding } = await import('../services/intelligence/geoint');
        result = await executeGeocoding(input, config || {});
        break;
      
      case 'weather':
        const { executeWeatherData } = await import('../services/intelligence/geoint');
        result = await executeWeatherData(input, config || {});
        break;
      
      case 'ip-geolocation':
        const { executeIPGeolocation } = await import('../services/intelligence/geoint');
        result = await executeIPGeolocation(input, config || {});
        break;
      
      case 'ship-tracking':
        const { executeShipTracking } = await import('../services/intelligence/geoint');
        result = await executeShipTracking(input, config || {});
        break;
      
      case 'flight-tracking':
        const { executeFlightTracking } = await import('../services/intelligence/geoint');
        result = await executeFlightTracking(input, config || {});
        break;
      
      case 'satellite':
        const { executeSatelliteImagery } = await import('../services/intelligence/geoint');
        result = await executeSatelliteImagery(input, config || {});
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown GEOINT node type: ${nodeType}`,
        });
    }

    // Optionally store the finding
    if (config?.storeFinding) {
      try {
        intelligenceDB.createIntelligenceFinding({
          projectId: config.projectId || config.caseId,
          workflowId: config.workflowId,
          nodeId: config.nodeId,
          source: nodeType,
          data: result.data,
          entities: result.entities,
          geolocation: result.geolocation,
          confidence: result.metadata.confidence,
        });
      } catch (err) {
        console.warn('Failed to store finding:', err);
      }
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;


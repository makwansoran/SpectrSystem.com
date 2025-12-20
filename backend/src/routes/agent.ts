// @ts-nocheck
/**
 * AI Agent Chat Routes
 * Handles chat interactions with the AI agent
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { executeAIAgent } from '../services/nodes/ai/ai-agent';
import type { AIAgentConfig } from '../types';
import type { ExecutionContext } from '../services/executor';
import { createWorkflow, updateWorkflow, getWorkflowById, getUserOrganization, db } from '../database';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

/**
 * Test endpoint to verify route is accessible
 * GET /api/agent/test
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Agent route is working',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Middleware to verify JWT token and get user organization
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
    const userId = decoded.userId;
    (req as any).userId = userId;

    // Get user's organization
    let userOrg;
    if (dbType === 'postgresql' && getUserOrganization) {
      userOrg = await getUserOrganization(userId);
    } else {
      // For SQLite, query directly
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
 * Chat with AI Agent
 * POST /api/agent/chat
 */
router.post('/chat', authenticate, async (req, res) => {
  console.log('[Agent Chat] Received request:', {
    method: req.method,
    path: req.path,
    url: req.url,
    hasMessage: !!req.body.message,
  });
  
  try {
    const { message, conversationHistory = [], workflowId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Get AI configuration - use environment variable for API key
    // Default to Claude (Anthropic) with the low-cost Haiku model
    const provider = 'anthropic' as 'openai' | 'anthropic' | 'ollama';
    const model = process.env.AI_MODEL || 'claude-3-5-haiku-20241022';
    // Get API key from environment variable (fallback to ANTHROPIC_API_KEY or AI_API_KEY)
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'AI API key not configured. Please set ANTHROPIC_API_KEY or AI_API_KEY environment variable.',
      });
    }
    const temperature = parseFloat(process.env.AI_TEMPERATURE || '0.7');
    const maxTokens = parseInt(process.env.AI_MAX_TOKENS || '2000');

    // Build system prompt with node capabilities
    const systemPrompt = `You are an AI agent assistant for SPECTR SYSTEM, an automation and intelligence platform. 
You help users with:
- Creating and managing workflows
- Executing automation tasks
- Intelligence gathering (OSINT, GEOINT)
- Data processing and analysis
- General questions about the platform

IMPORTANT: You can CREATE WORKFLOWS AND DASHBOARDS for users.

CRITICAL RULES:
1. NEVER show code, JSON, or technical syntax in your response to the user
2. ONLY describe what you're doing in natural, conversational language
3. When creating workflows/dashboards, embed a JSON object at the END of your response (the system will extract it)
4. Your response should ONLY be natural language - describe what you're creating, not how

When a user asks you to create a workflow or dashboard:
- Describe what you're doing in plain English
- Example: "I'll help you create a workflow to visualize global tanker locations. I'm setting up ship tracking and connecting it to a map visualization."
- At the END of your response, include a JSON object (the system will extract it automatically):
{
  "action": "create_workflow" or "create_dashboard",
  "preview": {
    "nodes": [{"id": "node1", "type": "node-type", "position": {"x": 100, "y": 100}, "data": {"label": "Node Name", "config": {}}}],
    "edges": [{"id": "edge1", "source": "node1", "target": "node2"}],
    "widgets": [{"id": "widget1", "type": "map", "title": "Map", "x": 0, "y": 0, "width": 400, "height": 300, "config": {}}]
  },
  "progress": "Current step description"
}

AVAILABLE NODE TYPES (YOU CAN ONLY USE THESE - DO NOT CREATE YOUR OWN):
Triggers: 
- 'purchased-data-input' (ALSO KNOWN AS "Spectr Live Data" or "Spectr Live" - when users ask for "spectr live data" or "spectr live", use this node type. It provides access to real-time intelligence data from SPECTR SYSTEMS data marketplace based on subscriptions)
- 'connected-data-input', 'webhook-trigger', 'schedule-trigger', 'email-trigger', 'entity-signup-trigger', 'external-alert-trigger', 'periodic-data-pull-trigger'
Data Sources: 'web-scraper', 'database', 'http-request', 'rss', 'html-extract'
Intelligence - OSINT: 'osint-enrichment', 'osint-social-media', 'osint-domain', 'osint-people-search', 'osint-company', 'osint-dark-web', 'osint-news-tracker', 'osint-code-search', 'osint-image-intel'
Intelligence - GEOINT: 'geoint-geocoding', 'geoint-satellite', 'geoint-flight-tracking', 'geoint-ship-tracking', 'geoint-ip-geolocation', 'geoint-weather', 'geoint-enrichment'
Intelligence - Analysis: 'intel-entity-extraction', 'intel-data-enrichment', 'intel-relationship-mapper', 'intel-timeline-builder', 'intel-geofencing', 'intel-pattern-detection', 'corporate-registry', 'sanctions-blacklist', 'social-footprint', 'domain-verification', 'risk-scoring', 'gdpr-compliance', 'historical-correlation'
Intelligence - Output: 'intel-map-visualization', 'intel-report-generator', 'intel-data-export'
Processing: 'filter', 'sort', 'set-variable', 'condition', 'code', 'ai-agent', 'loop', 'switch', 'merge', 'wait', 'json-transform', 'csv', 'xml', 'crypto', 'date-time'
Decision: 'risk-level-decision', 'approval-gate', 'escalation', 'branching', 'decision-action'
Action: 'notify-team', 'request-documents', 'account-restriction', 'ticket-generation', 'log-outcome'
Output: 'store-data', 'webhook-response', 'dashboard', 'form', 'login-authentication', 'redirection', 'website'
Integration: 'financial-integration', 'ecommerce-integration', 'database-integration', 'communication-integration', 'storage-integration', 'social-media-integration', 'crm-integration', 'productivity-integration', 'development-integration', 'marketing-integration', 'analytics-integration', 'forms-integration', 'support-integration', 'cloud-integration', 'integration'
Utility: 'audit-logging', 'execution-control', 'human-override', 'rate-quota'

CRITICAL: You MUST only use node types from the list above. If a node type doesn't exist in this list, you CANNOT use it. Do not invent or create new node types.

For workflows: Start with a trigger/data source, add processing nodes, end with output/visualization.
For dashboards: Create widgets (map, table, bar-chart, line-chart, pie-chart, card, gauge, text) with positions and data sources.

IMPORTANT ALIASES:
- "Spectr Live Data", "Spectr Live", "spectr live data node" = 'purchased-data-input' node type
- When users mention "spectr live" in any form, they are referring to the 'purchased-data-input' node

Remember: The user should NEVER see JSON or code. Only natural language describing what you're doing.`;

    // Build conversation context from history (last 8 messages to keep context manageable)
    const recentHistory = conversationHistory.slice(-8);
    let conversationContext = '';
    
    if (recentHistory.length > 0) {
      conversationContext = '\n\nHere is our conversation history for context:\n';
      for (const msg of recentHistory) {
        if (msg.from === 'user') {
          conversationContext += `User: ${msg.text}\n`;
        } else if (msg.from === 'agent') {
          conversationContext += `You: ${msg.text}\n`;
        }
      }
      conversationContext += '\nNow respond to the user\'s current message above.';
    }

    // Build the full user prompt with conversation context
    const fullUserPrompt = conversationContext 
      ? `${message.trim()}${conversationContext}`
      : message.trim();

    // Create AI agent config
    const aiConfig: AIAgentConfig = {
      provider,
      model,
      apiKey,
      systemPrompt,
      userPrompt: fullUserPrompt,
      temperature,
      maxTokens,
      jsonMode: false,
    };

    // Create execution context (minimal for chat)
    const context: ExecutionContext = {
      executionId: 'chat-' + Date.now(),
      variables: {},
      previousNodeOutput: {},
      allNodeOutputs: {},
      executedNodes: new Set(),
    };

    // Execute AI agent
    const result = await executeAIAgent(aiConfig, context) as any;

    // Extract response text
    let responseText = '';
    const resultResponse = result?.response;
    if (typeof resultResponse === 'string') {
      responseText = resultResponse;
    } else if (resultResponse && typeof resultResponse === 'object') {
      // If response is an object, try to extract meaningful text
      if ('response' in resultResponse && typeof (resultResponse as any).response === 'string') {
        responseText = (resultResponse as any).response;
      } else {
        responseText = JSON.stringify(resultResponse, null, 2);
      }
    } else {
      responseText = 'I received your message, but I\'m having trouble processing the response.';
    }

    // Extract JSON from response (if present) and remove it from the displayed message
    let cleanMessage = responseText;
    let extractedData: any = null;
    let createdWorkflowId: string | null = null;
    
    try {
      // Try to find JSON object in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Check if it's a valid action object
        if (parsed.action && (parsed.action === 'create_workflow' || parsed.action === 'create_dashboard')) {
          extractedData = parsed;
          
          // Update existing workflow or create new one
          const organizationId = (req as any).organizationId;
          if (organizationId && parsed.preview) {
            try {
              if (parsed.action === 'create_workflow') {
                // Convert preview nodes to workflow format
                const newNodes = (parsed.preview.nodes || []).map((node: any) => ({
                  id: node.id,
                  type: node.type,
                  position: node.position,
                  data: {
                    label: node.data?.label || node.id,
                    nodeType: node.type,
                    config: node.data?.config || {},
                  },
                }));
                
                const newEdges = (parsed.preview.edges || []).map((edge: any) => ({
                  id: edge.id || `edge-${uuidv4()}`,
                  source: edge.source,
                  target: edge.target,
                  sourceHandle: edge.sourceHandle,
                  targetHandle: edge.targetHandle,
                }));
                
                if (workflowId) {
                  // Update existing workflow - merge with existing nodes/edges
                  const existingWorkflowResult = dbType === 'postgresql'
                    ? await getWorkflowById(workflowId, organizationId)
                    : getWorkflowById(workflowId, organizationId);
                  const existingWorkflow = existingWorkflowResult instanceof Promise 
                    ? await existingWorkflowResult 
                    : existingWorkflowResult;
                  
                  if (existingWorkflow) {
                    // Merge new nodes and edges with existing ones
                    const existingNodes = (existingWorkflow as any).nodes || [];
                    const existingEdges = (existingWorkflow as any).edges || [];
                    
                    // Combine nodes (avoid duplicates by ID)
                    const nodeMap = new Map(existingNodes.map((n: any) => [n.id, n]));
                    newNodes.forEach((node: any) => {
                      nodeMap.set(node.id, node);
                    });
                    const mergedNodes = Array.from(nodeMap.values()) as any[];
                    
                    // Combine edges (avoid duplicates by ID)
                    const edgeMap = new Map(existingEdges.map((e: any) => [e.id, e]));
                    newEdges.forEach((edge: any) => {
                      edgeMap.set(edge.id, edge);
                    });
                    const mergedEdges = Array.from(edgeMap.values()) as any[];
                    
                    const updatedWorkflowResult = dbType === 'postgresql'
                      ? await updateWorkflow(workflowId, {
                          nodes: mergedNodes,
                          edges: mergedEdges,
                        }, organizationId)
                      : updateWorkflow(workflowId, {
                          nodes: mergedNodes,
                          edges: mergedEdges,
                        }, organizationId);
                    const updatedWorkflow = updatedWorkflowResult instanceof Promise 
                      ? await updatedWorkflowResult 
                      : updatedWorkflowResult;
                    
                    createdWorkflowId = (updatedWorkflow as any)?.id || workflowId;
                  }
                } else {
                  // Create new workflow if no workflowId provided
                  const workflowName = parsed.workflowName || `Workflow ${new Date().toLocaleDateString()}`;
                  const workflowDescription = parsed.description || 'Created by AI Agent';
                  
                  const createdWorkflowResult = dbType === 'postgresql'
                    ? await createWorkflow({
                        name: workflowName,
                        description: workflowDescription,
                        nodes: newNodes as any,
                        edges: newEdges as any,
                      }, organizationId)
                    : createWorkflow({
                        name: workflowName,
                        description: workflowDescription,
                        nodes: newNodes as any,
                        edges: newEdges as any,
                      }, organizationId);
                  const createdWorkflow = createdWorkflowResult instanceof Promise 
                    ? await createdWorkflowResult 
                    : createdWorkflowResult;
                  
                  createdWorkflowId = (createdWorkflow as any).id;
                }
              } else if (parsed.action === 'create_dashboard') {
                // Create a dashboard node with widgets in config
                const dashboardNodeId = `dashboard-${uuidv4()}`;
                const dashboardName = parsed.dashboardName || `Dashboard ${new Date().toLocaleDateString()}`;
                
                const dashboardNode = {
                  id: dashboardNodeId,
                  type: 'dashboard',
                  position: { x: 250, y: 250 },
                  data: {
                    label: dashboardName,
                    nodeType: 'dashboard',
                    config: {
                      widgets: parsed.preview.widgets || [],
                    },
                  },
                };
                
                // If there are data source nodes, add them and connect to dashboard
                const dataSourceNodes = (parsed.preview.dataSourceNodes || []).map((node: any) => ({
                  id: node.id,
                  type: node.type,
                  position: node.position || { x: 100, y: 100 },
                  data: {
                    label: node.data?.label || node.id,
                    nodeType: node.type,
                    config: node.data?.config || {},
                  },
                }));
                
                const newNodes = [dashboardNode, ...dataSourceNodes];
                const newEdges = dataSourceNodes.map((node: any) => ({
                  id: `edge-${uuidv4()}`,
                  source: node.id,
                  target: dashboardNodeId,
                }));
                
                if (workflowId) {
                  // Update existing workflow - merge with existing nodes/edges
                  const existingWorkflow = dbType === 'postgresql'
                    ? await getWorkflowById(workflowId, organizationId)
                    : getWorkflowById(workflowId, organizationId);
                  
                  if (existingWorkflow) {
                    // Merge new nodes and edges with existing ones
                    const existingNodes = existingWorkflow.nodes || [];
                    const existingEdges = existingWorkflow.edges || [];
                    
                    // Combine nodes (avoid duplicates by ID)
                    const nodeMap = new Map(existingNodes.map((n: any) => [n.id, n]));
                    newNodes.forEach((node: any) => {
                      nodeMap.set(node.id, node);
                    });
                    const mergedNodes = Array.from(nodeMap.values());
                    
                    // Combine edges (avoid duplicates by ID)
                    const edgeMap = new Map(existingEdges.map((e: any) => [e.id, e]));
                    newEdges.forEach((edge: any) => {
                      edgeMap.set(edge.id, edge);
                    });
                    const mergedEdges = Array.from(edgeMap.values());
                    
                    const updatedWorkflow = dbType === 'postgresql'
                      ? await updateWorkflow(workflowId, {
                          nodes: mergedNodes,
                          edges: mergedEdges,
                        }, organizationId)
                      : updateWorkflow(workflowId, {
                          nodes: mergedNodes,
                          edges: mergedEdges,
                        }, organizationId);
                    
                    createdWorkflowId = updatedWorkflow?.id || workflowId;
                  }
                } else {
                  // Create new workflow if no workflowId provided
                  const dashboardDescription = parsed.description || 'Created by AI Agent';
                  
                  const createdWorkflow = dbType === 'postgresql'
                    ? await createWorkflow({
                        name: dashboardName,
                        description: dashboardDescription,
                        nodes: newNodes,
                        edges: newEdges,
                      }, organizationId)
                    : createWorkflow({
                        name: dashboardName,
                        description: dashboardDescription,
                        nodes: newNodes,
                        edges: newEdges,
                      }, organizationId);
                  
                  createdWorkflowId = createdWorkflow.id;
                }
              }
            } catch (createError: any) {
              console.error('Error creating workflow/dashboard:', createError);
              // Continue even if creation fails - still show the preview
            }
          }
          
          // Remove the JSON from the message (remove everything from the JSON start to end)
          cleanMessage = responseText.replace(/\{[\s\S]*\}/, '').trim();
          // Also remove any markdown code blocks that might contain JSON
          cleanMessage = cleanMessage.replace(/```json[\s\S]*?```/g, '').trim();
          cleanMessage = cleanMessage.replace(/```[\s\S]*?```/g, '').trim();
        }
      }
    } catch (e) {
      // Not valid JSON, continue with original message
    }

    res.json({
      success: true,
      data: {
        message: cleanMessage,
        model: result?.model || 'unknown',
        provider: result?.provider || 'unknown',
        ...(extractedData && { 
          action: extractedData.action, 
          preview: extractedData.preview, 
          progress: extractedData.progress,
          workflowId: createdWorkflowId,
        }),
      },
    });
  } catch (error: any) {
    console.error('Agent chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process chat message',
    });
  }
});

export default router;


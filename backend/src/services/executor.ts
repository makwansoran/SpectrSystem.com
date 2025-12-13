/**
 * Workflow Execution Engine
 * Handles the actual execution of workflows
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowExecution,
  NodeExecutionResult,
} from '../types';
import {
  createExecution,
  updateExecution,
} from '../database';

// Execution context passed between nodes
export interface ExecutionContext {
  executionId: string;
  variables: Record<string, unknown>;
  previousNodeOutput: unknown;
  allNodeOutputs: Record<string, unknown>;
  executedNodes: Set<string>; // Track nodes that have been executed to prevent duplicates
  loopContext?: {
    nodeId: string;
    items: unknown[];
    currentIndex: number;
  };
}

// Import all node executors
import {
  executeManualTrigger,
  executeWebhookTrigger,
  executeScheduleTrigger,
  executeHttpRequest,
  executeSetVariable,
  executeCondition,
  executeCode,
  executeDatabase,
  executeWebScraper,
  executeSwitch,
  executeMerge,
  executeWait,
  executeFilter,
  executeSort,
  executeLoop,
  executeAIAgent,
  executeWebhookResponse,
  executeStoreData,
  executeDomainIntelligenceNode,
  executeEntityExtractionNode,
  executeGeocodingNode,
  executeIPGeolocationNode,
  executeWeatherDataNode,
  executeShipTrackingNode,
  executeFlightTrackingNode,
  executeSatelliteImageryNode,
  executeDataEnrichment,
  executeRelationshipMapper,
  executeTimelineBuilder,
  executeMapVisualization,
  executeReportGenerator,
  executeDataExport,
} from './nodes';

import {
  HttpRequestConfig,
  SetVariableConfig,
  ConditionConfig,
  WebhookResponseConfig,
  StoreDataConfig,
  WebScraperConfig,
  DatabaseConfig,
  LoopConfig,
  CodeConfig,
  AIAgentConfig,
  SwitchConfig,
  MergeConfig,
  WaitConfig,
  FilterConfig,
  SortConfig
} from '../types';

/**
 * Main workflow executor
 */
export async function executeWorkflow(
  workflow: Workflow,
  triggeredBy: 'manual' | 'webhook' | 'schedule' = 'manual',
  triggerData?: unknown
): Promise<WorkflowExecution> {
  console.log(`🚀 Starting execution of workflow: ${workflow.name}`);

  // Create execution record
  const execution = createExecution(workflow.id, workflow.name, triggeredBy);
  const nodeResults: NodeExecutionResult[] = [];

  // Initialize context
  const context: ExecutionContext = {
    executionId: execution.id,
    variables: {},
    previousNodeOutput: triggerData || {},
    allNodeOutputs: {},
    executedNodes: new Set()
  };

  try {
    // Find the starting node (trigger node)
    const startNode = findStartNode(workflow.nodes);
    if (!startNode) {
      throw new Error('No trigger node found in workflow');
    }

    // Execute nodes in order
    await executeNode(startNode, workflow, context, nodeResults);

    // Calculate total duration
    const endTime = new Date().toISOString();
    const duration = new Date(endTime).getTime() - new Date(execution.startTime).getTime();

    // Update execution as successful
    const updatedExecution = updateExecution(execution.id, {
      status: 'success',
      endTime,
      duration,
      nodeResults
    });

    console.log(`✅ Workflow execution completed successfully in ${duration}ms`);
    return updatedExecution!;

  } catch (error) {
    const endTime = new Date().toISOString();
    const duration = new Date(endTime).getTime() - new Date(execution.startTime).getTime();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update execution as failed
    const updatedExecution = updateExecution(execution.id, {
      status: 'failed',
      endTime,
      duration,
      nodeResults,
      error: errorMessage
    });

    console.error(`❌ Workflow execution failed: ${errorMessage}`);
    return updatedExecution!;
  }
}

/**
 * Find the starting (trigger) node
 */
function findStartNode(nodes: WorkflowNode[]): WorkflowNode | undefined {
  return nodes.find(node =>
    node.type === 'manual-trigger' ||
    node.type === 'webhook-trigger' ||
    node.type === 'schedule-trigger'
  );
}

/**
 * Get connected nodes (nodes that receive output from this node)
 */
function getConnectedNodes(
  nodeId: string,
  edges: WorkflowEdge[],
  nodes: WorkflowNode[],
  sourceHandle?: string
): WorkflowNode[] {
  const connectedEdges = edges.filter(edge => {
    if (edge.source !== nodeId) return false;
    if (sourceHandle && edge.sourceHandle !== sourceHandle) return false;
    return true;
  });

  return connectedEdges
    .map(edge => nodes.find(n => n.id === edge.target))
    .filter((n): n is WorkflowNode => n !== undefined);
}

/**
 * Execute a single node and its connected nodes
 */
async function executeNode(
  node: WorkflowNode,
  workflow: Workflow,
  context: ExecutionContext,
  results: NodeExecutionResult[]
): Promise<void> {
  // Skip if already executed (unless in a loop context)
  if (context.executedNodes.has(node.id) && !context.loopContext) {
    return;
  }

  const startTime = new Date().toISOString();
  const nodeResult: NodeExecutionResult = {
    nodeId: node.id,
    nodeName: node.data.label,
    status: 'running',
    startTime,
    input: context.previousNodeOutput
  };

  console.log(`  ⚡ Executing node: ${node.data.label} (${node.type})`);

  try {
    let output: unknown;
    let nextSourceHandle: string | undefined;

    // Execute based on node type
    switch (node.type) {
      case 'manual-trigger':
        output = await executeManualTrigger({}, context);
        break;

      case 'webhook-trigger':
        output = await executeWebhookTrigger({}, context);
        break;

      case 'schedule-trigger':
        output = await executeScheduleTrigger({}, context);
        break;

      case 'http-request':
        const httpConfig = node.data.config as HttpRequestConfig;
        if (!httpConfig.url) {
          throw new Error('HTTP Request node requires a URL');
        }
        output = await executeHttpRequest(httpConfig, context);
        break;

      case 'set-variable':
        const varConfig = node.data.config as SetVariableConfig;
        if (!varConfig.variables || varConfig.variables.length === 0) {
          throw new Error('Set Variable node requires at least one variable');
        }
        output = executeSetVariable(varConfig, context);
        break;

      case 'condition':
        const conditionConfig = node.data.config as ConditionConfig;
        if (!conditionConfig.field) {
          throw new Error('Condition node requires a field');
        }
        const conditionResult = await Promise.resolve(executeCondition(conditionConfig, context));
        output = conditionResult.output;
        nextSourceHandle = conditionResult.branch;
        break;

      case 'webhook-response':
        const webhookConfig = node.data.config as WebhookResponseConfig;
        if (webhookConfig.statusCode === undefined) {
          throw new Error('Webhook Response node requires a status code');
        }
        output = executeWebhookResponse(webhookConfig, context);
        break;

      case 'store-data':
        const storeConfig = node.data.config as StoreDataConfig;
        if (!storeConfig.key) {
          throw new Error('Store Data node requires a key');
        }
        output = executeStoreData(storeConfig, context);
        break;

      case 'web-scraper':
        const scraperConfig = node.data.config as WebScraperConfig;
        if (!scraperConfig.url) {
          throw new Error('Web Scraper node requires a URL');
        }
        output = await executeWebScraper(scraperConfig, context);
        break;

      case 'database':
        const dbConfig = node.data.config as DatabaseConfig;
        if (!dbConfig.table) {
          throw new Error('Database node requires a table name');
        }
        output = await executeDatabase(dbConfig, context);
        break;

      case 'loop':
        output = await executeLoop(
          node.data.config as LoopConfig,
          context,
          node,
          workflow,
          results,
          getConnectedNodes,
          executeNode
        );
        break;

      case 'code':
        const codeConfig = node.data.config as CodeConfig;
        if (!codeConfig.code || codeConfig.code.trim().length === 0) {
          throw new Error('Code node requires code to execute');
        }
        output = executeCode(codeConfig, context);
        break;

      case 'ai-agent':
        output = await executeAIAgent(node.data.config as AIAgentConfig, context);
        break;

      case 'switch':
        const switchResult = await Promise.resolve(executeSwitch(node.data.config as SwitchConfig, context));
        output = switchResult.output;
        nextSourceHandle = switchResult.branch;
        break;

      case 'merge':
        output = await executeMerge(
          { ...node.data.config as MergeConfig, node, workflow },
          context
        );
        break;

      case 'wait':
        output = await executeWait(node.data.config as WaitConfig, context);
        break;

      case 'filter':
        const filterConfig = node.data.config as FilterConfig;
        if (!filterConfig.field) {
          throw new Error('Filter node requires a field');
        }
        output = executeFilter(filterConfig, context);
        break;

      case 'sort':
        const sortConfig = node.data.config as SortConfig;
        if (!sortConfig.field) {
          throw new Error('Sort node requires a field');
        }
        output = executeSort(sortConfig, context);
        break;

      // ==================== INTELLIGENCE NODES ====================

      // OSINT Nodes
      case 'osint-domain':
        output = await executeDomainIntelligenceNode({ ...node.data.config as any, nodeId: node.id }, context);
        break;

      case 'intel-entity-extraction':
        output = await executeEntityExtractionNode({ ...node.data.config as any, nodeId: node.id }, context);
        break;

      // GEOINT Nodes
      case 'geoint-geocoding':
        output = await executeGeocodingNode({ ...node.data.config as any, nodeId: node.id }, context);
        break;

      case 'geoint-ip-geolocation':
        output = await executeIPGeolocationNode({ ...node.data.config as any, nodeId: node.id }, context);
        break;

      case 'geoint-weather':
        output = await executeWeatherDataNode({ ...node.data.config as any, nodeId: node.id }, context);
        break;

      case 'geoint-ship-tracking':
        output = await executeShipTrackingNode({ ...node.data.config as any, nodeId: node.id }, context);
        break;

      case 'geoint-flight-tracking':
        output = await executeFlightTrackingNode({ ...node.data.config as any, nodeId: node.id }, context);
        break;

      case 'geoint-satellite':
        output = await executeSatelliteImageryNode({ ...node.data.config as any, nodeId: node.id }, context);
        break;

      // Analysis Nodes
      case 'intel-data-enrichment':
        output = await executeDataEnrichment(node.data.config as any, context);
        break;

      case 'intel-relationship-mapper':
        output = await executeRelationshipMapper(node.data.config as any, context);
        break;

      case 'intel-timeline-builder':
        output = await executeTimelineBuilder(node.data.config as any, context);
        break;

      // Output Nodes
      case 'intel-map-visualization':
        output = await executeMapVisualization(node.data.config as any, context);
        break;

      case 'intel-report-generator':
        output = await executeReportGenerator(node.data.config as any, context);
        break;

      case 'intel-data-export':
        output = await executeDataExport(node.data.config as any, context);
        break;

      default:
        output = context.previousNodeOutput;
    }

    // Update node result
    const endTime = new Date().toISOString();
    nodeResult.status = 'success';
    nodeResult.endTime = endTime;
    nodeResult.duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    nodeResult.output = output;
    results.push(nodeResult);

    // Store output for reference by other nodes
    context.allNodeOutputs[node.id] = output;
    context.previousNodeOutput = output;

    // Mark node as executed (unless in a loop context where it may execute multiple times)
    if (!context.loopContext) {
      context.executedNodes.add(node.id);
    }

    // Execute connected nodes (unless this is a loop node, which handles its own connected nodes)
    if (node.type !== 'loop') {
      const connectedNodes = getConnectedNodes(node.id, workflow.edges, workflow.nodes, nextSourceHandle);

      for (const nextNode of connectedNodes) {
        await executeNode(nextNode, workflow, context, results);
      }
    }

  } catch (error) {
    const endTime = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    nodeResult.status = 'failed';
    nodeResult.endTime = endTime;
    nodeResult.duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    nodeResult.error = errorMessage;
    results.push(nodeResult);

    throw error;
  }
}

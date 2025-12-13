/**
 * Frontend Type Definitions
 * Matches backend types with additional UI-specific types
 */

import type { Node, Edge } from 'reactflow';

// Node Types - All integrations
export type NodeType = 
  // Triggers
  | 'manual-trigger'
  | 'webhook-trigger'
  | 'schedule-trigger'
  | 'email-trigger'
  // Core Actions
  | 'http-request'
  | 'set-variable'
  | 'condition'
  | 'loop'
  | 'code'
  | 'switch'
  | 'merge'
  | 'wait'
  | 'filter'
  | 'sort'
  // AI & ML
  | 'ai-agent'
  // Integration Nodes
  | 'financial-integration'
  | 'ecommerce-integration'
  | 'database-integration'
  | 'communication-integration'
  | 'storage-integration'
  | 'social-media-integration'
  | 'crm-integration'
  | 'productivity-integration'
  | 'development-integration'
  | 'marketing-integration'
  | 'analytics-integration'
  | 'forms-integration'
  | 'support-integration'
  | 'cloud-integration'
  // Databases (Core)
  | 'database'
  // Web & Scraping (Core)
  | 'web-scraper'
  | 'rss'
  | 'html-extract'
  // Transform (Core)
  | 'json-transform'
  | 'csv'
  | 'xml'
  | 'crypto'
  | 'date-time'
  // Outputs
  | 'webhook-response'
  | 'store-data'
  // Intelligence - OSINT
  | 'osint-social-media'
  | 'osint-domain'
  | 'osint-people-search'
  | 'osint-company'
  | 'osint-dark-web'
  | 'osint-news-tracker'
  | 'osint-code-search'
  | 'osint-image-intel'
  // Intelligence - GEOINT
  | 'geoint-geocoding'
  | 'geoint-satellite'
  | 'geoint-flight-tracking'
  | 'geoint-ship-tracking'
  | 'geoint-ip-geolocation'
  | 'geoint-weather'
  // Intelligence - Analysis
  | 'intel-entity-extraction'
  | 'intel-data-enrichment'
  | 'intel-relationship-mapper'
  | 'intel-timeline-builder'
  | 'intel-geofencing'
  | 'intel-pattern-detection'
  // Intelligence - Output
  | 'intel-map-visualization'
  | 'intel-report-generator'
  | 'intel-data-export';

export type NodeCategory = 'trigger' | 'action' | 'output' | 'intelligence';

// Node Definition (for the sidebar)
export interface NodeDefinition {
  type: NodeType;
  category: NodeCategory;
  subcategory?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  inputs: number;
  outputs: number;
}

// HTTP Request Config
export interface HttpRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: string;
  auth?: {
    type: 'none' | 'basic' | 'bearer';
    username?: string;
    password?: string;
    token?: string;
  };
}

// Set Variable Config
export interface SetVariableConfig {
  variables: Array<{
    key: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'expression';
  }>;
}

// Condition Config
export interface ConditionConfig {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
}

// Webhook Response Config
export interface WebhookResponseConfig {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

// Schedule Config
export interface ScheduleConfig {
  cronExpression: string;
  timezone: string;
}

// Webhook Trigger Config
export interface WebhookTriggerConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

// Store Data Config
export interface StoreDataConfig {
  key: string;
  value: string;
}

// Web Scraper Config
export interface WebScraperConfig {
  url: string;
  selectors: Array<{
    name: string;
    selector: string;
    attribute?: string; // 'text', 'href', 'src', or any attribute
    multiple?: boolean; // Get all matching elements
  }>;
  waitForSelector?: string;
  headers?: Record<string, string>;
}

// Database Config
export interface DatabaseConfig {
  operation: 'insert' | 'select' | 'update' | 'delete' | 'query';
  table: string;
  columns?: string[];
  values?: Record<string, string>;
  where?: string;
  query?: string; // For raw SQL queries
  limit?: number;
}

// Loop Config
export interface LoopConfig {
  items: string; // Expression to get array
  itemVariable: string; // Variable name for current item
  indexVariable?: string; // Variable name for current index
}

// Code Config
export interface CodeConfig {
  language: 'javascript';
  code: string;
}

// AI Agent Config
export interface AIAgentConfig {
  provider: 'openai' | 'anthropic' | 'ollama';
  model: string;
  apiKey?: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
  jsonMode?: boolean;
}

// Node Data (attached to React Flow nodes)
export interface CustomNodeData {
  label: string;
  nodeType: NodeType;
  config: Record<string, unknown>;
  isExecuting?: boolean;
  executionStatus?: 'pending' | 'running' | 'success' | 'failed';
  executionOutput?: unknown;
  executionError?: string;
}

// Workflow Types
export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, unknown>;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
}

export interface WorkflowListItem {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  isActive: boolean;
  lastExecuted?: string;
  createdAt: string;
  updatedAt: string;
}

// Execution Types
export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

export interface NodeExecutionResult {
  nodeId: string;
  nodeName: string;
  status: ExecutionStatus;
  startTime: string;
  endTime?: string;
  duration?: number;
  input?: unknown;
  output?: unknown;
  error?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  startTime: string;
  endTime?: string;
  duration?: number;
  nodeResults: NodeExecutionResult[];
  error?: string;
  triggeredBy: 'manual' | 'webhook' | 'schedule';
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// UI State Types
export interface SelectedNode {
  id: string;
  type: NodeType;
  data: CustomNodeData;
}

export type PanelView = 'none' | 'settings' | 'execution';

// React Flow Node Type
export type FlowNode = Node<CustomNodeData>;
export type FlowEdge = Edge;

// Intelligence Types
export type IntelligenceNodeType = 'osint' | 'geoint' | 'analysis' | 'output';

export interface IntelligenceOutput {
  data: any;
  metadata: {
    source: string;
    timestamp: string;
    confidence?: number;
    cost?: number;
  };
  entities?: Array<{
    type: 'email' | 'phone' | 'ip' | 'domain' | 'person' | 'location' | 'organization';
    value: string;
    confidence: number;
  }>;
  geolocation?: {
    lat: number;
    lon: number;
    accuracy?: number;
  };
}

export interface IntelligenceNodeConfig {
  apiKey?: string;
  credentials?: string;
  rateLimit?: {
    requests: number;
    window: number;
  };
  [key: string]: any;
}

export interface IntelligenceFinding {
  id: string;
  projectId?: string;
  workflowId: string;
  nodeId: string;
  source: string;
  data: any;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  geolocation?: {
    lat: number;
    lon: number;
    accuracy?: number;
  };
  timestamp: string;
  confidence: number;
  tags?: string[];
}

export interface IntelligenceProject {
  id: string;
  name: string;
  description?: string;
  workflowId?: string;
  findings: IntelligenceFinding[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'closed';
}

// Legacy alias for backward compatibility
export type IntelligenceCase = IntelligenceProject;


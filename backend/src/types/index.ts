/**
 * Core type definitions for FlowCraft workflow automation
 */

// Node Types
export type NodeType = 
  | 'manual-trigger'
  | 'webhook-trigger'
  | 'schedule-trigger'
  | 'email-trigger'
  | 'entity-signup-trigger'
  | 'external-alert-trigger'
  | 'periodic-data-pull-trigger'
  | 'purchased-data-input'
  | 'connected-data-input'
  | 'http-request'
  | 'web-scraper'
  | 'database'
  | 'rss'
  | 'html-extract'
  | 'set-variable'
  | 'condition'
  | 'loop'
  | 'code'
  | 'ai-agent'
  | 'webhook-response'
  | 'store-data'
  | 'switch'
  | 'merge'
  | 'wait'
  | 'filter'
  | 'sort'
  | 'json-transform'
  | 'csv'
  | 'xml'
  | 'crypto'
  | 'date-time'
  // Intelligence - OSINT
  | 'osint-enrichment'
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
  | 'geoint-enrichment'
  // Intelligence - Analysis
  | 'intel-entity-extraction'
  | 'intel-data-enrichment'
  | 'intel-relationship-mapper'
  | 'intel-timeline-builder'
  | 'intel-geofencing'
  | 'intel-pattern-detection'
  | 'corporate-registry'
  | 'sanctions-blacklist'
  | 'social-footprint'
  | 'domain-verification'
  | 'risk-scoring'
  | 'gdpr-compliance'
  | 'historical-correlation'
  // Intelligence - Output
  | 'intel-map-visualization'
  | 'intel-report-generator'
  | 'intel-data-export'
  // Decision
  | 'risk-level-decision'
  | 'approval-gate'
  | 'escalation'
  | 'branching'
  | 'decision-action'
  // Action
  | 'notify-team'
  | 'request-documents'
  | 'account-restriction'
  | 'ticket-generation'
  | 'log-outcome'
  // Output
  | 'dashboard'
  | 'form'
  | 'login-authentication'
  | 'redirection'
  | 'website'
  // Integration
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
  | 'integration'
  // Utility
  | 'audit-logging'
  | 'execution-control'
  | 'human-override'
  | 'rate-quota';

export type NodeCategory = 'trigger' | 'action' | 'output';

// Node Position
export interface Position {
  x: number;
  y: number;
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
    attribute?: string;
    multiple?: boolean;
  }>;
  headers?: Record<string, string>;
}

// Database Config
export interface DatabaseConfig {
  operation: 'insert' | 'select' | 'update' | 'delete' | 'query';
  table: string;
  columns?: string[];
  values?: Record<string, string>;
  where?: string;
  query?: string;
  limit?: number;
}

// Loop Config
export interface LoopConfig {
  items: string;
  itemVariable: string;
  indexVariable?: string;
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

// Switch Config
export interface SwitchConfig {
  field: string;
  rules: Array<{
    value: string;
    operator?: 'equals' | 'contains' | 'greater_than' | 'less_than';
    output: number; // Output index (0-3)
  }>;
  defaultOutput?: number;
}

// Merge Config
export interface MergeConfig {
  mode: 'merge' | 'append' | 'multiplex';
}

// Wait Config
export interface WaitConfig {
  duration: number; // milliseconds
  unit?: 'milliseconds' | 'seconds' | 'minutes' | 'hours';
}

// Filter Config
export interface FilterConfig {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
}

// Sort Config
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Node Configuration Union Type
export type NodeConfig = 
  | HttpRequestConfig 
  | SetVariableConfig 
  | ConditionConfig 
  | WebhookResponseConfig
  | ScheduleConfig
  | WebhookTriggerConfig
  | StoreDataConfig
  | WebScraperConfig
  | DatabaseConfig
  | LoopConfig
  | CodeConfig
  | AIAgentConfig
  | SwitchConfig
  | MergeConfig
  | WaitConfig
  | FilterConfig
  | SortConfig
  | Record<string, never>; // Empty config for manual trigger

// Workflow Node
export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: Position;
  data: {
    label: string;
    config: NodeConfig;
  };
}

// Connection between nodes
export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
}

// Complete Workflow
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

// Execution Status
export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

// Node Execution Result
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

// Workflow Execution
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

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Workflow List Item (simplified for list views)
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

// Create Workflow Request
export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}

// Update Workflow Request
export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  isActive?: boolean;
}

// Execution Filters
export interface ExecutionFilters {
  workflowId?: string;
  status?: ExecutionStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}


/**
 * API Service
 * Handles all communication with the backend
 */

import axios from 'axios';
import type { 
  Workflow, 
  WorkflowListItem, 
  WorkflowExecution,
  ApiResponse 
} from '../types';

// Use environment variable for API URL, fallback to /api for development
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// ============================================
// Workflow API
// ============================================

/**
 * Get all workflows
 */
export async function getWorkflows(): Promise<WorkflowListItem[]> {
  const response = await api.get<ApiResponse<WorkflowListItem[]>>('/workflows');
  return response.data.data || [];
}

/**
 * Get a single workflow by ID
 */
export async function getWorkflow(id: string): Promise<Workflow> {
  const response = await api.get<ApiResponse<Workflow>>(`/workflows/${id}`);
  if (!response.data.data) {
    throw new Error('Workflow not found');
  }
  return response.data.data;
}

/**
 * Create a new workflow
 */
export async function createWorkflow(data: {
  name: string;
  description?: string;
  nodes?: Workflow['nodes'];
  edges?: Workflow['edges'];
}): Promise<Workflow> {
  const response = await api.post<ApiResponse<Workflow>>('/workflows', data);
  if (!response.data.data) {
    throw new Error(response.data.error || 'Failed to create workflow');
  }
  return response.data.data;
}

/**
 * Update an existing workflow
 */
export async function updateWorkflow(
  id: string,
  data: Partial<Workflow>
): Promise<Workflow> {
  const response = await api.put<ApiResponse<Workflow>>(`/workflows/${id}`, data);
  if (!response.data.data) {
    throw new Error(response.data.error || 'Failed to update workflow');
  }
  return response.data.data;
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(id: string): Promise<void> {
  await api.delete(`/workflows/${id}`);
}

/**
 * Execute a workflow
 */
export async function executeWorkflow(
  id: string,
  input?: Record<string, unknown>
): Promise<WorkflowExecution> {
  const response = await api.post<ApiResponse<WorkflowExecution>>(
    `/workflows/${id}/execute`,
    { input }
  );
  if (!response.data.data) {
    throw new Error(response.data.error || 'Failed to execute workflow');
  }
  return response.data.data;
}

/**
 * Get workflow executions
 */
export async function getWorkflowExecutions(
  workflowId: string,
  limit = 50
): Promise<WorkflowExecution[]> {
  const response = await api.get<ApiResponse<WorkflowExecution[]>>(
    `/workflows/${workflowId}/executions`,
    { params: { limit } }
  );
  return response.data.data || [];
}

// ============================================
// Execution API
// ============================================

/**
 * Get all executions
 */
export async function getExecutions(params?: {
  workflowId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<WorkflowExecution[]> {
  const response = await api.get<ApiResponse<WorkflowExecution[]>>('/executions', {
    params,
  });
  return response.data.data || [];
}

/**
 * Get a single execution by ID
 */
export async function getExecution(id: string): Promise<WorkflowExecution> {
  const response = await api.get<ApiResponse<WorkflowExecution>>(`/executions/${id}`);
  if (!response.data.data) {
    throw new Error('Execution not found');
  }
  return response.data.data;
}

// ============================================
// Health Check
// ============================================

/**
 * Check API health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await api.get('/health');
    return response.data.success;
  } catch {
    return false;
  }
}

// ============================================
// Intelligence API
// ============================================

/**
 * Get all intelligence projects
 */
export async function getIntelligenceProjects(): Promise<any[]> {
  const response = await api.get<ApiResponse<any[]>>('/intelligence/projects');
  return response.data.data || [];
}

/**
 * Get intelligence project by ID
 */
export async function getIntelligenceProject(id: string): Promise<any> {
  const response = await api.get<ApiResponse<any>>(`/intelligence/projects/${id}`);
  if (!response.data.data) {
    throw new Error('Project not found');
  }
  return response.data.data;
}

/**
 * Create new intelligence project
 */
export async function createIntelligenceProject(data: {
  name: string;
  description?: string;
  workflowId?: string;
}): Promise<any> {
  const response = await api.post<ApiResponse<any>>('/intelligence/projects', data);
  if (!response.data.data) {
    throw new Error(response.data.error || 'Failed to create project');
  }
  return response.data.data;
}

/**
 * Delete all intelligence projects
 */
export async function deleteAllIntelligenceProjects(): Promise<{ deleted: number }> {
  const response = await api.delete<ApiResponse<{ deleted: number }>>('/intelligence/projects');
  return response.data.data || { deleted: 0 };
}

/**
 * Get intelligence findings
 */
export async function getIntelligenceFindings(params?: {
  projectId?: string;
  caseId?: string;
  workflowId?: string;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  const response = await api.get<ApiResponse<any[]>>('/intelligence/findings', { params });
  return response.data.data || [];
}

// Legacy functions for backward compatibility
export async function getIntelligenceCases(): Promise<any[]> {
  return getIntelligenceProjects();
}

export async function getIntelligenceCase(id: string): Promise<any> {
  return getIntelligenceProject(id);
}

export async function createIntelligenceCase(data: {
  name: string;
  description?: string;
  workflowId?: string;
}): Promise<any> {
  return createIntelligenceProject(data);
}

/**
 * Get intelligence finding by ID
 */
export async function getIntelligenceFinding(id: string): Promise<any> {
  const response = await api.get<ApiResponse<any>>(`/intelligence/findings/${id}`);
  if (!response.data.data) {
    throw new Error('Finding not found');
  }
  return response.data.data;
}

/**
 * Store intelligence finding
 */
export async function storeIntelligenceFinding(finding: any): Promise<any> {
  const response = await api.post<ApiResponse<any>>('/intelligence/findings', finding);
  if (!response.data.data) {
    throw new Error(response.data.error || 'Failed to store finding');
  }
  return response.data.data;
}

/**
 * Execute OSINT node
 */
export async function executeOSINTNode(
  nodeType: string,
  input: any,
  config: any
): Promise<any> {
  const response = await api.post<ApiResponse<any>>(
    `/intelligence/osint/${nodeType}`,
    { input, config }
  );
  if (!response.data.data) {
    throw new Error(response.data.error || 'Failed to execute OSINT node');
  }
  return response.data.data;
}

/**
 * Execute GEOINT node
 */
export async function executeGEOINTNode(
  nodeType: string,
  input: any,
  config: any
): Promise<any> {
  const response = await api.post<ApiResponse<any>>(
    `/intelligence/geoint/${nodeType}`,
    { input, config }
  );
  if (!response.data.data) {
    throw new Error(response.data.error || 'Failed to execute GEOINT node');
  }
  return response.data.data;
}

// ============================================
// User & Auth API
// ============================================

/**
 * Login user
 */
export async function login(email: string, password: string): Promise<{
  user: any;
  organization: any;
  token: string;
  requiresVerification?: boolean;
}> {
  const response = await api.post<ApiResponse<{
    user: any;
    organization: any;
    token: string;
    requiresVerification?: boolean;
  }>>('/auth/login', { email, password });
  if (!response.data.data) {
    throw new Error(response.data.error || 'Login failed');
  }
  return response.data.data;
}

/**
 * Register new user
 */
export async function register(
  email: string,
  password: string,
  name: string
): Promise<{
  user: any;
  organization: any;
  token: string;
  requiresVerification?: boolean;
}> {
  const response = await api.post<ApiResponse<{
    user: any;
    organization: any;
    token: string;
    requiresVerification?: boolean;
  }>>('/auth/register', { email, password, name });
  if (!response.data.data) {
    throw new Error(response.data.error || 'Registration failed');
  }
  return response.data.data;
}

/**
 * Verify email address
 */
export async function verifyEmail(token: string): Promise<ApiResponse<{
  user: any;
  organization: any;
  token: string;
}>> {
  const response = await api.post<ApiResponse<{
    user: any;
    organization: any;
    token: string;
  }>>('/auth/verify-email', { token }, {
    timeout: 10000 // 10 second timeout
  });
  return response.data;
}

/**
 * Resend verification email
 */
export async function resendVerification(email: string): Promise<void> {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/resend-verification', { email });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to resend verification email');
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to send password reset email');
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, password: string): Promise<void> {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, password });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to reset password');
  }
}

/**
 * Update organization plan
 */
export async function updateOrganizationPlan(plan: string): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  const response = await api.put<ApiResponse<{ message: string }>>('/organization/plan', { plan });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to update plan');
  }
}

/**
 * Contact sales
 */
export async function contactSales(data: {
  name: string;
  email: string;
  company: string;
  phone?: string;
  message: string;
}): Promise<void> {
  const response = await api.post<ApiResponse<{ message: string }>>('/contact/sales', data);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to send message');
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<any> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  const response = await api.get<ApiResponse<any>>('/auth/me');
  if (!response.data.data || !response.data.data.user) {
    throw new Error('User not found');
  }
  // Return just the user object, not the entire data object
  return response.data.data.user;
}

/**
 * Get organization
 */
export async function getOrganization(): Promise<any> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  const response = await api.get<ApiResponse<any>>('/organization');
  if (!response.data.data) {
    throw new Error('Organization not found');
  }
  return response.data.data;
}

/**
 * Get usage stats
 */
export async function getUsageStats(): Promise<any> {
  const response = await api.get<ApiResponse<any>>('/organization/usage');
  return response.data.data || null;
}

/**
 * Update user profile
 */
export async function updateProfile(data: Partial<any>): Promise<any> {
  const response = await api.put<ApiResponse<any>>('/auth/profile', data);
  if (!response.data.data) {
    throw new Error(response.data.error || 'Failed to update profile');
  }
  return response.data.data;
}

// ============================================
// AI Agent Chat API
// ============================================

/**
 * Send a message to the AI agent
 */
export async function sendAgentMessage(
  message: string,
  conversationHistory: Array<{ from: 'user' | 'agent'; text: string }> = []
): Promise<{ message: string; model: string; provider: string }> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  const response = await api.post<ApiResponse<{ message: string; model: string; provider: string }>>(
    '/agent/chat',
    { message, conversationHistory }
  );
  
  if (!response.data.data) {
    throw new Error(response.data.error || 'Failed to send message');
  }
  return response.data.data;
}

// ============================================
// Export the api instance for direct use if needed
export { api };


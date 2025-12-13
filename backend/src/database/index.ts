/**
 * Database Module for SPECTR SYSTEMS
 * Supports both SQLite and PostgreSQL based on DB_TYPE environment variable
 * 
 * IMPORTANT: When using PostgreSQL, all database functions are async.
 * Routes need to be updated to use await for database operations.
 */

import * as sqliteDb from './sqlite';
import * as postgresqlDb from './postgresql';

const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

// Export the appropriate database implementation
if (dbType === 'postgresql') {
  // PostgreSQL - all functions are async
  export const initializeDatabase = postgresqlDb.initializeDatabase;
  export const getAllWorkflows = postgresqlDb.getAllWorkflows;
  export const getWorkflowById = postgresqlDb.getWorkflowById;
  export const createWorkflow = postgresqlDb.createWorkflow;
  export const updateWorkflow = postgresqlDb.updateWorkflow;
  export const deleteWorkflow = postgresqlDb.deleteWorkflow;
  export const deleteAllWorkflows = postgresqlDb.deleteAllWorkflows;
  export const createExecution = postgresqlDb.createExecution;
  export const updateExecution = postgresqlDb.updateExecution;
  export const getExecutionById = postgresqlDb.getExecutionById;
  export const getExecutions = postgresqlDb.getExecutions;
  export const setDataStoreValue = postgresqlDb.setDataStoreValue;
  export const getDataStoreValue = postgresqlDb.getDataStoreValue;
  export const deleteDataStoreValue = postgresqlDb.deleteDataStoreValue;
  export const db = postgresqlDb.pool; // Export pool for direct access
  console.log('📊 Using PostgreSQL database');
} else {
  // SQLite - all functions are synchronous
  export const initializeDatabase = sqliteDb.initializeDatabase;
  export const getAllWorkflows = sqliteDb.getAllWorkflows;
  export const getWorkflowById = sqliteDb.getWorkflowById;
  export const createWorkflow = sqliteDb.createWorkflow;
  export const updateWorkflow = sqliteDb.updateWorkflow;
  export const deleteWorkflow = sqliteDb.deleteWorkflow;
  export const deleteAllWorkflows = sqliteDb.deleteAllWorkflows;
  export const createExecution = sqliteDb.createExecution;
  export const updateExecution = sqliteDb.updateExecution;
  export const getExecutionById = sqliteDb.getExecutionById;
  export const getExecutions = sqliteDb.getExecutions;
  export const setDataStoreValue = sqliteDb.setDataStoreValue;
  export const getDataStoreValue = sqliteDb.getDataStoreValue;
  export const deleteDataStoreValue = sqliteDb.deleteDataStoreValue;
  export const db = sqliteDb.db; // Export db instance for direct access
  console.log('📊 Using SQLite database');
}

// Re-export types
export type {
  Workflow,
  WorkflowExecution,
  WorkflowListItem,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  ExecutionFilters,
  ExecutionStatus
} from '../types';

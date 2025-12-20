/**
 * Database Module for SPECTR SYSTEMS
 * Supports both SQLite and PostgreSQL based on DB_TYPE environment variable
 * 
 * IMPORTANT: When using PostgreSQL, all database functions are async.
 * Routes need to be updated to use await for database operations.
 */

// @ts-nocheck
export const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

// Import both modules - tsx needs to resolve them at compile time
// We'll only use one based on DB_TYPE
import * as sqliteDb from './sqlite';
import * as postgresqlDb from './postgresql';

// Import user-related functions directly from postgresql
import {
  getUserByEmail as pgGetUserByEmail,
  getUserById as pgGetUserById,
  createUser as pgCreateUser,
  createOrganization as pgCreateOrganization,
  linkUserToOrganization as pgLinkUserToOrganization,
  createEmailVerificationToken as pgCreateEmailVerificationToken,
  getEmailVerificationToken as pgGetEmailVerificationToken,
  markEmailVerificationTokenAsUsed as pgMarkEmailVerificationTokenAsUsed,
  verifyUserEmail as pgVerifyUserEmail,
  getUserOrganization as pgGetUserOrganization,
  createPasswordResetToken as pgCreatePasswordResetToken,
  getPasswordResetToken as pgGetPasswordResetToken,
  markPasswordResetTokenAsUsed as pgMarkPasswordResetTokenAsUsed,
  updateUserPassword as pgUpdateUserPassword
} from './postgresql';

// Select the appropriate database implementation
const dbModule = dbType === 'postgresql' ? postgresqlDb : sqliteDb;

if (dbType === 'postgresql') {
  console.log('📊 Using PostgreSQL database');
  console.log('📊 PostgreSQL module type:', typeof postgresqlDb);
  console.log('📊 PostgreSQL has getUserByEmail:', 'getUserByEmail' in postgresqlDb);
  console.log('📊 getUserByEmail type:', typeof (postgresqlDb as any).getUserByEmail);
  console.log('📊 All exports:', Object.keys(postgresqlDb).slice(0, 15).join(', '));
} else {
  console.log('📊 Using SQLite database');
}

// Export the appropriate database implementation
export const initializeDatabase = dbModule.initializeDatabase;
export const getAllWorkflows = dbModule.getAllWorkflows;
export const getWorkflowById = dbModule.getWorkflowById;
export const createWorkflow = dbModule.createWorkflow;
export const updateWorkflow = dbModule.updateWorkflow;
export const deleteWorkflow = dbModule.deleteWorkflow;
export const deleteAllWorkflows = dbModule.deleteAllWorkflows;
export const createExecution = dbModule.createExecution;
export const updateExecution = dbModule.updateExecution;
export const getExecutionById = dbModule.getExecutionById;
export const getExecutions = dbModule.getExecutions;
export const setDataStoreValue = dbModule.setDataStoreValue;
export const getDataStoreValue = dbModule.getDataStoreValue;
export const deleteDataStoreValue = dbModule.deleteDataStoreValue;
// Export db with proper typing - use type assertion to avoid TS4023 error
export const db = (dbType === 'postgresql' ? postgresqlDb.pool : sqliteDb.db) as any;

// Export user-related functions (only available in PostgreSQL, will be undefined for SQLite)
export const getUserByEmail = dbType === 'postgresql' ? pgGetUserByEmail : undefined;
export const getUserById = dbType === 'postgresql' ? pgGetUserById : undefined;
export const createUser = dbType === 'postgresql' ? pgCreateUser : undefined;
export const createOrganization = dbType === 'postgresql' ? pgCreateOrganization : undefined;
export const linkUserToOrganization = dbType === 'postgresql' ? pgLinkUserToOrganization : undefined;
export const createEmailVerificationToken = dbType === 'postgresql' ? pgCreateEmailVerificationToken : undefined;
export const getEmailVerificationToken = dbType === 'postgresql' ? pgGetEmailVerificationToken : undefined;
export const markEmailVerificationTokenAsUsed = dbType === 'postgresql' ? pgMarkEmailVerificationTokenAsUsed : undefined;
export const verifyUserEmail = dbType === 'postgresql' ? pgVerifyUserEmail : undefined;
export const getUserOrganization = dbType === 'postgresql' ? pgGetUserOrganization : undefined;
export const updateOrganizationPlan = dbType === 'postgresql' ? (postgresqlDb as any).updateOrganizationPlan : undefined;
export const createPasswordResetToken = dbType === 'postgresql' ? pgCreatePasswordResetToken : undefined;
export const getPasswordResetToken = dbType === 'postgresql' ? pgGetPasswordResetToken : undefined;
export const markPasswordResetTokenAsUsed = dbType === 'postgresql' ? pgMarkPasswordResetTokenAsUsed : undefined;
export const updateUserPassword = dbType === 'postgresql' ? pgUpdateUserPassword : undefined;

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

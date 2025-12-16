/**
 * Entity Signup Trigger Node
 * Fires workflow when a new customer/vendor is registered in the system
 */

import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';

export interface EntitySignupTriggerConfig {
  entityType?: 'customer' | 'vendor' | 'both';
  watchFields?: string[]; // Fields to monitor for changes
}

export const executeEntitySignupTrigger: NodeExecutor = async (
  config: EntitySignupTriggerConfig,
  context: ExecutionContext
) => {
  // In a real implementation, this would listen to database events or API webhooks
  // For now, return the trigger data from context
  const triggerData = context.previousNodeOutput || {
    triggered: true,
    timestamp: new Date().toISOString(),
    entityType: config.entityType || 'both',
    entity: {
      id: context.workflowExecutionId || 'unknown',
      type: config.entityType || 'customer',
      registeredAt: new Date().toISOString(),
    },
  };

  return triggerData;
};

/**
 * Periodic Data Pull Trigger Node
 * Schedules workflows to refresh intelligence data on existing entities
 */

import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';

export interface PeriodicDataPullTriggerConfig {
  cronExpression?: string; // e.g., '0 */6 * * *' for every 6 hours
  entityIds?: string[]; // Specific entity IDs to refresh, or empty for all
  dataSources?: string[]; // Which data sources to pull from
  pullInterval?: number; // Interval in minutes (alternative to cron)
}

export const executePeriodicDataPullTrigger: NodeExecutor = async (
  config: PeriodicDataPullTriggerConfig,
  context: ExecutionContext
) => {
  // In a real implementation, this would be scheduled by a cron job or scheduler
  // For now, return the pull configuration and context
  const pullData = context.previousNodeOutput || {
    triggered: true,
    timestamp: new Date().toISOString(),
    pullConfig: {
      cronExpression: config.cronExpression || '0 */6 * * *',
      entityIds: config.entityIds || [],
      dataSources: config.dataSources || ['all'],
      pullInterval: config.pullInterval || 360, // Default 6 hours in minutes
    },
    entities: config.entityIds?.map(id => ({
      id,
      lastRefreshed: new Date().toISOString(),
    })) || [],
  };

  return pullData;
};

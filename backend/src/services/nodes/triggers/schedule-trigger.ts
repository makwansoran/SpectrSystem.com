/**
 * Schedule Trigger Node
 * Run on a schedule (cron)
 */

import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';

export const executeScheduleTrigger: NodeExecutor = async (
  config: Record<string, never>,
  context: ExecutionContext
) => {
  return context.previousNodeOutput || { triggered: true, timestamp: new Date().toISOString() };
};


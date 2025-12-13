/**
 * Manual Trigger Node
 * Starts workflow manually
 */

import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';

export const executeManualTrigger: NodeExecutor = async (
  config: Record<string, never>,
  context: ExecutionContext
) => {
  return context.previousNodeOutput || { triggered: true, timestamp: new Date().toISOString() };
};


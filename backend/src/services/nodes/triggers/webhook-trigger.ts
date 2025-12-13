/**
 * Webhook Trigger Node
 * Trigger via HTTP request
 */

import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';

export const executeWebhookTrigger: NodeExecutor = async (
  config: Record<string, never>,
  context: ExecutionContext
) => {
  return context.previousNodeOutput || { triggered: true, timestamp: new Date().toISOString() };
};


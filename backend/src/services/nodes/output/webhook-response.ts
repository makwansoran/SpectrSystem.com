/**
 * Webhook Response Node
 * Return HTTP response
 */

import type { WebhookResponseConfig } from '../../../types';
import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';
import { interpolateVariables } from '../utils';

export const executeWebhookResponse: NodeExecutor<WebhookResponseConfig> = (
  config: WebhookResponseConfig,
  context: ExecutionContext
) => {
  if (config.statusCode === undefined) {
    throw new Error('Webhook Response node requires a status code');
  }

  return {
    statusCode: config.statusCode || 200,
    headers: config.headers || {},
    body: interpolateVariables(config.body || '', context),
    responded: true
  };
};


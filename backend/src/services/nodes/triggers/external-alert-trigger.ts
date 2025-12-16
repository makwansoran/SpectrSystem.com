/**
 * External Alert Trigger Node
 * Fires workflow when a threat or external intelligence feed updates relevant data
 */

import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';

export interface ExternalAlertTriggerConfig {
  alertSource?: string; // e.g., 'threat-intel', 'osint-feed', 'security-alert'
  severity?: 'low' | 'medium' | 'high' | 'critical';
  watchKeywords?: string[]; // Keywords to filter alerts
  webhookUrl?: string; // Optional webhook to receive alerts
}

export const executeExternalAlertTrigger: NodeExecutor = async (
  config: ExternalAlertTriggerConfig,
  context: ExecutionContext
) => {
  // In a real implementation, this would listen to external feeds, webhooks, or message queues
  // For now, return the alert data from context
  const alertData = context.previousNodeOutput || {
    triggered: true,
    timestamp: new Date().toISOString(),
    alert: {
      id: context.workflowExecutionId || 'unknown',
      source: config.alertSource || 'external-feed',
      severity: config.severity || 'medium',
      title: 'External Alert Received',
      description: 'Threat or intelligence feed update detected',
      data: {},
    },
  };

  return alertData;
};

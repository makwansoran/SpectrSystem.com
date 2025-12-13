/**
 * Trigger Node Components
 * Minimalistic design
 */

import React, { memo } from 'react';
import { type NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import type { CustomNodeData, WebhookTriggerConfig, ScheduleConfig } from '../types';

export const ManualTriggerNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});

ManualTriggerNode.displayName = 'ManualTriggerNode';

export const WebhookTriggerNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  const config = props.data.config as WebhookTriggerConfig;
  return (
    <BaseNode {...props}>
      {config?.path && (
        <span className="font-mono text-[11px]">{config.method} {config.path}</span>
      )}
    </BaseNode>
  );
});

WebhookTriggerNode.displayName = 'WebhookTriggerNode';

export const ScheduleTriggerNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  const config = props.data.config as ScheduleConfig;
  return (
    <BaseNode {...props}>
      {config?.cronExpression && (
        <span className="font-mono text-[11px]">{config.cronExpression}</span>
      )}
    </BaseNode>
  );
});

ScheduleTriggerNode.displayName = 'ScheduleTriggerNode';

export const EmailTriggerNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});

EmailTriggerNode.displayName = 'EmailTriggerNode';

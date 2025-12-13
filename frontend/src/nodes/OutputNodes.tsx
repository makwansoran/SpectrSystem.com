/**
 * Output Node Components
 * Minimalistic design
 */

import React, { memo } from 'react';
import { type NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import type { 
  CustomNodeData, 
  WebhookResponseConfig, 
  StoreDataConfig 
} from '../types';

export const WebhookResponseNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  const config = props.data.config as WebhookResponseConfig;
  return (
    <BaseNode {...props}>
      {config?.statusCode && (
        <span className="text-[11px]">Status {config.statusCode}</span>
      )}
    </BaseNode>
  );
});

WebhookResponseNode.displayName = 'WebhookResponseNode';

export const StoreDataNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  const config = props.data.config as StoreDataConfig;
  return (
    <BaseNode {...props}>
      {config?.key && (
        <span className="font-mono text-[11px]">{config.key}</span>
      )}
    </BaseNode>
  );
});

StoreDataNode.displayName = 'StoreDataNode';

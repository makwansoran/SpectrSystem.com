/**
 * Action Node Components
 * Light theme design
 */

import React, { memo } from 'react';
import { type NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import type { 
  CustomNodeData, 
  HttpRequestConfig, 
  SetVariableConfig, 
  ConditionConfig,
  WebScraperConfig,
  DatabaseConfig,
  LoopConfig,
  CodeConfig,
  AIAgentConfig
} from '../types';

// Generic node for all integration nodes without custom display
export const GenericNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});

GenericNode.displayName = 'GenericNode';

// AI Agent Node
export const AIAgentNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  const config = props.data.config as AIAgentConfig;
  return (
    <BaseNode {...props}>
      {config?.provider && (
        <div className="space-y-0.5">
          <span className="text-[10px] font-medium text-purple-500 capitalize">{config.provider}</span>
          {config.model && <div className="text-[11px] text-slate-500">{config.model}</div>}
        </div>
      )}
    </BaseNode>
  );
});

AIAgentNode.displayName = 'AIAgentNode';

export const HttpRequestNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  const config = props.data.config as HttpRequestConfig;
  return (
    <BaseNode {...props}>
      {config?.url && (
        <div className="space-y-0.5">
          <span className="text-[10px] font-medium text-blue-500">{config.method}</span>
          <div className="font-mono text-[11px] truncate max-w-[150px]">{config.url}</div>
        </div>
      )}
    </BaseNode>
  );
});

HttpRequestNode.displayName = 'HttpRequestNode';

export const WebScraperNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  const config = props.data.config as WebScraperConfig;
  const selectorCount = config?.selectors?.length || 0;
  return (
    <BaseNode {...props}>
      {config?.url && (
        <div className="space-y-0.5">
          <div className="font-mono text-[11px] truncate max-w-[150px]">{config.url}</div>
          {selectorCount > 0 && (
            <span className="text-[10px] text-emerald-600">{selectorCount} selector{selectorCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      )}
    </BaseNode>
  );
});

WebScraperNode.displayName = 'WebScraperNode';

export const DatabaseNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  const config = props.data.config as DatabaseConfig;
  return (
    <BaseNode {...props}>
      {config?.operation && (
        <div className="space-y-0.5">
          <span className="text-[10px] font-medium text-purple-500 uppercase">{config.operation}</span>
          {config.table && <div className="font-mono text-[11px]">{config.table}</div>}
        </div>
      )}
    </BaseNode>
  );
});

DatabaseNode.displayName = 'DatabaseNode';

export const SetVariableNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  const config = props.data.config as SetVariableConfig;
  const count = config?.variables?.length || 0;
  return (
    <BaseNode {...props}>
      {count > 0 && <span className="text-[11px]">{count} variable{count !== 1 ? 's' : ''}</span>}
    </BaseNode>
  );
});

SetVariableNode.displayName = 'SetVariableNode';

export const ConditionNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  const config = props.data.config as ConditionConfig;
  return (
    <BaseNode {...props}>
      {config?.field && (
        <span className="font-mono text-[11px]">{config.field} {config.operator}</span>
      )}
    </BaseNode>
  );
});

ConditionNode.displayName = 'ConditionNode';

export const LoopNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  const config = props.data.config as LoopConfig;
  return (
    <BaseNode {...props}>
      {config?.itemVariable && (
        <span className="font-mono text-[11px]">for {config.itemVariable} in items</span>
      )}
    </BaseNode>
  );
});

LoopNode.displayName = 'LoopNode';

export const CodeNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  const config = props.data.config as CodeConfig;
  return (
    <BaseNode {...props}>
      {config?.code && (
        <span className="text-[11px] text-slate-500">JavaScript</span>
      )}
    </BaseNode>
  );
});

CodeNode.displayName = 'CodeNode';

// Decision Nodes
export const RiskLevelDecisionNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
RiskLevelDecisionNode.displayName = 'RiskLevelDecisionNode';

export const ApprovalGateNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
ApprovalGateNode.displayName = 'ApprovalGateNode';

export const EscalationNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
EscalationNode.displayName = 'EscalationNode';

export const BranchingNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
BranchingNode.displayName = 'BranchingNode';

// Action Nodes
export const NotifyTeamNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
NotifyTeamNode.displayName = 'NotifyTeamNode';

export const RequestDocumentsNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
RequestDocumentsNode.displayName = 'RequestDocumentsNode';

export const AccountRestrictionNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
AccountRestrictionNode.displayName = 'AccountRestrictionNode';

export const TicketGenerationNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
TicketGenerationNode.displayName = 'TicketGenerationNode';

export const LogOutcomeNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
LogOutcomeNode.displayName = 'LogOutcomeNode';

// Utility / Governance Nodes
export const AuditLoggingNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
AuditLoggingNode.displayName = 'AuditLoggingNode';

export const ExecutionControlNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
ExecutionControlNode.displayName = 'ExecutionControlNode';

export const HumanOverrideNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
HumanOverrideNode.displayName = 'HumanOverrideNode';

export const RateQuotaNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
RateQuotaNode.displayName = 'RateQuotaNode';

// App Nodes
export const FormNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
FormNode.displayName = 'FormNode';

export const LoginAuthenticationNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
LoginAuthenticationNode.displayName = 'LoginAuthenticationNode';

export const RedirectionNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
RedirectionNode.displayName = 'RedirectionNode';

export const DashboardNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
DashboardNode.displayName = 'DashboardNode';

// Integration Nodes
export const IntegrationNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
IntegrationNode.displayName = 'IntegrationNode';

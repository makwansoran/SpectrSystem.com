/**
 * Intelligence Node Components
 * OSINT, GEOINT, and Analysis nodes
 */

import React, { memo } from 'react';
import { type NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import type { CustomNodeData } from '../types';

// OSINT Enrichment Node
export const OSINTEnrichmentNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
OSINTEnrichmentNode.displayName = 'OSINTEnrichmentNode';

// Corporate Registry Node
export const CorporateRegistryNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
CorporateRegistryNode.displayName = 'CorporateRegistryNode';

// Sanctions & Blacklist Node
export const SanctionsBlacklistNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
SanctionsBlacklistNode.displayName = 'SanctionsBlacklistNode';

// Social Footprint Node
export const SocialFootprintNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
SocialFootprintNode.displayName = 'SocialFootprintNode';

// Domain Verification Node
export const DomainVerificationNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
DomainVerificationNode.displayName = 'DomainVerificationNode';

// Risk Scoring Node
export const RiskScoringNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
RiskScoringNode.displayName = 'RiskScoringNode';

// GDPR Compliance Node
export const GDPRComplianceNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
GDPRComplianceNode.displayName = 'GDPRComplianceNode';

// Historical Correlation Node
export const HistoricalCorrelationNode: React.FC<NodeProps<CustomNodeData>> = memo((props) => {
  return <BaseNode {...props} />;
});
HistoricalCorrelationNode.displayName = 'HistoricalCorrelationNode';

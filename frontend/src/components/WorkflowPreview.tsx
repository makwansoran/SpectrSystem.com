/**
 * Workflow Preview Component
 * Mini ReactFlow canvas for live workflow visualization during agent creation
 */

import React, { useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';
import ReactFlow, {
  Background,
  BackgroundVariant,
  MiniMap,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from '../nodes';
import { getNodeDefinition } from '../constants/nodes';
import type { NodeType } from '../types';

interface WorkflowPreviewProps {
  nodes: Array<{
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: {
      label: string;
      config?: Record<string, unknown>;
    };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
  progress?: string;
}

const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ nodes = [], edges = [], progress }) => {
  // Debug logging
  console.log('WorkflowPreview received:', { nodes, edges, nodesLength: nodes?.length });
  
  // Convert to ReactFlow format
  const flowNodes: Node[] = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      console.log('No nodes to render');
      return [];
    }
    return nodes.map(node => {
      const definition = getNodeDefinition(node.type);
      return {
        id: node.id,
        type: node.type,
        position: node.position || { x: 0, y: 0 },
        data: {
          label: node.data?.label || node.id,
          nodeType: node.type,
          config: node.data?.config || {},
          color: definition?.color || '#64748b',
          icon: definition?.icon || 'Zap',
        },
      };
    });
  }, [nodes]);

  const flowEdges: Edge[] = useMemo(() => {
    if (!edges || edges.length === 0) {
      return [];
    }
    return edges.map(edge => ({
      id: edge.id || `edge-${edge.source}-${edge.target}`,
      source: edge.source,
      sourceHandle: edge.sourceHandle,
      target: edge.target,
      targetHandle: edge.targetHandle,
      animated: true,
      style: { stroke: '#64748b', strokeWidth: 2 },
    }));
  }, [edges]);

  return (
    <div className="h-full w-full bg-white border-l border-slate-300/50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-300/50 bg-white flex items-center justify-between">
        <div>
          <h3 className="text-xs font-medium text-slate-900 uppercase tracking-tight">Workflow Preview</h3>
          {progress && (
            <p className="text-[10px] text-slate-500 mt-1">{progress}</p>
          )}
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          {nodes.length} node{nodes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative min-h-0">
        {flowNodes.length > 0 ? (
          <ReactFlowProvider>
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={true}
              zoomOnScroll={true}
              zoomOnPinch={true}
            >
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              <MiniMap
                nodeColor={(node) => {
                  const nodeData = node.data as { color?: string };
                  return nodeData.color || '#64748b';
                }}
                maskColor="rgba(0, 0, 0, 0.1)"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              />
            </ReactFlow>
          </ReactFlowProvider>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
            Waiting for workflow data...
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowPreview;


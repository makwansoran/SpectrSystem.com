/**
 * Canvas Component
 * Light theme - workflow editor
 */

import React, { useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  type ReactFlowInstance,
  type Connection,
  type NodeChange,
  type EdgeChange,
  ConnectionLineType,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MousePointer2 } from 'lucide-react';

import { useWorkflowStore } from '../stores/workflowStore';
import { nodeTypes } from '../nodes';
import type { NodeType, CustomNodeData } from '../types';

const Canvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
    setSelectedEdge,
    deleteSelected,
    pushToHistory,
  } = useWorkflowStore();

  const handleNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNode({
      id: node.id,
      type: node.data.nodeType as NodeType,
      data: node.data as CustomNodeData,
    });
  }, [setSelectedNode]);

  const handleEdgeClick = useCallback((_: React.MouseEvent, edge: any) => {
    setSelectedEdge(edge.id);
  }, [setSelectedEdge]);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  // Keyboard shortcuts for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't delete if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type || !reactFlowInstance || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      await addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (document.activeElement?.tagName !== 'INPUT' && 
            document.activeElement?.tagName !== 'TEXTAREA') {
          deleteSelected();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const hasSignificantChange = changes.some(
        (c) => c.type === 'position' || c.type === 'remove'
      );
      onNodesChange(changes);
      if (hasSignificantChange) {
        const positionChanges = changes.filter(c => c.type === 'position' && !('dragging' in c && c.dragging));
        if (positionChanges.length > 0) pushToHistory();
      }
    },
    [onNodesChange, pushToHistory]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => onEdgesChange(changes),
    [onEdgesChange]
  );

  const handleConnect = useCallback(
    (connection: Connection) => onConnect(connection),
    [onConnect]
  );

  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#d1d5da', strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d1d5da', width: 18, height: 18 },
  }), []);

  const minimapNodeColor = useCallback(() => '#8b949e', []);

  const isEmpty = nodes.length === 0;

  // Set initial zoom when canvas loads with nodes
  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      // Small delay to ensure nodes are rendered
      setTimeout(() => {
        reactFlowInstance.fitView({ 
          padding: 0.3, 
          minZoom: 0.4,
          maxZoom: 1 
        });
      }, 100);
    }
  }, [reactFlowInstance, nodes.length]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        onDrop={onDrop}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: '#0f172a', strokeWidth: 2.5 }}
        fitView={isEmpty}
        fitViewOptions={{ padding: 0.3, minZoom: 0.4, maxZoom: 1 }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid
        snapGrid={[20, 20]}
        deleteKeyCode={['Delete', 'Backspace']}
        proOptions={{ hideAttribution: true }}
        className="!bg-white"
      >
        {/* Grid background */}
        <Background
          variant={BackgroundVariant.Lines}
          gap={20}
          color="#cbd5e1"
          lineWidth={0.5}
        />

        <Controls
          className="!bg-transparent !border-none !shadow-none"
          showZoom
          showFitView
          showInteractive={false}
        />

        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor="rgba(255, 255, 255, 0.9)"
          className="!bg-white !border-slate-300/50"
          pannable
          zoomable
        />

        {isEmpty && (
          <Panel position="top-center">
            <div className="flex flex-col items-center gap-3 px-6 py-5 mt-24 bg-white/80 backdrop-blur-md border border-slate-300/50 rounded-lg shadow-lg">
              <div className="w-12 h-12 border border-slate-300/50 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <MousePointer2 className="w-6 h-6 text-slate-900" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-slate-900 tracking-tight uppercase">Drag nodes here</p>
                <p className="text-xs text-slate-600 mt-1 font-mono">Start with a trigger</p>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default Canvas;

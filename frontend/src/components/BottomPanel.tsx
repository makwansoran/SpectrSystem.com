/**
 * Bottom Panel Component
 * Light theme - execution logs
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  GripVertical,
  X,
  Plus,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';
import clsx from 'clsx';
import { useWorkflowStore } from '../stores/workflowStore';
import type { NodeExecutionResult } from '../types';

const BottomPanel: React.FC = () => {
  const {
    bottomPanelOpen,
    setBottomPanelOpen,
    currentExecution,
    bottomPanelHeight,
    setBottomPanelHeight,
    openProjections,
    activeProjectionIndex,
    addProjection,
    removeProjection,
    setActiveProjection,
    executions,
  } = useWorkflowStore();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the active projection
  const activeProjection = activeProjectionIndex >= 0 && activeProjectionIndex < openProjections.length
    ? openProjections[activeProjectionIndex]
    : null;

  // Use active projection or fallback to current execution
  const displayExecution = activeProjection || currentExecution;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newHeight = window.innerHeight - e.clientY;
      setBottomPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, setBottomPanelHeight]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAddDropdown(false);
      }
    };
    if (showAddDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddDropdown]);

  return (
    <div className="relative">
      {/* Toggle */}
      <button
        onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
        className={clsx(
          'w-full flex items-center justify-center gap-2 py-2',
          'bg-white border-t border-slate-300/50',
          'text-xs font-medium text-slate-900 uppercase tracking-wide',
          'transition-all hover:bg-slate-100/50'
        )}
      >
        {bottomPanelOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        <span>Projections</span>
        {displayExecution && <StatusBadge status={displayExecution.status} />}
        {openProjections.length > 0 && (
          <span className="text-xs font-medium bg-slate-100/50 text-slate-900 px-2 py-0.5 rounded-lg border border-slate-300/50 uppercase tracking-tight">
            {openProjections.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {bottomPanelOpen && (
        <div 
          className="bg-white border-t border-slate-300/50 flex flex-col shadow-lg"
          style={{ height: `${bottomPanelHeight}px` }}
        >
          {/* Resize Handle */}
          <div
            ref={resizeRef}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            className="h-1.5 bg-slate-300/50 hover:bg-slate-900 cursor-row-resize transition-colors flex items-center justify-center group"
          >
            <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-300/50 bg-white px-2 overflow-x-auto">
            {openProjections.map((projection, index) => (
              <button
                key={projection.id}
                onClick={() => setActiveProjection(index)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-all relative group uppercase tracking-tight',
                  activeProjectionIndex === index
                    ? 'bg-white text-slate-900 border-t-2 border-l border-r border-slate-300/50 border-t-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                )}
              >
                <StatusIcon status={projection.status} />
                <span className="whitespace-nowrap">
                  {projection.name || `Execution ${index + 1}`}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProjection(index);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 hover:bg-red-50 rounded-lg transition-opacity"
                >
                  <X className="w-3 h-3 text-red-600" />
                </button>
              </button>
            ))}
            {/* Add Projection Button with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowAddDropdown(!showAddDropdown)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-all uppercase tracking-tight"
                title="Add new projection"
              >
                <Plus className="w-3.5 h-3.5" />
                {executions.length > 0 && <ChevronDownIcon className="w-3.5 h-3.5" />}
              </button>

              {showAddDropdown && (
                <div className="absolute bottom-full left-0 mb-1.5 w-64 bg-white border border-slate-300/50 z-50 max-h-80 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs font-medium text-slate-900 uppercase tracking-wide px-2 py-1.5 mb-1">Available Executions</div>
                    {executions.length > 0 ? (
                      executions
                        .filter(exec => !openProjections.find(p => p.id === exec.id))
                        .map((execution) => (
                          <button
                            key={execution.id}
                            onClick={() => {
                              addProjection(execution);
                              setShowAddDropdown(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-left hover:bg-slate-100/50 transition-all"
                          >
                            <StatusIcon status={execution.status} />
                            <div className="flex-1 min-w-0">
                              <div className="truncate font-medium text-slate-900">
                                {execution.workflowName || 'Execution'}
                              </div>
                              <div className="text-slate-600 text-[10px] font-mono">
                                {new Date(execution.startTime).toLocaleString()}
                              </div>
                            </div>
                          </button>
                        ))
                    ) : (
                      <div className="px-2 py-4 text-xs text-slate-500 text-center font-mono">
                        No executions available
                      </div>
                    )}
                    {executions.filter(exec => !openProjections.find(p => p.id === exec.id)).length === 0 && executions.length > 0 && (
                      <div className="px-2 py-4 text-xs text-slate-500 text-center font-mono">
                        All executions are already open
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Node list */}
            <div className="w-48 border-r border-slate-300/50 overflow-y-auto bg-white">
            {displayExecution?.nodeResults.map((result) => (
              <button
                key={result.nodeId}
                onClick={() => setSelectedNodeId(result.nodeId)}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs font-medium',
                  'transition-all border-l-2 border-transparent uppercase tracking-tight',
                  selectedNodeId === result.nodeId
                    ? 'bg-slate-100/50 text-slate-900 border-l-slate-900'
                    : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                )}
              >
                <StatusIcon status={result.status} />
                <span className="truncate">{result.nodeName}</span>
              </button>
            )) || (
              <div className="p-4 text-xs text-slate-500 text-center font-mono">
                No execution data
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            {selectedNodeId && displayExecution ? (
              <NodeDetail result={displayExecution.nodeResults.find(r => r.nodeId === selectedNodeId)} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                {displayExecution ? 'Select a node to view details' : 'No projection selected'}
              </div>
            )}
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { color: string; bg: string }> = {
    pending: { color: 'text-slate-600', bg: 'bg-slate-100/50' },
    running: { color: 'text-slate-900', bg: 'bg-slate-100/50' },
    success: { color: 'text-green-600', bg: 'bg-green-50' },
    failed: { color: 'text-red-600', bg: 'bg-red-50' },
  };
  return <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-lg border border-slate-300/50 uppercase tracking-tight', config[status]?.color, config[status]?.bg)}>{status}</span>;
};

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'running':
      return <Loader2 className="w-4 h-4 text-slate-900 animate-spin" />;
    case 'success':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-slate-600" />;
  }
};

const NodeDetail: React.FC<{ result?: NodeExecutionResult }> = ({ result }) => {
  if (!result) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-300/50">
        <span className="text-xs font-medium text-slate-900 uppercase tracking-wide">{result.nodeName}</span>
        <StatusBadge status={result.status} />
      </div>

      {result.duration !== undefined && (
        <div className="text-xs font-medium text-slate-600 uppercase tracking-tight">Duration: <span className="font-semibold text-slate-900 font-mono">{result.duration}ms</span></div>
      )}

      {result.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-600 font-mono">
          {result.error}
        </div>
      )}

      {result.output && (
        <div>
          <div className="text-xs font-medium text-slate-600 mb-2 uppercase tracking-tight">Output</div>
          <pre className="text-xs text-slate-900 bg-white p-3 overflow-auto max-h-32 font-mono border border-slate-300/50">
            {JSON.stringify(result.output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default BottomPanel;

/**
 * SPECTR SYSTEM Workflow Editor
 * Light theme - Main workflow editing interface
 */

import React, { useEffect, useState, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Zap,
  AlertCircle,
  RefreshCw,
  X,
  BarChart3,
  Plus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import clsx from 'clsx';

import { Canvas, TopNav, BottomPanel, NodePalette } from './components';
import NodeConfigurationModal from './components/NodeConfigurationModal';
import { useWorkflowStore } from './stores/workflowStore';
import * as api from './services/api';

interface WorkflowTab {
  id: string;
  name: string; // Tab name - completely independent from workflow name
  type: 'workflow' | 'dashboard';
  workflowId: string; // Links tab to workflow, but names are independent
}

const WorkflowEditor: React.FC = () => {
  const { workflowId: urlWorkflowId } = useParams();
  const { workflowId, isLoading, fetchWorkflows, loadWorkflow, createNewWorkflow } = useWorkflowStore();
  const [isApiHealthy, setIsApiHealthy] = useState<boolean | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);
  
  // Tab state - completely independent from workflow state
  const [openTabs, setOpenTabs] = useState<WorkflowTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [nodePaletteOpen, setNodePaletteOpen] = useState(true);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      setIsCheckingHealth(true);
      const healthy = await api.checkHealth();
      setIsApiHealthy(healthy);
      setIsCheckingHealth(false);
      
      if (healthy) {
        fetchWorkflows();
        
        // If we have a workflow ID in the URL, create tabs and load it
        if (urlWorkflowId) {
          // Create tabs for URL workflow - user-initiated, not automatic
          const workflowTab: WorkflowTab = {
            id: `${urlWorkflowId}-workflow`,
            name: '', // User can rename independently
            type: 'workflow',
            workflowId: urlWorkflowId,
          };
          const dashboardTab: WorkflowTab = {
            id: `${urlWorkflowId}-dashboard`,
            name: 'Untitled Dashboard',
            type: 'dashboard',
            workflowId: urlWorkflowId,
          };
          setOpenTabs([workflowTab, dashboardTab]);
          setActiveTabId(workflowTab.id);
          loadWorkflow(urlWorkflowId);
        }
      }
    };

    checkHealth();
  }, [fetchWorkflows, loadWorkflow, urlWorkflowId]);

  // Tabs are completely user-controlled - NO automatic creation based on workflow state
  // Only initialize with empty tabs on first load if no tabs exist
  useEffect(() => {
    if (!urlWorkflowId && openTabs.length === 0) {
      const tempId = `new-${Date.now()}`;
      const workflowTab: WorkflowTab = {
        id: `${tempId}-workflow`,
        name: '',
        type: 'workflow',
        workflowId: tempId,
      };
      const dashboardTab: WorkflowTab = {
        id: `${tempId}-dashboard`,
        name: 'Untitled Dashboard',
        type: 'dashboard',
        workflowId: tempId,
      };
      setOpenTabs([workflowTab, dashboardTab]);
      setActiveTabId(workflowTab.id);
    }
  }, [urlWorkflowId]); // Only run once on mount if no URL workflow

  // Handle tab click
  const handleTabClick = async (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (!tab) return;

    // Set active tab first
    setActiveTabId(tabId);

    if (tab.type === 'workflow') {
      if (tab.workflowId.startsWith('new-')) {
        // Don't create workflow yet - only create when user actually needs it
        // (e.g., when adding nodes or saving)
        // This prevents automatic workflow name generation
        // The workflow will be created lazily when needed
      } else {
        // Load existing workflow - this will set workflowName in store
        // But tab name remains completely independent
        await loadWorkflow(tab.workflowId);
      }
    }
    // Dashboard tabs don't load workflows - they're purely for viewing
  };

  // Handle tab rename - updates tab name and syncs dashboard tab name
  const handleTabRename = (tabId: string, newName: string) => {
    setOpenTabs(prev => {
      const tab = prev.find(t => t.id === tabId);
      if (!tab) return prev;
      
      return prev.map(t => {
        if (t.id === tabId) {
          // Update the tab being renamed
          return { ...t, name: newName };
        }
        
        // If renaming a workflow tab, also update its dashboard tab
        if (tab.type === 'workflow' && t.workflowId === tab.workflowId && t.type === 'dashboard') {
          return { ...t, name: `${newName} Dashboard` };
        }
        
        return t;
      });
    });
    // Workflow name in store is NEVER updated - only tab names sync
  };

  // Handle tab name edit
  const handleTabNameEdit = (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (tab) {
      setEditingTabId(tabId);
      setEditingName(tab.name || '');
    }
  };

  const handleTabNameSubmit = (tabId: string) => {
    if (editingName.trim()) {
      handleTabRename(tabId, editingName.trim());
    }
    setEditingTabId(null);
    setEditingName('');
  };

  const handleTabNameCancel = () => {
    setEditingTabId(null);
    setEditingName('');
  };

  // Handle tab close
  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const tab = openTabs.find(t => t.id === tabId);
    if (!tab) return;

    setOpenTabs(prev => {
      let newTabs = prev.filter(t => t.id !== tabId);

      // If closing workflow tab, also close dashboard tab
      if (tab.type === 'workflow') {
        newTabs = newTabs.filter(t => !(t.workflowId === tab.workflowId && t.type === 'dashboard'));
      } else if (tab.type === 'dashboard') {
        // If closing dashboard tab, also close workflow tab
        newTabs = newTabs.filter(t => !(t.workflowId === tab.workflowId && t.type === 'workflow'));
      }

      // If no tabs left, create new empty tabs
      if (newTabs.length === 0) {
        const tempId = `new-${Date.now()}`;
        const workflowTab: WorkflowTab = {
          id: `${tempId}-workflow`,
          name: '',
          type: 'workflow',
          workflowId: tempId,
        };
        const dashboardTab: WorkflowTab = {
          id: `${tempId}-dashboard`,
          name: 'Untitled Dashboard',
          type: 'dashboard',
          workflowId: tempId,
        };
        setActiveTabId(workflowTab.id);
        return [workflowTab, dashboardTab];
      }

      // Switch to another tab if closing active tab
      if (tabId === activeTabId) {
        const nextTab = newTabs.find(t => t.type === 'workflow') || newTabs[0];
        if (nextTab) {
          setActiveTabId(nextTab.id);
          if (nextTab.type === 'workflow' && !nextTab.workflowId.startsWith('new-')) {
            loadWorkflow(nextTab.workflowId);
          }
        }
      }

      return newTabs;
    });
  };

  // Create new workflow via + button
  // Only creates tabs - workflow is created when user clicks on the workflow tab
  const handleCreateNewWorkflow = () => {
    const tempId = `new-${Date.now()}`;
    const workflowTab: WorkflowTab = {
      id: `${tempId}-workflow`,
      name: '', // Independent name - user can rename
      type: 'workflow',
      workflowId: tempId,
    };
    const dashboardTab: WorkflowTab = {
      id: `${tempId}-dashboard`,
      name: 'Untitled Dashboard', // Independent name
      type: 'dashboard',
      workflowId: tempId,
    };
    
    // Only create tabs - do NOT create workflow yet
    // Workflow will be created when user clicks on the workflow tab
    // This prevents workflow name from being set automatically
    setOpenTabs(prev => [...prev, workflowTab, dashboardTab]);
    setActiveTabId(workflowTab.id);
  };

  // Retry health check
  const retryHealthCheck = async () => {
    setIsCheckingHealth(true);
    const healthy = await api.checkHealth();
    setIsApiHealthy(healthy);
    setIsCheckingHealth(false);
    
    if (healthy) {
      fetchWorkflows();
    }
  };

  // Loading state
  if (isCheckingHealth) {
    return <LoadingScreen message="Connecting to SPECTR SYSTEM..." />;
  }

  // API not available
  if (!isApiHealthy) {
    return (
      <ErrorScreen
        title="Unable to connect to server"
        message="The SPECTR SYSTEM backend server is not running. Please start the server and try again."
        onRetry={retryHealthCheck}
      />
    );
  }

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen bg-white overflow-hidden">
        {/* Top Navigation */}
        <TopNav />

        {/* Tabs Bar */}
        <div className="flex items-center gap-0.5 px-2 h-9 bg-white border-b border-slate-300/50 overflow-x-auto">
          {openTabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => {
                if (editingTabId !== tab.id) {
                  handleTabClick(tab.id);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, tabId: tab.id });
              }}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-t-lg transition-all cursor-pointer group min-w-[120px] max-w-[240px]',
                activeTabId === tab.id
                  ? 'bg-white text-slate-900 border-t-2 border-l border-r border-slate-300/50 border-t-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              )}
            >
              {editingTabId === tab.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleTabNameSubmit(tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTabNameSubmit(tab.id);
                    } else if (e.key === 'Escape') {
                      handleTabNameCancel();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-1 py-0.5 text-xs bg-white border border-slate-900 rounded focus:outline-none min-w-0"
                  autoFocus
                />
              ) : (
                <span className="truncate flex-1">
                  {tab.name || 'Untitled'}
                </span>
              )}
              <button
                onClick={(e) => handleTabClose(e, tab.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-200 rounded transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Context Menu */}
          {contextMenu && (
            <div
              ref={contextMenuRef}
              className="fixed bg-white border border-slate-300/50 rounded-lg shadow-lg z-50 py-1 min-w-[120px]"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  handleTabNameEdit(contextMenu.tabId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-900 hover:bg-slate-100/50 transition-colors uppercase tracking-tight"
              >
                Rename
              </button>
            </div>
          )}

          {/* Plus Button */}
          <button
            onClick={handleCreateNewWorkflow}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100/50 transition-all text-slate-600 hover:text-slate-900 ml-1"
            title="New Workflow"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {(() => {
            const activeTab = openTabs.find(t => t.id === activeTabId);
            
            if (activeTab?.type === 'dashboard') {
              return <WorkflowDashboard workflowId={activeTab.workflowId} />;
            }
            
            return (
              <>
                <div className="relative">
                  <NodePalette isOpen={nodePaletteOpen} onToggle={() => setNodePaletteOpen(!nodePaletteOpen)} />
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                  {isLoading ? (
                    <LoadingScreen message="Loading workflow..." />
                  ) : (
                    <Canvas />
                  )}
                  <BottomPanel />
                </div>
                <NodeConfigurationModal />
              </>
            );
          })()}
        </div>
      </div>
    </ReactFlowProvider>
  );
};

// Workflow Dashboard Component
const WorkflowDashboard: React.FC<{ workflowId: string }> = ({ workflowId }) => {
  const { executions, fetchExecutions } = useWorkflowStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExecutions = async () => {
      setLoading(true);
      if (!workflowId.startsWith('new-')) {
        await fetchExecutions();
      }
      setLoading(false);
    };
    loadExecutions();
  }, [workflowId, fetchExecutions]);

  const workflowExecutions = executions.filter(e => e.workflowId === workflowId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-sm font-medium text-slate-900 mb-6 uppercase tracking-tight">Workflow Dashboard</h1>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : workflowExecutions.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-xs text-slate-600 font-mono">No executions yet</p>
              <p className="text-[10px] text-slate-400 font-mono mt-2">Run the workflow to see results here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflowExecutions.map((execution) => (
                <div
                  key={execution.id}
                  className="bg-white border border-slate-300/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {execution.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {execution.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                      {execution.status === 'running' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                      <span className={clsx(
                        "text-xs font-medium uppercase tracking-tight",
                        execution.status === 'success' && "text-emerald-700",
                        execution.status === 'failed' && "text-red-700",
                        execution.status === 'running' && "text-blue-700",
                      )}>
                        {execution.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(execution.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {execution.nodeResults && (
                    <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-300/50">
                      <pre className="text-[10px] font-mono text-slate-700 overflow-x-auto">
                        {JSON.stringify(execution.nodeResults, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {execution.error && (
                    <div className="mt-3 p-3 bg-red-50 rounded border border-red-300/50">
                      <p className="text-xs text-red-700 font-mono">{execution.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading screen component
interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center h-full bg-white">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="relative">
        <div className="w-16 h-16 border border-slate-300/50 bg-white flex items-center justify-center">
          <Zap className="w-8 h-8 text-slate-900" />
        </div>
        <Loader2 className="absolute -bottom-1 -right-1 w-6 h-6 text-slate-900 animate-spin" />
      </div>
      <p className="text-xs font-medium text-slate-900 uppercase tracking-wide font-mono">{message}</p>
    </motion.div>
  </div>
);

// Error screen component
interface ErrorScreenProps {
  title: string;
  message: string;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ title, message, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-white">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 max-w-md text-center px-4"
    >
      <div className="w-20 h-20 border border-slate-300/50 bg-white flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-slate-900" />
      </div>
      <div>
        <h1 className="text-sm font-medium text-slate-900 mb-2 uppercase tracking-wide">{title}</h1>
        <p className="text-xs text-slate-600 font-mono">{message}</p>
      </div>
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium',
            'bg-slate-900 text-white border border-slate-900',
            'hover:bg-slate-800 transition-colors'
          )}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
        <p className="text-xs text-slate-500 font-mono">
          Make sure the backend is running on port 3001
        </p>
      </div>
    </motion.div>
  </div>
);

export default WorkflowEditor;

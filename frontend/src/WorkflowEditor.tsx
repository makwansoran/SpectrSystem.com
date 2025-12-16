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
  LayoutDashboard,
  PenTool,
  ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';

import { Canvas, TopNav, BottomPanel, NodePalette } from './components';
import NodeConfigurationModal from './components/NodeConfigurationModal';
import ProjectTemplateModal, { type ProjectTemplate } from './components/ProjectTemplateModal';
import DashboardDesigner, { type DashboardWidget } from './components/DashboardDesigner';
import DashboardView from './components/DashboardView';
import { useWorkflowStore } from './stores/workflowStore';
import * as api from './services/api';
import { getNodeDefinition } from './constants/nodes';

interface WorkflowTab {
  id: string;
  name: string; // Tab name - completely independent from workflow name
  type: 'workflow' | 'dashboard';
  workflowId: string; // Links tab to workflow, but names are independent
}

const WorkflowEditor: React.FC = () => {
  const { workflowId: urlWorkflowId } = useParams();
  const { workflowId, isLoading, fetchWorkflows, loadWorkflow, createNewWorkflow, setWorkflowName } = useWorkflowStore();
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
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [hasShownTemplateModal, setHasShownTemplateModal] = useState(false);
  const tabsInitializedRef = useRef(false);
  const workflowLoadingRef = useRef<string | null>(null);

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

  // Reset workflow loading ref when URL changes
  useEffect(() => {
    workflowLoadingRef.current = null;
  }, [urlWorkflowId]);

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
        // Prevent duplicate loading
        if (urlWorkflowId && workflowLoadingRef.current !== urlWorkflowId) {
          workflowLoadingRef.current = urlWorkflowId;
          
          // Check if tabs already exist for this workflow
          setOpenTabs(prev => {
            const existingWorkflowTab = prev.find(t => t.workflowId === urlWorkflowId && t.type === 'workflow');
            if (existingWorkflowTab) {
              // Tabs already exist, just activate the workflow tab
              setActiveTabId(existingWorkflowTab.id);
              return prev;
            }
            
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
            setActiveTabId(workflowTab.id);
            loadWorkflow(urlWorkflowId);
            return [workflowTab, dashboardTab];
          });
        }
      }
    };

    checkHealth();
  }, [fetchWorkflows, loadWorkflow, urlWorkflowId]);

  // Show template modal on first visit to /app without workflowId
  useEffect(() => {
    if (!urlWorkflowId && !hasShownTemplateModal && isApiHealthy && !isCheckingHealth) {
      setShowTemplateModal(true);
      setHasShownTemplateModal(true);
    }
  }, [urlWorkflowId, hasShownTemplateModal, isApiHealthy, isCheckingHealth]);

  // Tabs are completely user-controlled - NO automatic creation based on workflow state
  // Only initialize with empty tabs on first load if no tabs exist
  useEffect(() => {
    if (!urlWorkflowId && openTabs.length === 0 && !showTemplateModal && !tabsInitializedRef.current) {
      tabsInitializedRef.current = true;
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
  }, [urlWorkflowId, showTemplateModal, openTabs.length]); // Only run once on mount if no URL workflow

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
        // Prevent duplicate loading - only load if not already loaded
        const { workflowId: currentWorkflowId, isLoading } = useWorkflowStore.getState();
        if (currentWorkflowId !== tab.workflowId && !isLoading) {
          // Load existing workflow - this will set workflowName in store
          // But tab name remains completely independent
          await loadWorkflow(tab.workflowId);
        }
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
    
    // Check if tabs with this workflowId already exist (prevent duplicates)
    setOpenTabs(prev => {
      const existingTab = prev.find(t => t.workflowId === tempId);
      if (existingTab) {
        // Tabs already exist, just activate the workflow tab
        setActiveTabId(existingTab.id);
        return prev;
      }
      
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
      setActiveTabId(workflowTab.id);
      return [...prev, workflowTab, dashboardTab];
    });
  };

  // Handle template selection
  const handleTemplateSelect = async (template: ProjectTemplate, projectName: string) => {
    // Prevent duplicate creation
    const { isLoading, isSaving } = useWorkflowStore.getState();
    if (isLoading || isSaving) {
      console.warn('Workflow creation already in progress, skipping duplicate request');
      return;
    }
    
    try {
      // Generate unique IDs for template nodes
      const nodeIdMap = new Map<string, string>();
      template.nodes.forEach((node, index) => {
        const newId = `node_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
        nodeIdMap.set(node.id, newId);
      });

      // Create workflow with template nodes
      const workflowNodes = template.nodes.map(node => ({
        id: nodeIdMap.get(node.id) || node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label,
          config: node.data.config || {},
        },
      }));

      const workflowEdges = template.edges.map((edge, index) => ({
        id: `edge_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        source: nodeIdMap.get(edge.source) || edge.source,
        sourceHandle: edge.sourceHandle,
        target: nodeIdMap.get(edge.target) || edge.target,
        targetHandle: edge.targetHandle,
      }));

      const workflow = await api.createWorkflow({
        name: projectName,
        description: template.description,
        nodes: workflowNodes,
        edges: workflowEdges,
      });

      // Convert to React Flow format and enrich with visual properties
      const flowNodes: FlowNode[] = workflowNodes.map(node => {
        const definition = getNodeDefinition(node.type);
        return {
          id: node.id,
          type: node.type,
          position: node.position,
          data: {
            label: node.data.label,
            nodeType: node.type,
            config: node.data.config || {},
            color: definition?.color || '#64748b',
            icon: definition?.icon || 'Zap',
          },
        } as FlowNode;
      });

      const flowEdges = workflowEdges.map(edge => ({
        id: edge.id,
        source: edge.source,
        sourceHandle: edge.sourceHandle,
        target: edge.target,
        targetHandle: edge.targetHandle,
        animated: true,
        style: { stroke: '#64748b' },
      }));

      // Create tabs for the new workflow - check for duplicates first
      const workflowTab: WorkflowTab = {
        id: `${workflow.id}-workflow`,
        name: projectName,
        type: 'workflow',
        workflowId: workflow.id,
      };
      const dashboardTab: WorkflowTab = {
        id: `${workflow.id}-dashboard`,
        name: `${projectName} Dashboard`,
        type: 'dashboard',
        workflowId: workflow.id,
      };

      // Set active tab first to ensure Canvas is ready
      setActiveTabId(workflowTab.id);
      setOpenTabs(prev => {
        // Check if tabs for this workflow already exist
        const existingWorkflowTab = prev.find(t => t.workflowId === workflow.id && t.type === 'workflow');
        if (existingWorkflowTab) {
          // Tabs already exist, just activate the workflow tab
          return prev;
        }
        return [...prev, workflowTab, dashboardTab];
      });

      // Update store AFTER tabs are set to ensure Canvas is ready
      setWorkflowName(projectName);
      useWorkflowStore.setState({
        currentWorkflow: workflow,
        workflowId: workflow.id,
        workflowName: projectName,
        nodes: flowNodes,
        edges: flowEdges,
        hasUnsavedChanges: false,
        isLoading: false,
        history: [{ nodes: flowNodes, edges: flowEdges }],
        historyIndex: 0,
      });

      // Close modal
      setShowTemplateModal(false);
      
      // Debug logging
      console.log('Template nodes loaded:', {
        nodeCount: flowNodes.length,
        edgeCount: flowEdges.length,
        workflowId: workflow.id,
        nodes: flowNodes.map(n => ({ id: n.id, type: n.type, label: n.data.label })),
      });
      
      // Refresh workflows list
      fetchWorkflows();
    } catch (error) {
      console.error('Failed to create workflow from template:', error);
      alert('Failed to create workflow. Please try again.');
    }
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

        {/* Project Template Modal */}
        <ProjectTemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelectTemplate={handleTemplateSelect}
        />
      </div>
    </ReactFlowProvider>
  );
};

// Workflow Dashboard Component
const WorkflowDashboard: React.FC<{ workflowId: string }> = ({ workflowId }) => {
  const { executions, fetchExecutions, nodes, updateNodeData } = useWorkflowStore();
  const [loading, setLoading] = useState(true);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(null);
  const [dashboardMode, setDashboardMode] = useState<'view' | 'design'>('view');

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
  
  // Filter dashboard nodes from the workflow
  const dashboardNodes = nodes.filter(node => node.data.nodeType === 'dashboard');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-sm font-medium text-slate-900 mb-6 uppercase tracking-tight">Workflow Dashboard</h1>
          
          {/* Available Dashboards Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-slate-700 uppercase tracking-tight">Available Dashboards</h2>
              <span className="text-[10px] text-slate-400 font-mono">
                {dashboardNodes.length} {dashboardNodes.length === 1 ? 'dashboard' : 'dashboards'}
              </span>
            </div>
            {dashboardNodes.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-lg">
                <LayoutDashboard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-xs text-slate-600 font-mono mb-1">No dashboard nodes found</p>
                <p className="text-[10px] text-slate-400 font-mono">Add a Dashboard node to your workflow to design custom dashboards</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardNodes.map((node, index) => {
                  const dashboardName = node.data.label || `Dashboard ${index + 1}`;
                  const hasConfig = node.data.config && Object.keys(node.data.config).length > 0;
                  
                  return (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="bg-white border border-slate-300/50 rounded-lg p-4 hover:border-slate-900 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => {
                        setSelectedDashboardId(node.id);
                        setDashboardMode('view'); // Open in view mode by default
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0">
                            <LayoutDashboard className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-semibold text-slate-900 truncate mb-0.5">
                              {dashboardName}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-mono">
                              Node ID: {node.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
                        <span className={clsx(
                          "text-[10px] font-medium px-2 py-1 rounded",
                          hasConfig 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : "bg-slate-50 text-slate-600 border border-slate-200"
                        )}>
                          {hasConfig ? 'Configured' : 'Ready to Design'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDashboardId(node.id);
                            setDashboardMode('design'); // Open in design mode when clicking Design button
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-medium text-slate-700 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-50 transition-colors group-hover:text-purple-600"
                        >
                          <PenTool className="w-3 h-3" />
                          Design
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Executions Section */}
          <div>
            <h2 className="text-xs font-medium text-slate-700 mb-3 uppercase tracking-tight">Executions</h2>
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
      
      {/* Dashboard Designer Modal */}
      <AnimatePresence>
        {selectedDashboardId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDashboardId(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 z-50 flex items-center justify-center p-2"
            >
              <div className="bg-white border border-slate-300/50 rounded-lg shadow-xl w-full h-full max-w-[98vw] max-h-[98vh] overflow-hidden flex flex-col">
                {(() => {
                  const dashboardNode = dashboardNodes.find(n => n.id === selectedDashboardId);
                  if (!dashboardNode) return null;
                  
                  if (dashboardMode === 'view') {
                    return (
                      <DashboardView
                        dashboardNode={dashboardNode}
                        workflowNodes={nodes}
                        onEdit={() => setDashboardMode('design')}
                        onClose={() => {
                          setSelectedDashboardId(null);
                          setDashboardMode('view');
                        }}
                      />
                    );
                  }
                  
                  return (
                    <DashboardDesigner
                      dashboardNode={dashboardNode}
                      workflowNodes={nodes}
                      onSave={(widgets: DashboardWidget[]) => {
                        // Save widgets to dashboard node config
                        updateNodeData(selectedDashboardId, {
                          config: {
                            ...dashboardNode.data.config,
                            widgets,
                          },
                        });
                        // Switch back to view mode after saving
                        setDashboardMode('view');
                      }}
                      onClose={() => {
                        setSelectedDashboardId(null);
                        setDashboardMode('view');
                      }}
                      onView={() => setDashboardMode('view')}
                    />
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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

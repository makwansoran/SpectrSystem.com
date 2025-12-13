/**
 * Workflow Store
 * Zustand store for managing workflow state
 */

import { create } from 'zustand';
import { 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from 'reactflow';
import type { 
  FlowNode, 
  FlowEdge, 
  Workflow, 
  WorkflowListItem,
  WorkflowExecution,
  CustomNodeData,
  NodeType,
  SelectedNode,
  PanelView
} from '../types';
import * as api from '../services/api';
import { NODE_DEFINITIONS } from '../constants/nodes';

interface WorkflowState {
  // Workflow data
  workflows: WorkflowListItem[];
  currentWorkflow: Workflow | null;
  workflowId: string | null;
  workflowName: string;
  
  // React Flow state
  nodes: FlowNode[];
  edges: FlowEdge[];
  
  // Selection state
  selectedNode: SelectedNode | null;
  selectedEdge: string | null;
  
  // UI state
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  bottomPanelOpen: boolean;
  bottomPanelView: PanelView;
  bottomPanelHeight: number;
  
  // Execution state
  isExecuting: boolean;
  currentExecution: WorkflowExecution | null;
  executions: WorkflowExecution[];
  openProjections: WorkflowExecution[]; // Multiple projection tabs
  activeProjectionIndex: number; // Index of currently active tab
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  
  // Actions
  fetchWorkflows: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  createNewWorkflow: (name?: string) => Promise<void>;
  saveWorkflow: () => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  
  // Node operations
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => Promise<void>;
  updateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => void;
  deleteSelected: () => void;
  duplicateNode: (nodeId: string) => void;
  
  // Selection
  setSelectedNode: (node: SelectedNode | null) => void;
  setSelectedEdge: (edgeId: string | null) => void;
  
  // UI
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setBottomPanelOpen: (open: boolean) => void;
  setBottomPanelView: (view: PanelView) => void;
  setBottomPanelHeight: (height: number) => void;
  setWorkflowName: (name: string) => void;
  
  // Execution
  executeWorkflow: () => Promise<void>;
  fetchExecutions: () => Promise<void>;
  setCurrentExecution: (execution: WorkflowExecution | null) => void;
  addProjection: (execution: WorkflowExecution) => void;
  removeProjection: (index: number) => void;
  setActiveProjection: (index: number) => void;
  
  // Undo/Redo (simplified)
  history: { nodes: FlowNode[]; edges: FlowEdge[] }[];
  historyIndex: number;
  pushToHistory: () => void;
  undo: () => void;
  redo: () => void;
}

// Generate unique ID
function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create the store
export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial state
  workflows: [],
  currentWorkflow: null,
  workflowId: null,
  workflowName: 'Untitled Workflow',
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  leftPanelOpen: true,
  rightPanelOpen: false,
  bottomPanelOpen: false,
  bottomPanelView: 'none',
  bottomPanelHeight: 208, // Default height: h-52 = 208px
  isExecuting: false,
  currentExecution: null,
  executions: [],
  openProjections: [],
  activeProjectionIndex: -1,
  isLoading: false,
  isSaving: false,
  hasUnsavedChanges: false,
  history: [],
  historyIndex: -1,

  // Fetch all workflows
  fetchWorkflows: async () => {
    try {
      const workflows = await api.getWorkflows();
      set({ workflows });
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
  },

  // Load a workflow by ID
  loadWorkflow: async (id: string) => {
    set({ isLoading: true });
    try {
      const workflow = await api.getWorkflow(id);
      
      // Convert workflow nodes to React Flow nodes
      const nodes: FlowNode[] = workflow.nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label,
          nodeType: node.type as NodeType,
          config: node.data.config,
        },
      }));

      // Convert workflow edges to React Flow edges
      const edges: FlowEdge[] = workflow.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        sourceHandle: edge.sourceHandle,
        target: edge.target,
        targetHandle: edge.targetHandle,
        animated: true,
        style: { stroke: '#64748b' },
      }));

      set({
        currentWorkflow: workflow,
        workflowId: workflow.id,
        workflowName: workflow.name,
        nodes,
        edges,
        hasUnsavedChanges: false,
        isLoading: false,
        history: [{ nodes, edges }],
        historyIndex: 0,
      });

      // Fetch executions
      get().fetchExecutions();
    } catch (error) {
      console.error('Failed to load workflow:', error);
      set({ isLoading: false });
    }
  },

  // Create a new workflow
  createNewWorkflow: async (name = 'Untitled Workflow') => {
    set({ isLoading: true });
    try {
      // If name is empty string, use default and auto-generate unique name
      // If name is provided (not empty), use it as-is without auto-generation
      const existingWorkflows = get().workflows;
      let uniqueName: string;
      
      if (!name || name === '') {
        // Empty name - use default and auto-generate unique name
        uniqueName = 'Untitled Workflow';
        let counter = 1;
        while (existingWorkflows.some(w => w.name === uniqueName)) {
          uniqueName = `Untitled Workflow (${counter})`;
          counter++;
        }
      } else {
        // Name provided - use it as-is (no auto-generation)
        uniqueName = name;
      }

      // Create initial trigger node
      const initialNode: FlowNode = {
        id: generateId(),
        type: 'manual-trigger',
        position: { x: 250, y: 200 },
        data: {
          label: 'Manual Trigger',
          nodeType: 'manual-trigger',
          config: {},
        },
      };

      const workflow = await api.createWorkflow({
        name: uniqueName,
        description: '',
        nodes: [{
          id: initialNode.id,
          type: 'manual-trigger',
          position: initialNode.position,
          data: {
            label: initialNode.data.label,
            config: initialNode.data.config,
          },
        }],
        edges: [],
      });

      set({
        currentWorkflow: workflow,
        workflowId: workflow.id,
        workflowName: workflow.name,
        nodes: [initialNode],
        edges: [],
        hasUnsavedChanges: false,
        isLoading: false,
        history: [{ nodes: [initialNode], edges: [] }],
        historyIndex: 0,
        executions: [],
      });

      get().fetchWorkflows();
    } catch (error) {
      console.error('Failed to create workflow:', error);
      set({ isLoading: false });
    }
  },

  // Save the current workflow
  saveWorkflow: async () => {
    let { workflowId, workflowName, nodes, edges } = get();
    
    // If workflowId is null or starts with 'new-', create workflow lazily
    // Use current workflowName if it exists, otherwise empty string (no auto-generation)
    if (!workflowId || workflowId.startsWith('new-')) {
      // Only use workflowName if it's not the default 'Untitled Workflow'
      // Otherwise use empty string to prevent auto-naming
      const nameToUse = workflowName && workflowName !== 'Untitled Workflow' 
        ? workflowName 
        : '';
      await get().createNewWorkflow(nameToUse);
      workflowId = get().workflowId;
      if (!workflowId) return;
    }

    set({ isSaving: true });
    try {
      // Convert React Flow nodes to workflow nodes
      const workflowNodes = nodes.map(node => ({
        id: node.id,
        type: node.data.nodeType,
        position: node.position,
        data: {
          label: node.data.label,
          config: node.data.config,
        },
      }));

      // Convert React Flow edges to workflow edges
      const workflowEdges = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        sourceHandle: edge.sourceHandle,
        target: edge.target,
        targetHandle: edge.targetHandle,
      }));

      await api.updateWorkflow(workflowId, {
        name: workflowName,
        nodes: workflowNodes,
        edges: workflowEdges,
      });

      set({ hasUnsavedChanges: false, isSaving: false });
      get().fetchWorkflows();
    } catch (error) {
      console.error('Failed to save workflow:', error);
      set({ isSaving: false });
    }
  },

  // Delete a workflow
  deleteWorkflow: async (id: string) => {
    try {
      await api.deleteWorkflow(id);
      const { workflowId } = get();
      
      if (workflowId === id) {
        set({
          currentWorkflow: null,
          workflowId: null,
          workflowName: 'Untitled Workflow',
          nodes: [],
          edges: [],
          executions: [],
        });
      }
      
      get().fetchWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  },

  // React Flow handlers
  onNodesChange: (changes: NodeChange[]) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      hasUnsavedChanges: true,
    }));
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      hasUnsavedChanges: true,
    }));
  },

  onConnect: (connection: Connection) => {
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          style: { stroke: '#64748b' },
        },
        state.edges
      ),
      hasUnsavedChanges: true,
    }));
    get().pushToHistory();
  },

  // Add a new node
  addNode: async (type: NodeType, position: { x: number; y: number }) => {
    const { workflowId, workflowName } = get();
    
    // If workflowId is null or starts with 'new-', create workflow lazily
    // Use current workflowName if it exists, otherwise empty string (no auto-generation)
    if (!workflowId || workflowId.startsWith('new-')) {
      // Only use workflowName if it's not the default 'Untitled Workflow'
      // Otherwise use empty string to prevent auto-naming
      const nameToUse = workflowName && workflowName !== 'Untitled Workflow' 
        ? workflowName 
        : '';
      await get().createNewWorkflow(nameToUse);
    }
    
    const definition = NODE_DEFINITIONS.find(n => n.type === type);
    if (!definition) return;

    const newNode: FlowNode = {
      id: generateId(),
      type,
      position,
      data: {
        label: definition.name,
        nodeType: type,
        config: getDefaultConfig(type),
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      hasUnsavedChanges: true,
    }));
    
    get().pushToHistory();
  },

  // Update node data
  updateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => {
    set((state) => {
      const updatedNodes = state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      );
      
      // Also update selectedNode if it's the one being edited
      const updatedSelectedNode = state.selectedNode?.id === nodeId
        ? {
            ...state.selectedNode,
            data: { ...state.selectedNode.data, ...data },
          }
        : state.selectedNode;
      
      return {
        nodes: updatedNodes,
        selectedNode: updatedSelectedNode,
        hasUnsavedChanges: true,
      };
    });
  },

  // Delete selected nodes/edges
  deleteSelected: () => {
    const { selectedNode, selectedEdge } = get();
    
    if (selectedNode) {
      set((state) => ({
        nodes: state.nodes.filter((n) => n.id !== selectedNode.id),
        edges: state.edges.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
        ),
        selectedNode: null,
        hasUnsavedChanges: true,
      }));
    }
    
    if (selectedEdge) {
      set((state) => ({
        edges: state.edges.filter((e) => e.id !== selectedEdge),
        selectedEdge: null,
        hasUnsavedChanges: true,
      }));
    }
    
    get().pushToHistory();
  },

  // Duplicate a node
  duplicateNode: (nodeId: string) => {
    const { nodes } = get();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newNode: FlowNode = {
      ...node,
      id: generateId(),
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      data: { ...node.data },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      hasUnsavedChanges: true,
    }));
    
    get().pushToHistory();
  },

  // Selection handlers
  setSelectedNode: (node: SelectedNode | null) => {
    set({ 
      selectedNode: node, 
      selectedEdge: null,
      // Don't open right panel - we use modal now
      // rightPanelOpen: node !== null,
    });
  },

  setSelectedEdge: (edgeId: string | null) => {
    set({ selectedEdge: edgeId, selectedNode: null });
  },

  // UI handlers
  setLeftPanelOpen: (open: boolean) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open: boolean) => set({ rightPanelOpen: open }),
  setBottomPanelOpen: (open: boolean) => set({ bottomPanelOpen: open }),
  setBottomPanelView: (view: PanelView) => set({ bottomPanelView: view }),
  setBottomPanelHeight: (height: number) => set({ bottomPanelHeight: Math.max(100, Math.min(800, height)) }),
  setWorkflowName: (name: string) => set({ workflowName: name, hasUnsavedChanges: true }),

  // Execute workflow
  executeWorkflow: async () => {
    const { workflowId, nodes } = get();
    if (!workflowId) return;

    set({ isExecuting: true });
    
    // Reset all node execution states
    set((state) => ({
      nodes: state.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isExecuting: false,
          executionStatus: 'pending' as const,
          executionOutput: undefined,
          executionError: undefined,
        },
      })),
      bottomPanelOpen: true,
      bottomPanelView: 'execution',
    }));

    try {
      const execution = await api.executeWorkflow(workflowId);
      
      // Update node states based on execution results
      set((state) => ({
        nodes: state.nodes.map((node) => {
          const result = execution.nodeResults.find((r) => r.nodeId === node.id);
          return {
            ...node,
            data: {
              ...node.data,
              isExecuting: false,
              executionStatus: result?.status || 'pending',
              executionOutput: result?.output,
              executionError: result?.error,
            },
          };
        }),
        currentExecution: execution,
        isExecuting: false,
      }));

      // Automatically add execution as a projection tab
      get().addProjection(execution);

      get().fetchExecutions();
    } catch (error) {
      console.error('Execution failed:', error);
      set({ isExecuting: false });
    }
  },

  // Fetch execution history
  fetchExecutions: async () => {
    const { workflowId } = get();
    if (!workflowId) return;

    try {
      const executions = await api.getWorkflowExecutions(workflowId);
      set({ executions });
    } catch (error) {
      console.error('Failed to fetch executions:', error);
    }
  },

  setCurrentExecution: (execution: WorkflowExecution | null) => {
    set({ currentExecution: execution });
  },

  addProjection: (execution: WorkflowExecution) => {
    set((state) => {
      const existingIndex = state.openProjections.findIndex(p => p.id === execution.id);
      if (existingIndex >= 0) {
        // If already open, just switch to it
        return { activeProjectionIndex: existingIndex };
      }
      // Add new projection tab
      const newProjections = [...state.openProjections, execution];
      return {
        openProjections: newProjections,
        activeProjectionIndex: newProjections.length - 1,
      };
    });
  },

  removeProjection: (index: number) => {
    set((state) => {
      const newProjections = state.openProjections.filter((_, i) => i !== index);
      let newActiveIndex = state.activeProjectionIndex;
      
      // Adjust active index if needed
      if (index <= state.activeProjectionIndex) {
        newActiveIndex = Math.max(0, state.activeProjectionIndex - 1);
      }
      if (newActiveIndex >= newProjections.length) {
        newActiveIndex = newProjections.length - 1;
      }
      
      return {
        openProjections: newProjections,
        activeProjectionIndex: newActiveIndex >= 0 ? newActiveIndex : -1,
      };
    });
  },

  setActiveProjection: (index: number) => {
    set({ activeProjectionIndex: index });
  },

  // History management
  pushToHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    
    // Limit history size
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({
        nodes: prevState.nodes,
        edges: prevState.edges,
        historyIndex: historyIndex - 1,
        hasUnsavedChanges: true,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        historyIndex: historyIndex + 1,
        hasUnsavedChanges: true,
      });
    }
  },
}));

// Helper function to get default config for node types
function getDefaultConfig(type: NodeType): Record<string, unknown> {
  switch (type) {
    case 'http-request':
      return {
        method: 'GET',
        url: '',
        headers: {},
        body: '',
        auth: { type: 'none' },
      };
    case 'set-variable':
      return {
        variables: [{ key: '', value: '', type: 'string' }],
      };
    case 'condition':
      return {
        field: '',
        operator: 'equals',
        value: '',
      };
    case 'webhook-response':
      return {
        statusCode: 200,
        headers: {},
        body: '',
      };
    case 'schedule-trigger':
      return {
        cronExpression: '0 * * * *',
        timezone: 'UTC',
      };
    case 'webhook-trigger':
      return {
        path: '/webhook',
        method: 'POST',
      };
    case 'store-data':
      return {
        key: '',
        value: '',
      };
    case 'web-scraper':
      return {
        url: '',
        selectors: [],
        headers: {},
      };
    case 'database':
      return {
        operation: 'insert',
        table: '',
        columns: [],
        values: {},
        where: '',
        query: '',
      };
    case 'loop':
      return {
        items: '',
        itemVariable: 'item',
        indexVariable: 'index',
      };
    case 'code':
      return {
        language: 'javascript',
        code: '// Access input with $input\nreturn $input;',
      };
    case 'ai-agent':
      return {
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: '',
        systemPrompt: 'You are a helpful assistant that processes and analyzes data.',
        userPrompt: 'Analyze this data:\n\n{{$input.data}}',
        temperature: 0.7,
        maxTokens: 1000,
        jsonMode: false,
      };
    default:
      return {};
  }
}


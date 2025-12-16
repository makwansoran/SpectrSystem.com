/**
 * Project Template Modal
 * Modal for selecting automation project templates when creating a new project
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, { Background, BackgroundVariant, MarkerType, type Node, type Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  X,
  Plus,
  Shield,
  Building2,
  RefreshCw,
  AlertTriangle,
  FileText,
  Zap,
  CheckCircle2,
  UserCheck,
  Search,
  Brain,
  Scale,
  CheckSquare,
  ArrowUpDown,
  Globe,
  Clock,
  Bell,
  Lock,
  LayoutDashboard,
  FileCheck,
  Package,
  BarChart3,
  Route,
  Play,
  Webhook,
  Variable,
  GitBranch,
  Send,
  Database,
  FileSearch,
  Repeat,
  Code,
  Bot,
  Mail,
  MessageSquare,
  MessageCircle,
  Phone,
  Users,
  Cloud,
  Target,
  TrendingUp,
  Leaf,
  Flame,
  Table,
  Calendar,
  BookOpen,
  Grid3X3,
  LayoutGrid,
  MousePointerClick,
  ListTodo,
  Github,
  Bug,
  Layers,
  HardDrive,
  Droplet,
  Box,
  FolderSync,
  ShoppingBag,
  CreditCard,
  Wallet,
  ShoppingCart,
  Square,
  Megaphone,
  Sparkles,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Music,
  Rss,
  Code2,
  PieChart,
  Activity,
  FileQuestion,
  ClipboardList,
  FormInput,
  Headphones,
  HelpCircle,
  MessagesSquare,
  PenTool,
  Braces,
  FileSpreadsheet,
  FileCode,
  CalendarClock,
  Cpu,
  Merge,
  Timer,
  Filter,
  Newspaper,
  Image,
  MapPin,
  Satellite,
  Plane,
  Ship,
  Network,
  Map,
  Download,
  Truck,
  Wrench,
  Link,
  Fuel,
  DollarSign,
  Navigation,
  Radio,
  ClipboardCheck,
  Gauge,
  Receipt,
  Smartphone,
} from 'lucide-react';
import type { FlowNode, FlowEdge } from '../types';
import { getNodeDefinition } from '../constants/nodes';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// Helper function to enrich nodes with color and icon from node definitions
function enrichNodeWithVisuals(node: FlowNode): FlowNode {
  const definition = getNodeDefinition(node.type);
  return {
    ...node,
    data: {
      ...node.data,
      color: definition?.color || '#64748b',
      icon: definition?.icon || 'Zap',
    },
  };
}

// Template Preview Canvas Component
const TemplatePreviewCanvas: React.FC<{ nodes: FlowNode[]; edges: FlowEdge[] }> = ({ nodes, edges }) => {
  const { scaledNodes, scaledEdges } = useMemo(() => {
    if (nodes.length === 0) return { scaledNodes: [], scaledEdges: [] };
    
    // Find bounds
    const xCoords = nodes.map(n => n.position.x);
    const yCoords = nodes.map(n => n.position.y);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);
    
    const width = maxX - minX || 800;
    const height = maxY - minY || 400;
    
    // Scale factor to fit in preview (max width ~500px, max height ~200px)
    const scaleX = 450 / Math.max(width, 400);
    const scaleY = 200 / Math.max(height, 200);
    const scale = Math.min(scaleX, scaleY, 0.35); // Increased scale to 35% for larger nodes
    
    // Center offset
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const offsetX = 250 - centerX * scale;
    const offsetY = 100 - centerY * scale;
    
    const scaledNodes: Node[] = nodes.map(node => ({
      id: node.id,
      type: 'default',
      position: {
        x: node.position.x * scale + offsetX,
        y: node.position.y * scale + offsetY,
      },
      data: {
        label: node.data.label,
        color: node.data.color || '#64748b',
        icon: node.data.icon || 'Zap',
      },
      style: {
        width: 140 * scale, // Larger width
        height: 70 * scale, // Larger height
        fontSize: `${10 * scale}px`,
        border: `2px solid ${node.data.color || '#64748b'}`,
        borderRadius: '8px',
        backgroundColor: '#ffffff',
      },
    }));
    
    const scaledEdges: Edge[] = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: null, // Remove source handle
      targetHandle: null, // Remove target handle
      animated: true,
      style: {
        stroke: edge.style?.stroke || '#64748b',
        strokeWidth: 2.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.style?.stroke || '#64748b',
        width: 24,
        height: 24,
      },
    }));
    
    return { scaledNodes, scaledEdges };
  }, [nodes, edges]);
  
  const nodeTypes = useMemo(() => ({
    default: ({ data }: any) => {
      const ICONS: Record<string, React.FC<{ className?: string }>> = {
        'Play': Play, 'Webhook': Webhook, 'Clock': Clock, 'Globe': Globe,
        'Variable': Variable, 'GitBranch': GitBranch, 'Send': Send, 'Database': Database,
        'FileSearch': FileSearch, 'Repeat': Repeat, 'Code': Code, 'Bot': Bot,
        'Mail': Mail, 'MessageSquare': MessageSquare, 'MessageCircle': MessageCircle,
        'Phone': Phone, 'Users': Users, 'Cloud': Cloud, 'Target': Target,
        'TrendingUp': TrendingUp, 'Building2': Building2, 'UserCheck': UserCheck,
        'Leaf': Leaf, 'Zap': Zap, 'Flame': Flame, 'Table': Table,
        'FileText': FileText, 'Calendar': Calendar, 'BookOpen': BookOpen, 'Grid3X3': Grid3X3,
        'LayoutGrid': LayoutGrid, 'CheckSquare': CheckSquare, 'LayoutDashboard': LayoutDashboard,
        'MousePointerClick': MousePointerClick, 'ListTodo': ListTodo, 'Github': Github,
        'Bug': Bug, 'Layers': Layers, 'AlertTriangle': AlertTriangle, 'HardDrive': HardDrive,
        'Droplet': Droplet, 'Box': Box, 'FolderSync': FolderSync, 'ShoppingBag': ShoppingBag,
        'CreditCard': CreditCard, 'Wallet': Wallet, 'ShoppingCart': ShoppingCart, 'Square': Square,
        'Megaphone': Megaphone, 'Sparkles': Sparkles, 'Twitter': Twitter, 'Linkedin': Linkedin,
        'Facebook': Facebook, 'Instagram': Instagram, 'Youtube': Youtube, 'Music': Music,
        'Rss': Rss, 'Code2': Code2, 'BarChart3': BarChart3, 'PieChart': PieChart,
        'Activity': Activity, 'FileQuestion': FileQuestion, 'ClipboardList': ClipboardList,
        'FormInput': FormInput, 'Headphones': Headphones, 'HelpCircle': HelpCircle,
        'MessagesSquare': MessagesSquare, 'PenTool': PenTool, 'Braces': Braces,
        'FileSpreadsheet': FileSpreadsheet, 'FileCode': FileCode, 'Lock': Lock,
        'CalendarClock': CalendarClock, 'Brain': Brain, 'Cpu': Cpu, 'Route': Route,
        'Merge': Merge, 'Timer': Timer, 'Filter': Filter, 'ArrowUpDown': ArrowUpDown,
        'Shield': Shield, 'Newspaper': Newspaper, 'Image': Image, 'MapPin': MapPin,
        'Satellite': Satellite, 'Plane': Plane, 'Ship': Ship, 'Network': Network,
        'Map': Map, 'Download': Download, 'Search': Search, 'Truck': Truck,
        'Wrench': Wrench, 'Link': Link, 'Package': Package, 'Bell': Bell,
        'Fuel': Fuel, 'DollarSign': DollarSign, 'Navigation': Navigation, 'Radio': Radio,
        'FileCheck': FileCheck, 'ClipboardCheck': ClipboardCheck, 'Gauge': Gauge,
        'Receipt': Receipt, 'Smartphone': Smartphone, 'RefreshCw': RefreshCw,
      };
      
      const Icon = ICONS[data.icon] || Zap;
      const color = data.color || '#64748b';
      
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '8px',
            backgroundColor: `${color}08`,
            border: `2px solid ${color}40`,
            borderRadius: '8px',
            padding: '8px 12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: `${color}15`,
              border: `2px solid ${color}30`,
              borderRadius: '6px',
              flexShrink: 0,
            }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <span style={{ 
            fontSize: '9px', 
            color: '#0f172a', 
            fontWeight: 600, 
            textTransform: 'uppercase', 
            letterSpacing: '0.3px',
            textAlign: 'left',
            lineHeight: '1.2',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {data.label}
          </span>
        </div>
      );
    },
  }), []);
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={scaledNodes}
        edges={scaledEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        style={{ width: '100%', height: '100%' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#e2e8f0" />
      </ReactFlow>
      <style>{`
        .react-flow__handle {
          display: none !important;
        }
        .react-flow__edge-path {
          stroke-width: 2.5px !important;
        }
        .react-flow__edge.selected .react-flow__edge-path,
        .react-flow__edge:hover .react-flow__edge-path {
          stroke-width: 3px !important;
        }
      `}</style>
    </div>
  );
};

// Define templates (currently empty - will be added later)
export const PROJECT_TEMPLATES: ProjectTemplate[] = [];

interface ProjectTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ProjectTemplate, projectName: string) => void;
}

const ProjectTemplateModal: React.FC<ProjectTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');

  const handleSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleCreateProject = () => {
    if (!projectName.trim() || !selectedTemplateId) return;
    
    // Handle blank template (selectedTemplateId is 'blank')
    if (selectedTemplateId === 'blank') {
      const blankTemplate: ProjectTemplate = {
        id: 'blank',
        name: 'Blank Template',
        description: 'Start with an empty workflow',
        icon: Plus,
        color: '#64748b',
        nodes: [],
        edges: [],
      };
      onSelectTemplate(blankTemplate, projectName.trim());
      // Reset state
      setSelectedTemplateId(null);
      setProjectName('');
      onClose();
      return;
    }
    
    // Find the selected template
    const selectedTemplate = PROJECT_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate, projectName.trim());
      // Reset state
      setSelectedTemplateId(null);
      setProjectName('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedTemplateId(null);
    setProjectName('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white border border-slate-300/50 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300/50 bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-slate-900" />
                  <h2 className="text-lg font-semibold text-slate-900 uppercase tracking-tight">
                    Create New Project
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-slate-200/50 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden flex">
                {/* Left Sidebar - Template Selection */}
                <div className="w-80 border-r border-slate-300/50 bg-slate-50/30 overflow-y-auto">
                  <div className="p-4 space-y-3">
                    {/* Project Name Input */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-tight">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Enter project name"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                      />
                    </div>

                    {/* Blank Template Option */}
                    <button
                      onClick={() => handleSelect('blank')}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                        selectedTemplateId === 'blank'
                          ? 'border-slate-400 bg-slate-100'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-slate-200 flex items-center justify-center">
                          <Plus className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">Blank Template</h3>
                          <p className="text-xs text-slate-600 mt-0.5">Start with an empty workflow</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Right Side - Preview */}
                <div className="flex-1 overflow-y-auto bg-white">
                  <div className="p-6">
                    {selectedTemplateId === 'blank' ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Plus className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-slate-900 mb-1">Blank Template</h3>
                          <p className="text-sm text-slate-600">Start building your workflow from scratch</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 py-12">
                        Select a template to preview
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-300/50 bg-slate-50/30 flex items-center justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/50 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!projectName.trim() || !selectedTemplateId}
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Project
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectTemplateModal;


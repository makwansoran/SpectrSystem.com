/**
 * Base Node Component
 * Light theme - clean node design
 */

import React, { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { 
  Play, Webhook, Clock, Globe, Variable, GitBranch, Send, Database,
  CheckCircle2, XCircle, Loader2, FileSearch, Repeat, Code, Trash2, Copy, Bot,
  Mail, MessageSquare, MessageCircle, Phone, Users, Cloud, Target,
  TrendingUp, Building2, UserCheck, Leaf, Zap, Flame, Table, FileText,
  Calendar, BookOpen, Grid3X3, LayoutGrid, CheckSquare, LayoutDashboard,
  MousePointerClick, ListTodo, Github, Bug, Layers, AlertTriangle,
  HardDrive, Droplet, Box, FolderSync, ShoppingBag, CreditCard, Wallet,
  ShoppingCart, Square, Megaphone, Sparkles, Twitter, Linkedin, Facebook,
  Instagram, Youtube, Music, Rss, Code2, BarChart3, PieChart, Activity,
  FileQuestion, ClipboardList, FormInput, Headphones, HelpCircle,
  MessagesSquare, PenTool, Braces, FileSpreadsheet, FileCode, Lock,
  CalendarClock, Brain, Cpu, Route, Merge, Timer, Filter, ArrowUpDown,
  Shield, Newspaper, Image, MapPin, Satellite, Plane, Ship,
  Network, Map, Download, Search, Truck, Wrench, Link, Package,
  Bell, Fuel, DollarSign, Navigation, Radio, FileCheck, ClipboardCheck, Gauge, Receipt,
  Smartphone, RefreshCw
} from 'lucide-react';
import clsx from 'clsx';
import type { CustomNodeData } from '../types';
import { getNodeDefinition } from '../constants/nodes';
import { useWorkflowStore } from '../stores/workflowStore';

// Icon mapping - comprehensive with explicit string keys
const ICONS: Record<string, React.FC<{ className?: string }>> = {
  'Play': Play,
  'Webhook': Webhook,
  'Clock': Clock,
  'Globe': Globe,
  'Variable': Variable,
  'GitBranch': GitBranch,
  'Send': Send,
  'Database': Database,
  'FileSearch': FileSearch,
  'Repeat': Repeat,
  'Code': Code,
  'Bot': Bot,
  'Mail': Mail,
  'MessageSquare': MessageSquare,
  'MessageCircle': MessageCircle,
  'Phone': Phone,
  'Users': Users,
  'Cloud': Cloud,
  'Target': Target,
  'TrendingUp': TrendingUp,
  'Building2': Building2,
  'UserCheck': UserCheck,
  'Leaf': Leaf,
  'Zap': Zap,
  'Flame': Flame,
  'Table': Table,
  'FileText': FileText,
  'Calendar': Calendar,
  'BookOpen': BookOpen,
  'Grid3X3': Grid3X3,
  'LayoutGrid': LayoutGrid,
  'CheckSquare': CheckSquare,
  'LayoutDashboard': LayoutDashboard,
  'MousePointerClick': MousePointerClick,
  'ListTodo': ListTodo,
  'Github': Github,
  'Bug': Bug,
  'Layers': Layers,
  'AlertTriangle': AlertTriangle,
  'HardDrive': HardDrive,
  'Droplet': Droplet,
  'Box': Box,
  'FolderSync': FolderSync,
  'ShoppingBag': ShoppingBag,
  'CreditCard': CreditCard,
  'Wallet': Wallet,
  'ShoppingCart': ShoppingCart,
  'Square': Square,
  'Megaphone': Megaphone,
  'Sparkles': Sparkles,
  'Twitter': Twitter,
  'Linkedin': Linkedin,
  'Facebook': Facebook,
  'Instagram': Instagram,
  'Youtube': Youtube,
  'Music': Music,
  'Rss': Rss,
  'Code2': Code2,
  'BarChart3': BarChart3,
  'PieChart': PieChart,
  'Activity': Activity,
  'FileQuestion': FileQuestion,
  'ClipboardList': ClipboardList,
  'FormInput': FormInput,
  'Headphones': Headphones,
  'HelpCircle': HelpCircle,
  'MessagesSquare': MessagesSquare,
  'PenTool': PenTool,
  'Braces': Braces,
  'FileSpreadsheet': FileSpreadsheet,
  'FileCode': FileCode,
  'Lock': Lock,
  'CalendarClock': CalendarClock,
  'Brain': Brain,
  'Cpu': Cpu,
  'Route': Route,
  'Merge': Merge,
  'Timer': Timer,
  'Filter': Filter,
  'ArrowUpDown': ArrowUpDown,
  'Shield': Shield,
  'Newspaper': Newspaper,
  'Image': Image,
  'MapPin': MapPin,
  'Satellite': Satellite,
  'Plane': Plane,
  'Ship': Ship,
  'Network': Network,
  'Map': Map,
  'Download': Download,
  'Search': Search,
  'Truck': Truck,
  'Wrench': Wrench,
  'Link': Link,
  'Package': Package,
  'Bell': Bell,
  'Fuel': Fuel,
  'DollarSign': DollarSign,
  'Navigation': Navigation,
  'Radio': Radio,
  'FileCheck': FileCheck,
  'ClipboardCheck': ClipboardCheck,
  'Gauge': Gauge,
  'Receipt': Receipt,
  'Smartphone': Smartphone,
  'RefreshCw': RefreshCw,
};

interface BaseNodeProps extends NodeProps<CustomNodeData> {
  children?: React.ReactNode;
}

const BaseNode: React.FC<BaseNodeProps> = ({ 
  id,
  data, 
  selected,
  children 
}) => {
  const [showActions, setShowActions] = useState(false);
  const { deleteSelected, setSelectedNode, duplicateNode } = useWorkflowStore();
  const definition = getNodeDefinition(data.nodeType);
  const Icon = definition ? (ICONS[definition.icon] || Zap) : Zap;

  // Status indicator
  const getStatusIndicator = () => {
    switch (data.executionStatus) {
      case 'running':
        return <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'failed':
        return <XCircle className="w-3.5 h-3.5 text-red-600" />;
      default:
        return null;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode({ id, type: data.nodeType, data });
    setTimeout(() => deleteSelected(), 0);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateNode(id);
  };

  // Get node color from definition
  const nodeColor = definition?.color || '#64748b';
  
  return (
    <div
      className={clsx(
        'min-w-[180px] rounded-lg relative group',
        'bg-white border',
        'transition-all duration-200',
        'shadow-sm',
        selected 
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md',
        data.executionStatus === 'running' && 'border-blue-400 ring-1 ring-blue-400/20',
        data.executionStatus === 'failed' && 'border-red-400 ring-1 ring-red-400/20'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{
        ...(selected && {
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px ${nodeColor}20`
        })
      }}
    >
      {/* Action buttons on hover */}
      {(showActions || selected) && (
        <div className="absolute -top-9 right-0 flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1 py-1 z-10 shadow-md">
          <button
            onClick={handleDuplicate}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded transition-all"
            title="Duplicate node"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"
            title="Delete node"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-3.5 py-3">
        {/* Icon */}
        <div 
          className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all"
          style={{
            backgroundColor: `${nodeColor}08`,
            borderColor: `${nodeColor}20`,
            ...(selected && {
              backgroundColor: `${nodeColor}15`,
              borderColor: `${nodeColor}40`
            })
          }}
        >
          <Icon 
            className="w-4.5 h-4.5 transition-colors" 
            style={{ color: nodeColor }}
          />
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <span 
            className="text-xs font-semibold text-slate-800 truncate block" 
            style={{ 
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              letterSpacing: '-0.015em',
              fontWeight: 600,
              fontSize: '11px',
              lineHeight: '1.4'
            }}
          >
            {data.label}
          </span>
        </div>

        {/* Status */}
        {data.executionStatus && data.executionStatus !== 'pending' && (
          getStatusIndicator()
        )}
      </div>

      {/* Content */}
      {children && (
        <div 
          className="px-3.5 pb-3 text-[10px] text-slate-500 border-t border-slate-100 pt-2.5" 
          style={{ 
            fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
            letterSpacing: '0.02em',
            fontSize: '10px',
            lineHeight: '1.5',
            fontWeight: 500
          }}
        >
          {children}
        </div>
      )}

      {/* Error */}
      {data.executionError && (
        <div className="px-3.5 pb-3">
          <span 
            className="text-[10px] text-red-600 line-clamp-2 font-medium" 
            style={{ 
              fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
              fontSize: '10px',
              lineHeight: '1.4',
              letterSpacing: '0.01em'
            }}
          >
            {data.executionError}
          </span>
        </div>
      )}

      {/* Handles */}
      {definition && definition.inputs > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3.5 !h-3.5 !bg-white !border-2 !border-slate-300 hover:!border-blue-500 hover:!bg-blue-50 !-left-1.75 transition-all"
        />
      )}

      {definition && definition.outputs === 1 && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3.5 !h-3.5 !bg-white !border-2 !border-slate-300 hover:!border-blue-500 hover:!bg-blue-50 !-right-1.75 transition-all"
        />
      )}

      {/* Condition handles */}
      {definition && definition.outputs === 2 && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="!w-3.5 !h-3.5 !bg-white !border-2 !border-emerald-400 hover:!bg-emerald-50 !-right-1.75 transition-all"
            style={{ top: '35%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="!w-3.5 !h-3.5 !bg-white !border-2 !border-red-400 hover:!bg-red-50 !-right-1.75 transition-all"
            style={{ top: '65%' }}
          />
        </>
      )}
    </div>
  );
};

export default memo(BaseNode);

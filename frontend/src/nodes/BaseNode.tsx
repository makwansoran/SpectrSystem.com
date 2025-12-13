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
  Smartphone
} from 'lucide-react';
import clsx from 'clsx';
import type { CustomNodeData } from '../types';
import { getNodeDefinition } from '../constants/nodes';
import { useWorkflowStore } from '../stores/workflowStore';

// Icon mapping - comprehensive
const ICONS: Record<string, React.FC<{ className?: string }>> = {
  Play, Webhook, Clock, Globe, Variable, GitBranch, Send, Database,
  FileSearch, Repeat, Code, Bot, Mail, MessageSquare, MessageCircle,
  Phone, Users, Cloud, Target, TrendingUp, Building2, UserCheck,
  Leaf, Zap, Flame, Table, FileText, Calendar, BookOpen, Grid3X3,
  LayoutGrid, CheckSquare, LayoutDashboard, MousePointerClick, ListTodo,
  Github, Bug, Layers, AlertTriangle, HardDrive, Droplet, Box,
  FolderSync, ShoppingBag, CreditCard, Wallet, ShoppingCart, Square,
  Megaphone, Sparkles, Twitter, Linkedin, Facebook, Instagram, Youtube,
  Music, Rss, Code2, BarChart3, PieChart, Activity, FileQuestion,
  ClipboardList, FormInput, Headphones, HelpCircle, MessagesSquare,
  PenTool, Braces, FileSpreadsheet, FileCode, Lock, CalendarClock,
  Brain, Cpu, Route, Merge, Timer, Filter, ArrowUpDown,
  Shield, Newspaper, Image, MapPin, Satellite, Plane, Ship,
  Network, Map, Download, Search, Truck, Wrench, Link, Package,
  Bell, Fuel, DollarSign, Navigation, Radio, FileCheck, ClipboardCheck, Gauge, Receipt,
  Smartphone
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
  const Icon = definition ? ICONS[definition.icon] : null;

  // Status indicator
  const getStatusIndicator = () => {
    switch (data.executionStatus) {
      case 'running':
        return <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'failed':
        return <XCircle className="w-3.5 h-3.5 text-red-500" />;
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

  return (
    <div
      className={clsx(
        'min-w-[180px] rounded-lg relative group',
        'bg-white border border-slate-300/50',
        'transition-all duration-200',
        selected 
          ? 'border-slate-900 ring-2 ring-slate-900/20' 
          : 'hover:border-slate-900',
        data.executionStatus === 'running' && 'border-slate-900 ring-1 ring-slate-900/20',
        data.executionStatus === 'failed' && 'border-red-500 ring-1 ring-red-500/20'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Action buttons on hover */}
      {(showActions || selected) && (
        <div className="absolute -top-9 right-0 flex items-center gap-1 bg-white border border-slate-300/50 rounded-lg px-1 py-1 z-10">
          <button
            onClick={handleDuplicate}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-all"
            title="Duplicate node"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete node"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-3.5 py-3">
        {/* Icon */}
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-300/50">
          {Icon && <Icon className="w-4.5 h-4.5 text-slate-900" />}
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-slate-900 truncate block uppercase tracking-tight">
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
        <div className="px-3.5 pb-3 text-[10px] text-slate-600 border-t border-slate-300/50 pt-2.5 font-mono">
          {children}
        </div>
      )}

      {/* Error */}
      {data.executionError && (
        <div className="px-3.5 pb-3">
          <span className="text-[10px] text-red-600 line-clamp-2 font-medium font-mono">
            {data.executionError}
          </span>
        </div>
      )}

      {/* Handles */}
      {definition && definition.inputs > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white hover:!bg-blue-500 !-left-1.5"
        />
      )}

      {definition && definition.outputs === 1 && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-slate-300 !border-2 !border-white hover:!bg-blue-500 !-right-1.5"
        />
      )}

      {/* Condition handles */}
      {definition && definition.outputs === 2 && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white !-right-1.5"
            style={{ top: '35%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="!w-3 !h-3 !bg-red-400 !border-2 !border-white !-right-1.5"
            style={{ top: '65%' }}
          />
        </>
      )}
    </div>
  );
};

export default memo(BaseNode);

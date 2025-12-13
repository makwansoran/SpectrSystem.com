/**
 * Node Palette Component
 * Sidebar for dragging and dropping nodes onto the canvas
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ChevronRight, ChevronLeft,
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
  Network, Map, Download, Truck, Wrench, Link, Package,
  Bell, Fuel, DollarSign, Navigation, Radio, FileCheck, ClipboardCheck, Gauge, Receipt,
  Smartphone
} from 'lucide-react';
import clsx from 'clsx';
import { NODE_CATEGORIES, NODE_DEFINITIONS } from '../constants/nodes';
import type { NodeType } from '../types';

// Icon mapping - same as BaseNode
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
  Network, Map, Download, Truck, Wrench, Link, Package,
  Bell, Fuel, DollarSign, Navigation, Radio, FileCheck, ClipboardCheck, Gauge, Receipt,
  Smartphone
};

interface NodePaletteProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ isOpen = true, onToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Define the order of functional subcategories
  const subcategoryOrder = [
    'Workflow Triggers',
    'Control Flow',
    'Data Transformation',
    'Data Sources',
    'AI & Code',
    'Intelligence',
    'Data Storage',
    'Communication',
    'Business Operations',
    'Productivity & Development',
    'Marketing & Engagement',
    'Infrastructure',
    'Documents',
    'Outputs',
  ];

  // Group nodes by functional subcategory
  const groupedNodes = useMemo(() => {
    const groups: Record<string, typeof NODE_DEFINITIONS> = {};

    let nodes = NODE_DEFINITIONS;

    // Filter by search query if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      nodes = nodes.filter(node =>
        node.name.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query) ||
        node.subcategory?.toLowerCase().includes(query)
      );
    }

    // Group by subcategory
    nodes.forEach(node => {
      const subcat = node.subcategory || 'Other';
      if (!groups[subcat]) {
        groups[subcat] = [];
      }
      groups[subcat].push(node);
    });

    // Sort nodes within each group alphabetically
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [searchQuery]);

  // Initialize expanded categories (all closed by default)
  React.useEffect(() => {
    const initial: Record<string, boolean> = {};
    subcategoryOrder.forEach(cat => {
      initial[cat] = false;
    });
    setExpandedCategories(initial);
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const getIcon = (iconName: string) => {
    const IconComponent = ICONS[iconName] || ICONS.Box;
    return IconComponent;
  };

  return (
    <>
      {/* Toggle Button - shown when closed */}
      {!isOpen && onToggle && (
        <button
          onClick={onToggle}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-12 bg-white border-r border-y border-slate-300/50 rounded-r-lg hover:bg-slate-50 transition-colors flex items-center justify-center shadow-sm"
          title="Open Node Palette"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? 256 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="h-full bg-white border-r border-slate-300/50 flex flex-col overflow-hidden"
        style={{ minWidth: isOpen ? 256 : 0 }}
      >
        {isOpen && (
          <>
            {/* Header */}
            <div className="px-3 py-3 border-b border-slate-300/50">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-medium text-slate-900 uppercase tracking-tight">Nodes</h2>
                {onToggle && (
                  <button
                    onClick={onToggle}
                    className="p-1 rounded hover:bg-slate-100 transition-colors"
                    title="Close Node Palette"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Node List - Grouped by functional subcategories */}
            <div className="flex-1 overflow-y-auto hide-scrollbar p-2">
              {Object.keys(groupedNodes).length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No nodes found
                </div>
              ) : (
                subcategoryOrder
                  .filter(cat => groupedNodes[cat] && groupedNodes[cat].length > 0)
                  .map((category, catIndex) => {
                    const nodes = groupedNodes[category];
                    const isExpanded = expandedCategories[category] ?? false;
                    
                    return (
                      <div key={category} className="mb-2">
                        {/* Category Header */}
                        <button
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                            </motion.div>
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-tight">
                              {category}
                            </span>
                            <span className="text-[10px] text-slate-400">({nodes.length})</span>
                          </div>
                        </button>

                        {/* Category Nodes */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pt-1 space-y-1">
                                {nodes.map((node, nodeIndex) => {
                                  const Icon = getIcon(node.icon);
                                  return (
                                    <motion.div
                                      key={node.type}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.1, delay: nodeIndex * 0.02 }}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, node.type)}
                                      className="px-2 py-1.5 rounded-lg border border-slate-200 hover:border-slate-900 hover:bg-slate-50 cursor-grab active:cursor-grabbing transition-all group"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                                          style={{ backgroundColor: `${node.color}20`, borderColor: node.color }}
                                        >
                                          <Icon className="w-3.5 h-3.5" style={{ color: node.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-slate-900 truncate">{node.name}</p>
                                          <p className="text-[10px] text-slate-500 truncate">{node.description}</p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
              )}
            </div>
          </>
        )}
      </motion.div>
    </>
  );
};

export default NodePalette;


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
  Smartphone, RefreshCw
} from 'lucide-react';
import clsx from 'clsx';
import { NODE_CATEGORIES, NODE_DEFINITIONS, SUBCATEGORIES } from '../constants/nodes';
import type { NodeType } from '../types';

// Icon mapping - same as BaseNode (explicit string keys)
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

interface NodePaletteProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ isOpen = true, onToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  // Generic hover state for all categories
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const categoryRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const [categoryPositions, setCategoryPositions] = React.useState<Record<string, { top: number; left: number }>>({});

  // Update position for a category
  const updateCategoryPosition = React.useCallback((category: string) => {
    const ref = categoryRefs.current[category];
    if (ref) {
      const rect = ref.getBoundingClientRect();
      setCategoryPositions(prev => ({
        ...prev,
        [category]: { top: rect.top, left: rect.left + rect.width + 4 }
      }));
    }
  }, []);

  // Update position on scroll when any category is hovered
  React.useEffect(() => {
    if (hoveredCategory) {
      const handleScroll = () => updateCategoryPosition(hoveredCategory);
      const ref = categoryRefs.current[hoveredCategory];
      const scrollContainer = ref?.closest('.overflow-y-auto');
      scrollContainer?.addEventListener('scroll', handleScroll);
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      
      return () => {
        scrollContainer?.removeEventListener('scroll', handleScroll);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [hoveredCategory, updateCategoryPosition]);

  // Define the order of functional subcategories
  const subcategoryOrder = [
    'Workflow Triggers',
    'Intelligence Nodes',
    'Decision Nodes',
    'Action Nodes',
    'Utility / Governance Nodes',
    'App Nodes',
    'Integration Nodes',
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
      {/* Generic Hover Sidebars - Fixed Position (outside main sidebar) */}
      <AnimatePresence>
        {(['Workflow Triggers', 'Intelligence Nodes', 'Decision Nodes', 'Action Nodes', 'Utility / Governance Nodes', 'App Nodes', 'Integration Nodes', 'AI & Code', 'Data Storage'] as const).map((categoryName) => {
          if (!hoveredCategory || hoveredCategory !== categoryName || !groupedNodes[categoryName] || groupedNodes[categoryName].length === 0) return null;
          
          const position = categoryPositions[categoryName] || { top: 0, left: 0 };
          
          return (
            <motion.div
              key={categoryName}
              initial={{ opacity: 0, x: -10, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 260 }}
              exit={{ opacity: 0, x: -10, width: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden flex flex-col"
              style={{ 
                minWidth: 260, 
                maxWidth: 260,
                maxHeight: '80vh',
                zIndex: 10000,
                top: `${position.top}px`,
                left: `${position.left}px`,
                pointerEvents: 'auto'
              }}
              onMouseEnter={() => setHoveredCategory(categoryName)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="flex-shrink-0 p-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 uppercase tracking-tight">{categoryName}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 'calc(80vh - 50px)' }}>
                <div className="space-y-1">
                  {groupedNodes[categoryName].map((node, nodeIndex) => {
                    const Icon = getIcon(node.icon);
                    return (
                      <motion.div
                        key={node.type}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.1, delay: nodeIndex * 0.03 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, node.type)}
                        className="px-2 py-2 rounded-lg border border-slate-200 hover:border-slate-900 hover:bg-slate-50 cursor-grab active:cursor-grabbing transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${node.color}15`, border: `1.5px solid ${node.color}40` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: node.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{node.name}</p>
                            <p className="text-[10px] text-slate-500 truncate leading-tight">{node.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

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
            <div className="flex-1 overflow-y-auto hide-scrollbar p-2 relative">
              {/* Category Buttons with Hover Sidebars */}
              {(['Workflow Triggers', 'Intelligence Nodes', 'Decision Nodes', 'Action Nodes', 'Utility / Governance Nodes', 'App Nodes', 'Integration Nodes', 'AI & Code', 'Data Storage'] as const).map((categoryName) => {
                if (!groupedNodes[categoryName] || groupedNodes[categoryName].length === 0) return null;
                
                const categoryInfo = SUBCATEGORIES[categoryName];
                const Icon = categoryInfo ? getIcon(categoryInfo.icon) : Play;
                const bgColor = categoryName === 'Workflow Triggers' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                  categoryName === 'Intelligence Nodes' ? 'bg-purple-50 border-purple-200 text-purple-600' :
                  categoryName === 'Decision Nodes' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                  categoryName === 'Action Nodes' ? 'bg-cyan-50 border-cyan-200 text-cyan-600' :
                  categoryName === 'Utility / Governance Nodes' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' :
                  categoryName === 'App Nodes' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                  categoryName === 'AI & Code' ? 'bg-pink-50 border-pink-200 text-pink-600' :
                  categoryName === 'Data Storage' ? 'bg-teal-50 border-teal-200 text-teal-600' :
                  'bg-violet-50 border-violet-200 text-violet-600';
                
                return (
                  <div 
                    key={categoryName}
                    ref={(el) => { categoryRefs.current[categoryName] = el; }}
                    className="mb-3 relative"
                    onMouseEnter={() => {
                      updateCategoryPosition(categoryName);
                      setHoveredCategory(categoryName);
                    }}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-slate-200 hover:border-slate-300">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bgColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-900">{categoryName}</p>
                          <p className="text-[10px] text-slate-500">{groupedNodes[categoryName].length} {categoryName.includes('Nodes') || categoryName === 'AI & Code' || categoryName === 'Data Storage' ? 'nodes' : 'triggers'}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {Object.keys(groupedNodes).length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No nodes found
                </div>
              ) : (
                subcategoryOrder
                  .filter(cat => groupedNodes[cat] && groupedNodes[cat].length > 0 && 
                    !['Workflow Triggers', 'Intelligence Nodes', 'Decision Nodes', 'Action Nodes', 'Utility / Governance Nodes', 'App Nodes', 'Integration Nodes', 'AI & Code', 'Data Storage'].includes(cat))
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


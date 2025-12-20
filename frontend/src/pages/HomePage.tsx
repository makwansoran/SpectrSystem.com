/**
 * Home Page
 * Main home page for logged-in users - shows projects and analytics
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  RefreshCw, 
  Database, 
  Clock,
  BarChart3,
  Search,
  Zap,
  Activity,
  Loader2,
  MoreVertical,
  Trash2,
  Share2,
  Copy,
  Edit,
  User,
  Settings,
  LogOut,
  Crown,
  ShoppingBag,
  Bell,
  X,
  Play,
  Folder,
  Brain,
  FileJson,
  Shield
} from 'lucide-react';
import clsx from 'clsx';
import * as api from '../services/api';
import type { WorkflowListItem } from '../types';
import { useUserStore } from '../stores/userStore';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, organization, logout, usageStats, fetchUsageStats } = useUserStore();
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Fetch user data if not already loaded
    const { user: currentUser, organization: currentOrg, fetchUser, fetchOrganization } = useUserStore.getState();
    if (!currentUser) {
      fetchUser();
    }
    if (!currentOrg) {
      fetchOrganization();
    }
    // Fetch usage stats
    if (currentUser && currentOrg) {
      fetchUsageStats();
    }
  }, [fetchUsageStats]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const workflowsData = await api.getWorkflows();
      setWorkflows(workflowsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats - ensure workflows is always an array
  const workflowsArray = Array.isArray(workflows) ? workflows : [];
  const stats = {
    totalWorkflows: workflowsArray.length,
    activeWorkflows: workflowsArray.filter(w => w.isActive).length,
  };

  // Filter workflows
  const filteredWorkflows = workflowsArray.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         w.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                        (filterStatus === 'active' && w.isActive) ||
                        (filterStatus === 'inactive' && !w.isActive);
    return matchesSearch && matchesFilter;
  });

  // Handle delete workflow
  const handleDelete = async (workflowId: string, workflowName: string) => {
    if (window.confirm(`Are you sure you want to delete "${workflowName}"? This action cannot be undone.`)) {
      try {
        await api.deleteWorkflow(workflowId);
        fetchData(); // Refresh the list
        setOpenMenuId(null);
      } catch (error) {
        console.error('Failed to delete workflow:', error);
        alert('Failed to delete workflow. Please try again.');
      }
    }
  };

  // Handle share workflow
  const handleShare = async (workflowId: string) => {
    const shareUrl = `${window.location.origin}/app/${workflowId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
      setOpenMenuId(null);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback: show the URL
      prompt('Copy this link:', shareUrl);
    }
  };

  // Handle duplicate workflow
  const handleDuplicate = async (workflowId: string) => {
    try {
      const workflow = await api.getWorkflow(workflowId);
      const duplicateName = `${workflow.name} (Copy)`;
      
      // Check for duplicates and adjust name
      let uniqueName = duplicateName;
      let counter = 1;
      while (workflows.some(w => w.name === uniqueName)) {
        uniqueName = `${workflow.name} (Copy ${counter})`;
        counter++;
      }

      await api.createWorkflow({
        name: uniqueName,
        description: workflow.description,
        nodes: workflow.nodes,
        edges: workflow.edges,
      });
      
      fetchData(); // Refresh the list
      setOpenMenuId(null);
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
      alert('Failed to duplicate workflow. Please try again.');
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.workflow-card-menu')) {
        setOpenMenuId(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Sidebar Item Component
  const SidebarItem: React.FC<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
    expanded: boolean;
    active?: boolean;
  }> = ({ icon: Icon, label, onClick, expanded, active = false }) => {
    return (
      <button
        onClick={onClick}
        className={clsx(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1',
          active
            ? 'bg-slate-800 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <motion.span
          className="text-sm font-medium whitespace-nowrap"
          animate={{
            opacity: expanded ? 1 : 0,
            width: expanded ? 'auto' : 0,
          }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
        >
          {label}
        </motion.span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <motion.aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className="fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 z-20"
        animate={{
          width: sidebarHovered ? '240px' : '64px',
        }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      >
        <div className="flex flex-col h-full py-4">
          {/* Logo */}
          <div className="px-4 mb-6">
            <div className="flex items-center gap-3 overflow-hidden">
              <img src="/EyelogoWhite.png" alt="SPECTR SYSTEM" className="h-8 w-auto flex-shrink-0" />
              <motion.span
                className="text-white font-semibold text-sm whitespace-nowrap"
                animate={{
                  opacity: sidebarHovered ? 1 : 0,
                  width: sidebarHovered ? 'auto' : 0,
                }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
              >
                SPECTR
              </motion.span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-2">
            <SidebarItem
              icon={Folder}
              label="Home"
              active
              onClick={() => navigate('/home')}
              expanded={sidebarHovered}
            />
            <SidebarItem
              icon={Database}
              label="My data"
              onClick={() => navigate('/data')}
              expanded={sidebarHovered}
            />
            <SidebarItem
              icon={ShoppingBag}
              label="Store"
              onClick={() => navigate('/store')}
              expanded={sidebarHovered}
            />
            <SidebarItem
              icon={BarChart3}
              label="Usage"
              onClick={() => navigate('/usage')}
              expanded={sidebarHovered}
            />
            <SidebarItem
              icon={Shield}
              label="Admin"
              onClick={() => navigate('/admin')}
              expanded={sidebarHovered}
            />
          </nav>

          {/* Bottom Section */}
          <div className="px-2 border-t border-slate-800 pt-4">
            <SidebarItem
              icon={Settings}
              label="Settings"
              onClick={() => navigate('/settings')}
              expanded={sidebarHovered}
            />
            
            {/* Profile Picture - Always show, even if user is loading */}
            <button
              onClick={() => navigate('/profile')}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1',
                'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-medium flex items-center justify-center flex-shrink-0">
                  {user ? getInitials(user.name) : 'U'}
                </div>
              )}
              <motion.span
                className="text-sm font-medium text-white whitespace-nowrap"
                animate={{
                  opacity: sidebarHovered ? 1 : 0,
                  width: sidebarHovered ? 'auto' : 0,
                }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
              >
                {user?.name || 'Profile'}
              </motion.span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 ml-[64px]">
      {/* Header - Palantir Style */}
      <header className="bg-white border-b border-slate-300/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-1.5">
              <img src="/EyelogoBlack.png" alt="SPECTR SYSTEM" className="h-12 w-auto" />
              <h1 className="text-base font-medium text-slate-900 tracking-tight uppercase">
                SPECTR SYSTEM / home
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchData}
                disabled={loading}
                className="text-slate-700 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                to="/app"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Project
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Project Statistics, All Projects, and Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Stats Module - Combined */}
            <div className="bg-white border border-slate-300/50">
              <div className="px-4 py-3 border-b border-slate-300/50 bg-slate-50/30">
                <h2 className="text-xs font-medium text-slate-900 uppercase tracking-wide">
                  Project Statistics
                </h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-slate-600" />
                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                        Total Projects
                      </span>
                    </div>
                    <p className="text-2xl font-mono font-semibold text-slate-900 mb-1">
                      {stats.totalWorkflows}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">+2 this week</p>
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-slate-600" />
                      <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                        Active Projects
                      </span>
                    </div>
                    <p className="text-2xl font-mono font-semibold text-slate-900 mb-1">
                      {stats.activeWorkflows}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {stats.activeWorkflows > 0 ? Math.round((stats.activeWorkflows / stats.totalWorkflows) * 100) : 0}% of total
                    </p>
                  </div>
                </div>
              </div>
            </div>
          {/* All Projects Section - Palantir Style */}
          <div className="bg-white border border-slate-300/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-300/50 bg-slate-50/30">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-medium text-slate-900 uppercase tracking-wide">
                All Projects
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                {filteredWorkflows.length} {filteredWorkflows.length === 1 ? 'workflow' : 'workflows'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter */}
              <div className="flex items-center gap-6">
                {(['all', 'active', 'inactive'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={clsx(
                      'text-xs font-medium transition-colors relative pb-1.5',
                      filterStatus === status
                        ? 'text-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {filterStatus === status && (
                      <motion.div
                        layoutId="filterUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"
                        initial={false}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300/50 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 w-48 font-mono"
                />
              </div>
            </div>
          </div>
          <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-16">
              <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-900 mb-1">No projects found</p>
              <p className="text-xs text-slate-500 mb-4 font-mono">
                {searchQuery ? 'Try a different search term' : 'Create your first workflow project'}
              </p>
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onClick={() => navigate(`/app/${workflow.id}`)}
                  onDelete={handleDelete}
                  onShare={handleShare}
                  onDuplicate={handleDuplicate}
                  isMenuOpen={openMenuId === workflow.id}
                  onMenuToggle={() => setOpenMenuId(openMenuId === workflow.id ? null : workflow.id)}
                />
              ))}
            </div>
          )}
          </div>
          </div>
          </div>

          {/* Right Column - Alerts Module */}
          <div className="bg-white border border-slate-300/50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-300/50 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-slate-600" />
                <h2 className="text-xs font-medium text-slate-900 uppercase tracking-wide">
                  Alerts
                </h2>
              </div>
            </div>
            <div className="p-4 min-h-[600px]">
              {/* Empty Alerts State with Pulsing Circle */}
              <div className="text-center py-12">
                {/* Pulsing Circle with Text */}
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    className="w-4 h-4 rounded-full bg-emerald-500"
                    style={{ position: 'relative' }}
                    animate={{
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <p className="text-sm font-medium text-slate-700" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>No Alerts...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Usage Stats Modal */}
      <AnimatePresence>
        {showUsageModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUsageModal(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white border border-slate-300/50 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300/50 bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-slate-900" />
                    <h2 className="text-lg font-semibold text-slate-900">Usage & Limits</h2>
                  </div>
                  <button
                    onClick={() => setShowUsageModal(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Plan Info */}
                    {organization && (
                      <div className="pb-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600 mb-1">Current Plan</p>
                            <div className="flex items-center gap-2">
                              {organization.plan !== 'free' && <Crown className="w-4 h-4 text-amber-500" />}
                              <p className="text-lg font-semibold text-slate-900 capitalize">{organization.plan}</p>
                            </div>
                          </div>
                          <Link
                            to="/store"
                            className="text-xs font-medium text-slate-900 hover:text-slate-700 transition-colors underline"
                          >
                            View Store
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Usage Stats */}
                    {usageStats ? (
                      <div className="space-y-4">
                        <UsageStatItem
                          label="Workflows"
                          current={usageStats.workflows.current}
                          limit={usageStats.workflows.limit}
                          icon={Folder}
                        />
                        <UsageStatItem
                          label="Executions per Month"
                          current={usageStats.executionsPerMonth.current}
                          limit={usageStats.executionsPerMonth.limit}
                          icon={Play}
                        />
                        <UsageStatItem
                          label="Storage (GB)"
                          current={usageStats.storageGB.current}
                          limit={usageStats.storageGB.limit}
                          icon={Database}
                        />
                        <UsageStatItem
                          label="API Calls per Month"
                          current={usageStats.apiCallsPerMonth.current}
                          limit={usageStats.apiCallsPerMonth.limit}
                          icon={Zap}
                        />
                        <UsageStatItem
                          label="Intelligence Projects"
                          current={usageStats.intelligenceProjects.current}
                          limit={usageStats.intelligenceProjects.limit}
                          icon={Brain}
                        />
                        <UsageStatItem
                          label="Findings per Month"
                          current={usageStats.findingsPerMonth.current}
                          limit={usageStats.findingsPerMonth.limit}
                          icon={FileJson}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string | number;
  change: string;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, change, color }) => {
  return (
    <div className="bg-white border border-slate-300/50 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">{label}</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-mono font-semibold text-slate-900 mb-1">{value}</p>
        <p className="text-xs text-slate-500 font-mono">{change}</p>
      </div>
    </div>
  );
};

// Workflow Card Component
interface WorkflowCardProps {
  workflow: WorkflowListItem;
  onClick: () => void;
  onDelete: (id: string, name: string) => void;
  onShare: (id: string) => void;
  onDuplicate: (id: string) => void;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ 
  workflow, 
  onClick, 
  onDelete, 
  onShare, 
  onDuplicate,
  isMenuOpen,
  onMenuToggle
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative workflow-card-menu">
      <div
        onClick={onClick}
        className="p-3 border border-slate-300/50 hover:border-slate-900 transition-all cursor-pointer bg-white group"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-medium text-slate-900 truncate mb-0.5 uppercase tracking-wide">
              {workflow.name}
            </h3>
            {workflow.description && (
              <p className="text-xs text-slate-500 line-clamp-1 font-mono">{workflow.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <div className={clsx(
              'w-1.5 h-1.5 flex-shrink-0',
              workflow.isActive ? 'bg-slate-900' : 'bg-slate-300'
            )} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle();
              }}
              className="p-0.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 font-mono text-slate-600">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {workflow.nodeCount}
            </span>
            {workflow.lastExecuted && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(workflow.lastExecuted)}
              </span>
            )}
          </div>
          <span className={clsx(
            'px-1.5 py-0.5 text-xs font-medium font-mono border',
            workflow.isActive
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-300/50'
          )}>
            {workflow.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>

      {/* Menu Dropdown - Palantir Style */}
      {isMenuOpen && (
        <div className="absolute right-0 top-8 w-36 bg-white border border-slate-300/50 shadow-lg z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(workflow.id);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100/50 transition-colors border-b border-slate-300/50"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(workflow.id);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100/50 transition-colors border-b border-slate-300/50"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100/50 transition-colors border-b border-slate-300/50"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(workflow.id, workflow.name);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// User Menu Item Component
interface UserMenuItemProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

const UserMenuItem: React.FC<UserMenuItemProps> = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium transition-all',
      danger
        ? 'text-red-600 hover:bg-red-50'
        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
    )}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

interface UsageStatItemProps {
  label: string;
  current: number;
  limit: number | 'unlimited';
  icon: React.FC<{ className?: string }>;
}

const UsageStatItem: React.FC<UsageStatItemProps> = ({ label, current, limit, icon: Icon }) => {
  const limitValue = limit === 'unlimited' ? Infinity : limit;
  const percentage = limitValue === Infinity ? 0 : Math.min((current / limitValue) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-900">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx(
            'text-sm font-mono font-semibold',
            isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-slate-900'
          )}>
            {current}
          </span>
          <span className="text-sm text-slate-400">/</span>
          <span className="text-sm text-slate-500 font-mono">
            {limit === 'unlimited' ? '∞' : limit}
          </span>
        </div>
      </div>
      {limitValue !== Infinity && (
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all duration-300',
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-slate-900'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;


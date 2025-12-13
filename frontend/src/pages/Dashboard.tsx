/**
 * User Dashboard
 * Comprehensive dashboard with instances, alerts, and analytics
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus,
  RefreshCw, 
  Database, 
  Clock,
  BarChart3,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  Zap,
  TrendingUp,
  Activity,
  Bell,
  Settings,
  MoreVertical,
  Filter,
  ArrowRight,
  Loader2,
  Eye,
  Terminal,
  User
} from 'lucide-react';
import clsx from 'clsx';
import * as api from '../services/api';
import type { WorkflowListItem, WorkflowExecution } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [workflowsData, executionsData] = await Promise.all([
        api.getWorkflows(),
        api.getExecutions({ limit: 20 })
      ]);
      setWorkflows(workflowsData);
      setExecutions(executionsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter(w => w.isActive).length,
    totalExecutions: executions.length,
    successfulExecutions: executions.filter(e => e.status === 'success').length,
    failedExecutions: executions.filter(e => e.status === 'failed').length,
    runningExecutions: executions.filter(e => e.status === 'running').length,
  };

  const successRate = stats.totalExecutions > 0 
    ? Math.round((stats.successfulExecutions / stats.totalExecutions) * 100) 
    : 0;

  // Filter workflows
  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         w.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                        (filterStatus === 'active' && w.isActive) ||
                        (filterStatus === 'inactive' && !w.isActive);
    return matchesSearch && matchesFilter;
  });

  // Get recent alerts (failed executions, etc.)
  const alerts = executions
    .filter(e => e.status === 'failed')
    .slice(0, 5)
    .map(e => ({
      id: e.id,
      type: 'error' as const,
      message: `${e.workflowName} execution failed`,
      time: e.startTime,
      workflowId: e.workflowId,
    }));

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
    return `${days}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'running': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle2;
      case 'failed': return XCircle;
      case 'running': return Loader2;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                to="/app"
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Instance
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Zap}
            label="Total Instances"
            value={stats.totalWorkflows}
            change="+2 this week"
            color="blue"
          />
          <StatCard
            icon={Activity}
            label="Active Instances"
            value={stats.activeWorkflows}
            change={`${stats.activeWorkflows > 0 ? Math.round((stats.activeWorkflows / stats.totalWorkflows) * 100) : 0}% of total`}
            color="emerald"
          />
          <StatCard
            icon={Play}
            label="Total Executions"
            value={stats.totalExecutions}
            change="Last 30 days"
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            label="Success Rate"
            value={`${successRate}%`}
            change={stats.failedExecutions > 0 ? `${stats.failedExecutions} failed` : 'All good'}
            color={successRate >= 90 ? 'emerald' : successRate >= 70 ? 'amber' : 'red'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Alerts Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  Alerts
                </h2>
                {alerts.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                    {alerts.length}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
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
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                      onClick={() => navigate(`/app/${alert.workflowId}`)}
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-red-900">{alert.message}</p>
                          <p className="text-xs text-red-600">{formatTime(alert.time)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Recent Activity
                </h2>
                <Link
                  to="/app"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {executions.length === 0 ? (
                  <div className="text-center py-12">
                    <Play className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No executions yet</p>
                    <p className="text-xs text-slate-400 mt-1">Run a workflow to see activity</p>
                  </div>
                ) : (
                  executions.slice(0, 8).map((execution) => {
                    const StatusIcon = getStatusIcon(execution.status);
                    return (
                      <div
                        key={execution.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/app/${execution.workflowId}`)}
                      >
                        <div className={clsx(
                          'w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0',
                          getStatusColor(execution.status)
                        )}>
                          <StatusIcon className={clsx(
                            'w-4 h-4',
                            execution.status === 'running' && 'animate-spin'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {execution.workflowName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatTime(execution.startTime)} • {execution.triggeredBy}
                          </p>
                        </div>
                        {execution.duration && (
                          <span className="text-xs text-slate-500">
                            {execution.duration}ms
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* All Instances Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-1">
                <Database className="w-5 h-5 text-blue-500" />
                All Instances
              </h2>
              <p className="text-sm text-slate-500">
                {filteredWorkflows.length} {filteredWorkflows.length === 1 ? 'instance' : 'instances'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {(['all', 'active', 'inactive'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={clsx(
                      'px-3 py-1 text-xs font-medium rounded transition-colors',
                      filterStatus === status
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    )}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search instances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium mb-1">No instances found</p>
              <p className="text-sm text-slate-400 mb-4">
                {searchQuery ? 'Try a different search term' : 'Create your first workflow instance'}
              </p>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Instance
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onClick={() => navigate(`/app/${workflow.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
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
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
        <p className="text-sm text-slate-600 mb-1">{label}</p>
        <p className="text-xs text-slate-500">{change}</p>
      </div>
    </div>
  );
};

// Workflow Card Component
interface WorkflowCardProps {
  workflow: WorkflowListItem;
  onClick: () => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, onClick }) => {
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
    <div
      onClick={onClick}
      className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 truncate mb-1">
            {workflow.name}
          </h3>
          {workflow.description && (
            <p className="text-xs text-slate-500 line-clamp-2">{workflow.description}</p>
          )}
        </div>
        <div className={clsx(
          'w-2 h-2 rounded-full flex-shrink-0 mt-1 ml-2',
          workflow.isActive ? 'bg-emerald-500' : 'bg-slate-300'
        )} />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {workflow.nodeCount} nodes
          </span>
          {workflow.lastExecuted && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(workflow.lastExecuted)}
            </span>
          )}
        </div>
        <span className={clsx(
          'px-2 py-0.5 rounded text-xs font-medium',
          workflow.isActive
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-slate-100 text-slate-600'
        )}>
          {workflow.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;

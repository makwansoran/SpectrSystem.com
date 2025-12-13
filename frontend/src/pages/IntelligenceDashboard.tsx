/**
 * Intel Dashboard
 * Central hub for OSINT/GEOINT investigations and findings
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Map,
  Clock,
  TrendingUp,
  AlertCircle,
  Database,
  Globe,
  User,
  Building2,
  Plus,
  RefreshCw,
  Eye,
  Download,
  BarChart3,
  Activity,
  Zap,
  LayoutDashboard,
  PlusCircle,
  X,
  GripVertical
} from 'lucide-react';
import clsx from 'clsx';
import * as api from '../services/api';
import type { IntelligenceProject, IntelligenceFinding } from '../types';

interface DashboardField {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const IntelligenceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<IntelligenceProject[]>([]);
  const [findings, setFindings] = useState<IntelligenceFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'findings' | 'map' | 'dashboard'>('overview');
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [dashboardFields, setDashboardFields] = useState<DashboardField[]>([]);
  const [resizingField, setResizingField] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsData, findingsData] = await Promise.all([
        api.getIntelligenceProjects(),
        api.getIntelligenceFindings()
      ]);
      setProjects(projectsData);
      setFindings(findingsData);
    } catch (err) {
      console.error('Failed to fetch intelligence data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalFindings: findings.length,
    recentFindings: findings.filter(f => {
      const date = new Date(f.timestamp);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return date > dayAgo;
    }).length,
  };

  const filteredFindings = findings.filter(f => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      f.source.toLowerCase().includes(query) ||
      JSON.stringify(f.data).toLowerCase().includes(query) ||
      f.entities.some(e => e.value.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-300/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-300/50 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xs font-medium text-slate-900 tracking-tight uppercase">Intel Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/app"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all uppercase tracking-tight border border-slate-900"
              >
                <Plus className="w-3.5 h-3.5" />
                New Investigation
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-slate-300/50">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'projects', label: 'Projects', icon: Database },
            { id: 'findings', label: 'Findings', icon: Eye },
            { id: 'map', label: 'Map', icon: Map },
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition-colors uppercase tracking-tight',
                  activeTab === tab.id
                    ? 'border-slate-900 text-slate-900 bg-slate-900 text-white border-t-2 border-l border-r border-slate-300/50 border-t-slate-900 rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Database}
                label="Total Projects"
                value={stats.totalProjects}
                change="+2 this week"
                color="blue"
              />
              <StatCard
                icon={Activity}
                label="Active Projects"
                value={stats.activeProjects}
                change={`${stats.activeProjects > 0 ? Math.round((stats.activeProjects / stats.totalProjects) * 100) : 0}% of total`}
                color="emerald"
              />
              <StatCard
                icon={Eye}
                label="Total Findings"
                value={stats.totalFindings}
                change="Last 30 days"
                color="purple"
              />
              <StatCard
                icon={TrendingUp}
                label="Recent Findings"
                value={stats.recentFindings}
                change="Last 24 hours"
                color="amber"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-slate-300/50 p-6">
                <h2 className="text-xs font-medium text-slate-900 tracking-tight uppercase mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-900" />
                  Recent Findings
                </h2>
                <div className="space-y-3">
                  {findings.slice(0, 5).length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8 font-mono">
                      No findings yet. Run an intelligence workflow to collect data.
                    </p>
                  ) : (
                    findings.slice(0, 5).map((finding) => (
                      <div
                        key={finding.id}
                        className="p-3 border border-slate-300/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/intel/findings/${finding.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-900 uppercase tracking-tight font-mono">{finding.source}</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-mono">
                              {new Date(finding.timestamp).toLocaleString()}
                            </p>
                            {finding.entities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {finding.entities.slice(0, 3).map((entity, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 text-[10px] bg-slate-100/50 text-slate-900 rounded-lg border border-slate-300/50 font-mono uppercase tracking-tight"
                                  >
                                    {entity.type}: {entity.value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {finding.geolocation && (
                              <Map className="w-3.5 h-3.5 text-slate-900" />
                            )}
                            <span className="text-[10px] text-slate-600 font-mono">
                              {Math.round(finding.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-300/50 p-6">
                <h2 className="text-xs font-medium text-slate-900 tracking-tight uppercase mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-900" />
                  Active Projects
                </h2>
                <div className="space-y-3">
                  {projects.filter(p => p.status === 'active').slice(0, 5).length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8 font-mono">
                      No active projects. Create a new investigation to get started.
                    </p>
                  ) : (
                    projects.filter(p => p.status === 'active').slice(0, 5).map((project) => (
                      <div
                        key={project.id}
                        className="p-3 border border-slate-300/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/intel/projects/${project.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-900 uppercase tracking-tight font-mono">{project.name}</p>
                            {project.description && (
                              <p className="text-[10px] text-slate-500 mt-1 font-mono">{project.description}</p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-2 font-mono">
                              {project.findings.length} findings
                            </p>
                          </div>
                          <span className="px-2 py-0.5 text-[10px] bg-slate-100/50 text-slate-900 rounded-lg border border-slate-300/50 font-mono uppercase tracking-tight">
                            Active
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-lg border border-slate-300/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-medium text-slate-900 tracking-tight uppercase">All Projects</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete all projects? This action cannot be undone.')) {
                      try {
                        await api.deleteAllIntelligenceProjects();
                        await fetchData();
                      } catch (err) {
                        console.error('Failed to delete projects:', err);
                        alert('Failed to delete projects');
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all uppercase tracking-tight border border-red-600"
                >
                  Delete All
                </button>
                <button 
                  onClick={() => setShowCreateProjectModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all uppercase tracking-tight border border-slate-900"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Project
                </button>
              </div>
            </div>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-xs font-medium text-slate-600 mb-1 uppercase tracking-tight font-mono">No projects yet</p>
                <p className="text-[10px] text-slate-400 mb-4 font-mono">Create your first investigation project</p>
                <button 
                  onClick={() => setShowCreateProjectModal(true)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all uppercase tracking-tight border border-slate-900"
                >
                  Create Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 border border-slate-300/50 rounded-lg hover:border-slate-900 hover:bg-slate-100/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/intel/projects/${project.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xs font-medium text-slate-900 uppercase tracking-tight font-mono">{project.name}</h3>
                      <span
                        className={clsx(
                          'px-2 py-0.5 text-[10px] rounded-lg border font-mono uppercase tracking-tight',
                          project.status === 'active'
                            ? 'bg-slate-100/50 text-slate-900 border-slate-300/50'
                            : project.status === 'archived'
                            ? 'bg-slate-100/50 text-slate-600 border-slate-300/50'
                            : 'bg-red-50 text-red-600 border-red-200'
                        )}
                      >
                        {project.status}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-[10px] text-slate-500 mb-3 line-clamp-2 font-mono">{project.description}</p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{project.findings.length} findings</span>
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Findings Tab */}
        {activeTab === 'findings' && (
          <div className="bg-white rounded-lg border border-slate-300/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search findings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-300/50 rounded-lg text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                  />
                </div>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-slate-300/50 rounded-lg hover:bg-slate-100/50 transition-all uppercase tracking-tight text-slate-900">
                <Filter className="w-3.5 h-3.5" />
                Filter
              </button>
            </div>
            {filteredFindings.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-xs font-medium text-slate-600 mb-1 uppercase tracking-tight font-mono">No findings found</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {searchQuery ? 'Try a different search term' : 'Run intelligence workflows to collect data'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFindings.map((finding) => (
                  <div
                    key={finding.id}
                    className="p-4 border border-slate-300/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/intel/findings/${finding.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-900 uppercase tracking-tight font-mono">{finding.source}</p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">
                          {new Date(finding.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {finding.geolocation && (
                          <Map className="w-3.5 h-3.5 text-slate-900" title="Has geolocation" />
                        )}
                        <span className="text-[10px] text-slate-600 font-mono">
                          {Math.round(finding.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    {finding.entities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {finding.entities.map((entity, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-[10px] bg-slate-100/50 text-slate-900 rounded-lg border border-slate-300/50 font-mono uppercase tracking-tight"
                          >
                            <span className="font-medium">{entity.type}:</span> {entity.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="bg-white rounded-lg border border-slate-300/50 p-6">
            <div className="h-[600px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-300/50">
              <div className="text-center">
                <Map className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-xs font-medium text-slate-600 mb-1 uppercase tracking-tight font-mono">Map Visualization</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Map view will display geolocated findings
                </p>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">
                  (Map integration coming soon)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab - Projection Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Add Field Button */}
            <div className="flex items-center justify-end">
              <button
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all uppercase tracking-tight border border-slate-900"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Field
              </button>
            </div>

            {/* Dashboard Content */}
            <div className="bg-white rounded-lg border border-slate-300/50 p-6">
              <div className="h-[600px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-300/50">
                <div className="text-center">
                  <LayoutDashboard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-xs font-medium text-slate-600 mb-1 uppercase tracking-tight font-mono">Projection Dashboard</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    View and manage workflow projections and analytics
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono">
                    (Projection dashboard coming soon)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateProjectModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateProjectModal(false)}
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
              <div className="bg-white border border-slate-300/50 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300/50 bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-slate-900" />
                    <h2 className="text-lg font-semibold text-slate-900 uppercase tracking-tight">Create Project</h2>
                  </div>
                  <button
                    onClick={() => setShowCreateProjectModal(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {/* Placeholder content - will be customized later */}
                    <p className="text-sm text-slate-600 font-mono">
                      Project creation form will be added here.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-300/50 bg-slate-50/30">
                  <button
                    onClick={() => setShowCreateProjectModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-all uppercase tracking-tight border border-slate-300/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Placeholder - will be implemented later
                      setShowCreateProjectModal(false);
                    }}
                    className="px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all uppercase tracking-tight border border-slate-900"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string | number;
  change: string;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, change, color }) => {
  const colorClasses = {
    blue: 'bg-slate-100/50 text-slate-900 border-slate-300/50',
    emerald: 'bg-slate-100/50 text-slate-900 border-slate-300/50',
    purple: 'bg-slate-100/50 text-slate-900 border-slate-300/50',
    amber: 'bg-slate-100/50 text-slate-900 border-slate-300/50',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-300/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center border', colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900 mb-1 font-mono">{value}</p>
        <p className="text-xs text-slate-600 mb-1 uppercase tracking-tight font-mono">{label}</p>
        <p className="text-[10px] text-slate-500 font-mono">{change}</p>
      </div>
    </div>
  );
};

export default IntelligenceDashboard;

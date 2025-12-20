/**
 * Admin Page
 * Management interface for users, statistics, and datasets
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  BarChart3,
  Database,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  Eye,
  EyeOff,
  Plus,
  Loader2,
  TrendingUp,
  Building2,
  FileText,
  Play,
  DollarSign,
  Calendar,
  Mail,
  User as UserIcon,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Globe,
  Folder,
} from 'lucide-react';
import clsx from 'clsx';
import { useUserStore } from '../stores/userStore';
import * as adminApi from '../services/adminApi';
import type { AdminUser, AdminStats, Dataset } from '../services/adminApi';
import Sidebar from '../components/Sidebar';

type Tab = 'overview' | 'users' | 'stats' | 'datasets';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useUserStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Overview state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingOverviewStats, setLoadingOverviewStats] = useState(true);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersSearch, setUsersSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'user',
    emailVerified: false,
  });
  const [userGrowth, setUserGrowth] = useState<Array<{ date: string; count: number }>>([]);
  const [loadingUserStats, setLoadingUserStats] = useState(false);

  // Datasets state
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [datasetForm, setDatasetForm] = useState({
    name: '',
    description: '',
    category: '',
    type: 'live' as 'live' | 'dataset',
    price: 0,
    featured: false,
    formats: [] as string[],
    size: '',
    icon: '',
    features: [] as string[],
    isActive: true,
    isPublic: false, // Security: Only public datasets appear in Spectr Live Data node
    dataSourceType: 'api' as 'api' | 'folder', // How data is provided
    apiEndpoint: '', // For API data source
    apiMethod: 'GET' as 'GET' | 'POST',
    apiHeaders: '',
    folderPath: '', // For folder import
    filePattern: '', // e.g., *.csv, *.json
  });
  const [datasetTab, setDatasetTab] = useState<'api' | 'folder'>('api');
  const [datasetType, setDatasetType] = useState<'custom' | 'company-intelligence'>('custom');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    fetchOverviewStats();
    
    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'users', 'stats', 'datasets'].includes(tabParam)) {
      setActiveTab(tabParam as Tab);
    }
  }, [isAuthenticated, navigate, searchParams]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'datasets') {
      fetchDatasets();
    } else if (activeTab === 'stats') {
      fetchUserGrowth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, usersPage]);

  useEffect(() => {
    if (activeTab === 'users' && usersSearch) {
      const timer = setTimeout(() => {
        setUsersPage(1);
        fetchUsers();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersSearch, activeTab]);

  const fetchOverviewStats = async () => {
    try {
      setLoadingOverviewStats(true);
      const response = await adminApi.getOverviewStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingOverviewStats(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await adminApi.getUsers(usersPage, 50, usersSearch);
      if (response.success) {
        setUsers(response.data.users);
        setUsersTotal(response.data.pagination.total);
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      alert(error.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserGrowth = async () => {
    try {
      setLoadingUserStats(true);
      const response = await adminApi.getUserStats(30);
      if (response.success) {
        setUserGrowth(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user growth:', error);
    } finally {
      setLoadingUserStats(false);
    }
  };

  const fetchDatasets = async () => {
    try {
      setLoadingDatasets(true);
      const response = await adminApi.getDatasets();
      if (response.success) {
        setDatasets(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    } finally {
      setLoadingDatasets(false);
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    try {
      await adminApi.updateUser(selectedUser.id, userForm);
      setShowUserModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      alert(error.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminApi.deleteUser(id);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleVerifyEmail = async (id: string) => {
    try {
      await adminApi.verifyUserEmail(id);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to verify email:', error);
      alert(error.response?.data?.error || 'Failed to verify email');
    }
  };

  const handleSaveDataset = async () => {
    if (!datasetForm.name || !datasetForm.category) {
      alert('Name and category are required');
      return;
    }
    
    // Validate data source based on selected type and tab
    if (datasetType === 'company-intelligence') {
      // Company intelligence is pre-configured, no additional validation needed
    } else if (datasetTab === 'api' && !datasetForm.apiEndpoint) {
      alert('API Endpoint is required for API data source');
      return;
    } else if (datasetTab === 'folder' && !datasetForm.folderPath) {
      alert('Folder Path is required for folder import');
      return;
    }
    
    try {
      // Include data source config in the dataset
      const datasetData = {
        ...datasetForm,
        dataSourceType: datasetType === 'company-intelligence' ? 'company' : datasetTab,
        config: {
          dataSourceType: datasetType === 'company-intelligence' ? 'company' : datasetTab,
          ...(datasetType === 'company-intelligence' ? {
            // Company intelligence - uses built-in API
            apiEndpoint: '/api/companies',
            apiMethod: 'GET',
            systemType: 'company-intelligence',
          } : datasetTab === 'api' ? {
            apiEndpoint: datasetForm.apiEndpoint,
            apiMethod: datasetForm.apiMethod,
            apiHeaders: datasetForm.apiHeaders,
          } : {
            folderPath: datasetForm.folderPath,
            filePattern: datasetForm.filePattern,
          }),
        },
      };
      
      if (editingDataset) {
        await adminApi.updateDataset(editingDataset.id, datasetData);
      } else {
        await adminApi.createDataset(datasetData);
      }
      setShowDatasetModal(false);
      setEditingDataset(null);
      setDatasetForm({
        name: '',
        description: '',
        category: '',
        type: 'live',
        price: 0,
        featured: false,
        formats: [],
        size: '',
        icon: '',
        features: [],
        isActive: true,
        isPublic: false,
        dataSourceType: 'api',
        apiEndpoint: '',
        apiMethod: 'GET',
        apiHeaders: '',
        folderPath: '',
        filePattern: '',
      });
      setDatasetTab('api');
      setDatasetType('custom');
      fetchDatasets();
    } catch (error: any) {
      console.error('Failed to save dataset:', error);
      alert(error.response?.data?.error || 'Failed to save dataset');
    }
  };

  const handleAddFormat = () => {
    const format = prompt('Enter format (e.g., JSON, CSV, XML):');
    if (format && format.trim()) {
      setDatasetForm({
        ...datasetForm,
        formats: [...datasetForm.formats, format.trim()],
      });
    }
  };

  const handleRemoveFormat = (index: number) => {
    setDatasetForm({
      ...datasetForm,
      formats: datasetForm.formats.filter((_, i) => i !== index),
    });
  };

  const handleAddFeature = () => {
    const feature = prompt('Enter feature:');
    if (feature && feature.trim()) {
      setDatasetForm({
        ...datasetForm,
        features: [...datasetForm.features, feature.trim()],
      });
    }
  };

  const handleRemoveFeature = (index: number) => {
    setDatasetForm({
      ...datasetForm,
      features: datasetForm.features.filter((_, i) => i !== index),
    });
  };

  const handleEditDataset = (dataset: Dataset) => {
    setEditingDataset(dataset);
    const config = (dataset as any).config || {};
    const dataSourceType = config.dataSourceType || 'api';
    const isCompanyIntelligence = config.systemType === 'company-intelligence';
    
    setDatasetForm({
      name: dataset.name,
      description: dataset.description || '',
      category: dataset.category,
      type: dataset.type,
      price: dataset.price,
      featured: dataset.featured,
      formats: dataset.formats || [],
      size: dataset.size || '',
      icon: dataset.icon || '',
      features: dataset.features || [],
      isActive: dataset.isActive,
      isPublic: (dataset as any).isPublic !== false,
      dataSourceType: dataSourceType === 'company' ? 'api' : dataSourceType,
      apiEndpoint: config.apiEndpoint || '',
      apiMethod: config.apiMethod || 'GET',
      apiHeaders: config.apiHeaders || '',
      folderPath: config.folderPath || '',
      filePattern: config.filePattern || '',
    });
    setDatasetTab(dataSourceType === 'company' ? 'api' : (dataSourceType === 'folder' ? 'folder' : 'api'));
    setDatasetType(isCompanyIntelligence ? 'company-intelligence' : 'custom');
    setShowDatasetModal(true);
  };

  // Handle edit from URL parameter
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && activeTab === 'datasets' && datasets.length > 0 && !editingDataset) {
      const datasetToEdit = datasets.find(d => d.id === editId);
      if (datasetToEdit) {
        handleEditDataset(datasetToEdit);
        // Remove edit parameter from URL
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('edit');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [activeTab, datasets, searchParams, editingDataset]);

  const handleDeleteDataset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dataset?')) return;
    try {
      await adminApi.deleteDataset(id);
      fetchDatasets();
    } catch (error) {
      console.error('Failed to delete dataset:', error);
      alert('Failed to delete dataset');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await adminApi.toggleDatasetFeatured(id);
      fetchDatasets();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await adminApi.toggleDatasetActive(id);
      fetchDatasets();
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex">
      <Sidebar activePage="admin" />
      <div className="flex-1 ml-[64px]">
      {/* Header - Palantir Style */}
      <header className="bg-white border-b border-slate-300/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-1.5">
              <img src="/EyelogoBlack.png" alt="SPECTR SYSTEM" className="h-12 w-auto" />
              <h1 className="text-base font-medium text-slate-900 tracking-tight uppercase">
                SPECTR SYSTEM / admin
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-300/50 bg-white">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex space-x-1">
            {[
              { id: 'overview' as Tab, label: 'Overview', icon: BarChart3 },
              { id: 'users' as Tab, label: 'Users', icon: Users },
              { id: 'stats' as Tab, label: 'Statistics', icon: TrendingUp },
              { id: 'datasets' as Tab, label: 'Datasets', icon: Database },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-6 py-4 border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {loadingOverviewStats ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={Users}
                  label="Total Users"
                  value={stats.totalUsers}
                  subtitle={`${stats.verifiedUsers} verified`}
                  color="blue"
                />
                <StatCard
                  icon={Building2}
                  label="Organizations"
                  value={stats.totalOrganizations}
                  color="green"
                />
                <StatCard
                  icon={FileText}
                  label="Workflows"
                  value={stats.totalWorkflows}
                  color="purple"
                />
                <StatCard
                  icon={Play}
                  label="Executions"
                  value={stats.totalExecutions}
                  color="orange"
                />
                <StatCard
                  icon={Database}
                  label="Datasets"
                  value={stats.totalDatasets}
                  color="cyan"
                />
              </div>
            ) : (
              <div className="text-center text-slate-600">Failed to load statistics</div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={usersSearch}
                  onChange={(e) => {
                    setUsersSearch(e.target.value);
                    setUsersPage(1);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') fetchUsers();
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded transition-colors"
              >
                Refresh
              </button>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
              </div>
            ) : (
              <>
                <div className="bg-white border border-slate-300/50 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Organization</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-slate-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                <div className="text-xs text-slate-500">{user.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.emailVerified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                                <XCircle className="w-3 h-3" />
                                Unverified
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            <div>{user.organizationName || 'N/A'}</div>
                            <div className="text-xs text-slate-500">{user.organizationPlan || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-1 hover:bg-slate-200 rounded text-slate-700"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {!user.emailVerified && (
                                <button
                                  onClick={() => handleVerifyEmail(user.id)}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-700"
                                  title="Verify Email"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {usersTotal > 50 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-600">
                      Showing {(usersPage - 1) * 50 + 1} to {Math.min(usersPage * 50, usersTotal)} of {usersTotal} users
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                        disabled={usersPage === 1}
                        className="px-3 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <span className="text-sm text-slate-600">
                        Page {usersPage} of {Math.ceil(usersTotal / 50)}
                      </span>
                      <button
                        onClick={() => setUsersPage(p => p + 1)}
                        disabled={usersPage >= Math.ceil(usersTotal / 50)}
                        className="px-3 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {loadingUserStats ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
              </div>
            ) : (
              <>
                {/* User Growth Chart */}
                <div className="bg-white border border-slate-300/50 p-6">
                  <h3 className="text-xl font-medium text-slate-900 mb-4">User Growth (Last 30 Days)</h3>
                  {userGrowth.length > 0 ? (
                    <div className="h-64 flex items-end justify-between gap-2">
                      {userGrowth.map((item, index) => {
                        const maxCount = Math.max(...userGrowth.map(d => d.count), 1);
                        const height = (item.count / maxCount) * 100;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-full h-48 bg-slate-100 rounded-t overflow-hidden">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className="absolute bottom-0 w-full bg-slate-900"
                              />
                            </div>
                            <div className="text-xs text-slate-600 text-center">
                              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs font-medium text-slate-900">{item.count}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-slate-600 py-12">No data available</div>
                  )}
                </div>

                {/* Plan Distribution */}
                {stats && stats.planDistribution && stats.planDistribution.length > 0 && (
                  <div className="bg-white border border-slate-300/50 p-6">
                    <h3 className="text-xl font-medium text-slate-900 mb-4">Plan Distribution</h3>
                    <div className="space-y-4">
                      {stats.planDistribution.map((plan, index) => {
                        const total = stats.planDistribution.reduce((sum, p) => sum + p.count, 0);
                        const percentage = (plan.count / total) * 100;
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-900 capitalize">{plan.plan || 'Unknown'}</span>
                              <span className="text-sm text-slate-600">{plan.count} organizations ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="h-full bg-slate-900"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Datasets Tab */}
        {activeTab === 'datasets' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium text-slate-900">Datasets</h2>
              <button
                onClick={() => {
                  setEditingDataset(null);
                  setDatasetForm({
                    name: '',
                    description: '',
                    category: '',
                    type: 'live',
                    price: 0,
                    featured: false,
                    formats: [],
                    size: '',
                    icon: '',
                    features: [],
                    isActive: true,
                  });
                  setShowDatasetModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Dataset
              </button>
            </div>

            {loadingDatasets ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {datasets.map((dataset) => (
                  <motion.div
                    key={dataset.id}
                    className="bg-white border border-slate-300/50 p-6 hover:border-slate-900 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-slate-900">{dataset.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{dataset.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {dataset.featured && (
                          <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                        )}
                        {dataset.isActive ? (
                          <Eye className="w-5 h-5 text-green-600" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 mb-4 line-clamp-2">{dataset.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-medium text-slate-900">${dataset.price}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditDataset(dataset)}
                          className="p-2 hover:bg-slate-100 rounded text-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(dataset.id)}
                          className="p-2 hover:bg-slate-100 rounded text-slate-700"
                        >
                          <Star className={clsx('w-4 h-4', dataset.featured && 'fill-yellow-600 text-yellow-600')} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(dataset.id)}
                          className="p-2 hover:bg-slate-100 rounded text-slate-700"
                        >
                          {dataset.isActive ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteDataset(dataset.id)}
                          className="p-2 hover:bg-red-100 rounded text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Dataset Modal */}
      {showDatasetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg border border-slate-300/50 p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-medium text-slate-900 mb-6">
              {editingDataset ? 'Edit Dataset' : 'Create Dataset'}
            </h2>
            
            {/* Data Source Type Tabs - Only show for custom datasets */}
            {datasetType === 'custom' && (
              <div className="mb-6 border-b border-slate-200">
                <div className="flex gap-2">
                  <button
                    onClick={() => setDatasetTab('api')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                      datasetTab === 'api'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      API Data Source
                    </div>
                  </button>
                  <button
                    onClick={() => setDatasetTab('folder')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                      datasetTab === 'folder'
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      Folder Import
                    </div>
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900">Name</label>
                <input
                  type="text"
                  value={datasetForm.name}
                  onChange={(e) => setDatasetForm({ ...datasetForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900">Description</label>
                <textarea
                  value={datasetForm.description}
                  onChange={(e) => setDatasetForm({ ...datasetForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900">Category</label>
                  <input
                    type="text"
                    value={datasetForm.category}
                    onChange={(e) => setDatasetForm({ ...datasetForm, category: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900">Type</label>
                  <select
                    value={datasetForm.type}
                    onChange={(e) => setDatasetForm({ ...datasetForm, type: e.target.value as 'live' | 'dataset' })}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  >
                    <option value="live">Live</option>
                    <option value="dataset">Dataset</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900">Price</label>
                <input
                  type="number"
                  value={datasetForm.price}
                  onChange={(e) => setDatasetForm({ ...datasetForm, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900">Size</label>
                <input
                  type="text"
                  value={datasetForm.size}
                  onChange={(e) => setDatasetForm({ ...datasetForm, size: e.target.value })}
                  placeholder="e.g., 10M+ records, Live Stream"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900">Icon URL</label>
                <input
                  type="text"
                  value={datasetForm.icon}
                  onChange={(e) => setDatasetForm({ ...datasetForm, icon: e.target.value })}
                  placeholder="https://example.com/icon.png"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900">Formats</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {datasetForm.formats.map((format, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {format}
                      <button
                        onClick={() => handleRemoveFormat(index)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={handleAddFormat}
                  className="px-3 py-1 text-sm bg-slate-900 text-white hover:bg-slate-800 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Format
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900">Features</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {datasetForm.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {feature}
                      <button
                        onClick={() => handleRemoveFeature(index)}
                        className="hover:text-purple-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={handleAddFeature}
                  className="px-3 py-1 text-sm bg-slate-900 text-white hover:bg-slate-800 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>
              {/* Data Source Configuration */}
              {datasetType === 'company-intelligence' ? (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Company Intelligence Configuration</h3>
                  <div className="p-3 bg-white rounded border border-blue-200">
                    <p className="text-xs font-medium text-slate-900 mb-2">Pre-configured API Endpoint:</p>
                    <code className="block text-xs bg-slate-100 px-3 py-2 rounded font-mono text-slate-800">
                      /api/companies
                    </code>
                  </div>
                  <div className="p-3 bg-white rounded border border-blue-200">
                    <p className="text-xs font-medium text-slate-900 mb-2">Available Operations:</p>
                    <ul className="text-[10px] text-slate-700 space-y-1 list-disc list-inside">
                      <li><code>GET /api/companies</code> - List all companies</li>
                      <li><code>GET /api/companies/:id</code> - Get company details</li>
                      <li><code>GET /api/companies/:id/audit</code> - Full provenance trail</li>
                      <li><code>POST /api/companies</code> - Create company (requires source)</li>
                      <li><code>POST /api/companies/:id/financials</code> - Add financial data</li>
                      <li><code>POST /api/companies/:id/relationships</code> - Add relationships</li>
                    </ul>
                  </div>
                  <div className="p-2 bg-amber-50 rounded border border-amber-200">
                    <p className="text-[10px] text-amber-800">
                      <strong>Note:</strong> All company data requires source_name and source_url. Historical data is never overwritten.
                    </p>
                  </div>
                </div>
              ) : datasetTab === 'api' && (
                <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">API Configuration</h3>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-900">API Endpoint URL *</label>
                    <input
                      type="text"
                      value={datasetForm.apiEndpoint}
                      onChange={(e) => setDatasetForm({ ...datasetForm, apiEndpoint: e.target.value })}
                      placeholder="https://api.example.com/data"
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-1">The API endpoint that provides the dataset data</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-900">HTTP Method</label>
                    <select
                      value={datasetForm.apiMethod}
                      onChange={(e) => setDatasetForm({ ...datasetForm, apiMethod: e.target.value as 'GET' | 'POST' })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-900">API Headers (JSON)</label>
                    <textarea
                      value={datasetForm.apiHeaders}
                      onChange={(e) => setDatasetForm({ ...datasetForm, apiHeaders: e.target.value })}
                      placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                      rows={3}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-mono text-xs"
                    />
                    <p className="text-xs text-slate-500 mt-1">Optional: JSON object with headers for API requests</p>
                  </div>
                </div>
              )}

              {datasetTab === 'folder' && (
                <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Folder Import Configuration</h3>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-900">Folder Path *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={datasetForm.folderPath}
                        onChange={(e) => setDatasetForm({ ...datasetForm, folderPath: e.target.value })}
                        placeholder="/data/datasets/my-dataset or C:\Data\Datasets\MyDataset"
                        className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                      />
                      <input
                        type="file"
                        id="folder-picker"
                        webkitdirectory=""
                        directory=""
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            // Get the folder path from the first file
                            const firstFile = files[0];
                            const relativePath = (firstFile as any).webkitRelativePath || '';
                            
                            if (relativePath) {
                              // Extract folder path from relative path
                              const folderPath = relativePath.substring(0, relativePath.indexOf('/'));
                              
                              // Try to get the full path (works in some browsers)
                              const fullPath = (firstFile as any).path || '';
                              
                              if (fullPath) {
                                // Extract folder from full path
                                const lastSeparator = Math.max(
                                  fullPath.lastIndexOf('\\'),
                                  fullPath.lastIndexOf('/')
                                );
                                if (lastSeparator > 0) {
                                  const folderFromPath = fullPath.substring(0, lastSeparator);
                                  setDatasetForm({ ...datasetForm, folderPath: folderFromPath });
                                  return;
                                }
                              }
                              
                              // If we can't get full path, show helpful message
                              const message = `Selected folder: ${folderPath}\n\n` +
                                `Browser security prevents automatic full path detection.\n` +
                                `Please enter the full folder path manually below.\n\n` +
                                `Example: C:\\Users\\YourName\\Documents\\${folderPath}`;
                              
                              alert(message);
                            } else {
                              // Fallback: prompt for path
                              const userPath = prompt(
                                'Please enter the full folder path:\n\n' +
                                'Example: C:\\Users\\YourName\\Documents\\MyData',
                                datasetForm.folderPath || ''
                              );
                              if (userPath) {
                                setDatasetForm({ ...datasetForm, folderPath: userPath });
                              }
                            }
                          }
                          // Reset input
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('folder-picker') as HTMLInputElement;
                          if (input) {
                            input.click();
                          }
                        }}
                        className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <Folder className="w-4 h-4" />
                        Browse Folder
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Path to the folder containing dataset files. Click "Browse Folder" to select a folder.
                    </p>
                    {datasetForm.folderPath && (
                      <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
                        <strong>Selected:</strong> {datasetForm.folderPath}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-900">File Pattern (Optional)</label>
                    <input
                      type="text"
                      value={datasetForm.filePattern}
                      onChange={(e) => setDatasetForm({ ...datasetForm, filePattern: e.target.value })}
                      placeholder="*.csv, *.json, data_*.txt"
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-1">File pattern to match (e.g., *.csv, *.json). Leave empty to import all files.</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                <label className="flex items-center gap-2 text-slate-900">
                  <input
                    type="checkbox"
                    checked={datasetForm.featured}
                    onChange={(e) => setDatasetForm({ ...datasetForm, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-slate-900">
                  <input
                    type="checkbox"
                    checked={datasetForm.isActive}
                    onChange={(e) => setDatasetForm({ ...datasetForm, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-slate-900">
                  <input
                    type="checkbox"
                    checked={datasetForm.isPublic}
                    onChange={(e) => setDatasetForm({ ...datasetForm, isPublic: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="flex items-center gap-1">
                    Public
                    <span className="text-xs text-slate-500">(Visible in Spectr Live Data node)</span>
                  </span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowDatasetModal(false);
                  setEditingDataset(null);
                }}
                className="px-4 py-2 bg-slate-200 text-slate-900 hover:bg-slate-300 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDataset}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg border border-slate-300/50 p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-medium text-slate-900 mb-6">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900">Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-900">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={userForm.emailVerified}
                  onChange={(e) => setUserForm({ ...userForm, emailVerified: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-slate-900">Email Verified</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-slate-200 text-slate-900 hover:bg-slate-300 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.FC<{ className?: string }>;
  label: string;
  value: number;
  subtitle?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'cyan';
}> = ({ icon: Icon, label, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    cyan: 'bg-cyan-100 text-cyan-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-300/50 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{label}</p>
          <p className="text-3xl font-medium text-slate-900">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={clsx('p-3 rounded-lg', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPage;


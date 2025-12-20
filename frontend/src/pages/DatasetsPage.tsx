/**
 * Datasets Management Page
 * Manage all datasets - publish, edit, or remove them
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Database,
  Search,
  Filter,
  Globe,
  Folder,
  Building2,
  Eye,
  EyeOff,
  ShoppingBag,
  Loader2,
  X,
  CheckCircle2,
  Star,
  Edit,
  Trash2,
  Plus,
  Save,
} from 'lucide-react';
import clsx from 'clsx';
import * as adminApi from '../services/adminApi';
import type { Dataset } from '../services/adminApi';
import Sidebar from '../components/Sidebar';

const DatasetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'live' | 'dataset'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDatasets();
      if (response.success && response.data) {
        // Show ALL datasets (not just public ones) for management
        setDatasets(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(datasets.map(d => d.category)))];

  // Filter datasets
  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dataset.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dataset.category === selectedCategory;
    const matchesType = selectedType === 'all' || dataset.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleTogglePublic = async (datasetId: string, currentStatus: boolean) => {
    try {
      const dataset = datasets.find(d => d.id === datasetId);
      if (!dataset) return;
      
      // Update locally first for instant feedback
      setDatasets(datasets.map(d => 
        d.id === datasetId ? { ...d, isPublic: !currentStatus } as any : d
      ));
      
      // Update via API
      await adminApi.updateDataset(datasetId, { isPublic: !currentStatus });
      await fetchDatasets(); // Refresh to get latest data
    } catch (error) {
      console.error('Failed to toggle public status:', error);
      await fetchDatasets(); // Refresh on error
    }
  };

  const handleToggleActive = async (datasetId: string, currentStatus: boolean) => {
    try {
      const dataset = datasets.find(d => d.id === datasetId);
      if (!dataset) return;
      
      setDatasets(datasets.map(d => 
        d.id === datasetId ? { ...d, isActive: !currentStatus } as any : d
      ));
      
      await adminApi.updateDataset(datasetId, { isActive: !currentStatus });
      await fetchDatasets();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
      await fetchDatasets();
    }
  };

  const handleDelete = async (datasetId: string) => {
    if (!confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminApi.deleteDataset(datasetId);
      await fetchDatasets();
    } catch (error) {
      console.error('Failed to delete dataset:', error);
      alert('Failed to delete dataset. Please try again.');
    }
  };

  const handleEdit = (dataset: Dataset) => {
    // Navigate to admin page with datasets tab open
    navigate('/admin?tab=datasets&edit=' + dataset.id);
  };

  const getIconComponent = (iconName?: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      Building2,
      Database,
      Globe,
      Folder,
      ShoppingBag,
    };
    return iconMap[iconName || ''] || Database;
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar activePage="data" />
      <div className="flex-1 ml-[64px]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 mb-2">Datasets</h1>
              <p className="text-slate-600">
                Manage all your datasets. Publish, edit, or remove them.
              </p>
            </div>
            <button
              onClick={() => navigate('/admin?tab=datasets')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Dataset
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            {/* Category and Type Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Type:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as 'all' | 'live' | 'dataset')}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="all">All Types</option>
                  <option value="live">Live Data</option>
                  <option value="dataset">Dataset</option>
                </select>
              </div>
            </div>
          </div>

          {/* Datasets Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : filteredDatasets.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-lg">
              <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium mb-1">No datasets found</p>
              <p className="text-sm text-slate-400">
                {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Datasets will appear here once they are created and published'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDatasets.map((dataset) => {
                const DatasetIcon = getIconComponent(dataset.icon);
                const config = (dataset as any).config || {};
                const isCompanyIntelligence = config.systemType === 'company-intelligence';

                return (
                  <motion.div
                    key={dataset.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-300 rounded-lg p-6 hover:border-slate-900 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => navigate(`/app`)} // Navigate to workflow editor to use dataset
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0">
                          {isCompanyIntelligence ? (
                            <Building2 className="w-5 h-5 text-purple-600" />
                          ) : (
                            <DatasetIcon className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 truncate mb-0.5">
                            {dataset.name}
                          </h3>
                          <p className="text-xs text-slate-500">{dataset.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {dataset.featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                        {isCompanyIntelligence && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">
                            Company Intel
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {dataset.description && (
                      <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                        {dataset.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Type:</span>
                        <span className="font-medium text-slate-700 capitalize">
                          {dataset.type === 'live' ? 'Live Data' : 'Dataset'}
                        </span>
                      </div>
                      {dataset.size && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Size:</span>
                          <span className="font-medium text-slate-700">{dataset.size}</span>
                        </div>
                      )}
                      {dataset.formats && dataset.formats.length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Formats:</span>
                          <span className="font-medium text-slate-700">
                            {dataset.formats.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-slate-900">
                          ${dataset.price}
                        </div>
                        <div className="flex items-center gap-2">
                          {(dataset as any).isPublic ? (
                            <span className="px-2 py-1 text-[10px] font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                              Public
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-[10px] font-medium bg-slate-50 text-slate-600 rounded border border-slate-200">
                              Private
                            </span>
                          )}
                          {dataset.isActive ? (
                            <span className="px-2 py-1 text-[10px] font-medium bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-[10px] font-medium bg-slate-50 text-slate-600 rounded border border-slate-200">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePublic(dataset.id, (dataset as any).isPublic || false);
                          }}
                          className={clsx(
                            'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5',
                            (dataset as any).isPublic
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                          )}
                          title={(dataset as any).isPublic ? 'Make Private' : 'Publish'}
                        >
                          {(dataset as any).isPublic ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {(dataset as any).isPublic ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(dataset);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(dataset.id);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Dataset Management</p>
                <p className="text-xs text-blue-800 mb-2">
                  <strong>Publish:</strong> Makes the dataset visible in the Spectr Live Data node for all users.
                  <br />
                  <strong>Private:</strong> Dataset is only visible to you (admin/internal use).
                  <br />
                  <strong>Active/Inactive:</strong> Controls whether the dataset is available for use.
                </p>
                <p className="text-xs text-blue-800">
                  Only <strong>Public + Active</strong> datasets appear in the Spectr Live Data node.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetsPage;


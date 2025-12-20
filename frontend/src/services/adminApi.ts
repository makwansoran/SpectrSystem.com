/**
 * Admin API Service
 * Handles all admin-related API calls
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: string;
  organizationName?: string;
  organizationPlan?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  totalOrganizations: number;
  totalWorkflows: number;
  totalExecutions: number;
  totalDatasets: number;
  planDistribution: Array<{ plan: string; count: number }>;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: 'live' | 'dataset';
  price: number;
  featured: boolean;
  formats: string[];
  size?: string;
  icon?: string;
  features: string[];
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

// Users Management
export const getUsers = async (page = 1, limit = 50, search = '') => {
  const response = await api.get('/admin/users', {
    params: { page, limit, search },
  });
  return response.data;
};

export const getUser = async (id: string) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, data: Partial<AdminUser>) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const verifyUserEmail = async (id: string) => {
  const response = await api.post(`/admin/users/${id}/verify-email`);
  return response.data;
};

// Statistics
export const getOverviewStats = async (): Promise<{ success: boolean; data: AdminStats }> => {
  const response = await api.get('/admin/stats/overview');
  return response.data;
};

export const getUserStats = async (days = 30) => {
  const response = await api.get('/admin/stats/users', {
    params: { days },
  });
  return response.data;
};

// Datasets Management
export const getDatasets = async (): Promise<{ success: boolean; data: Dataset[] }> => {
  const response = await api.get('/admin/datasets');
  return response.data;
};

export const getDataset = async (id: string) => {
  const response = await api.get(`/admin/datasets/${id}`);
  return response.data;
};

export const createDataset = async (data: Partial<Dataset>) => {
  const response = await api.post('/admin/datasets', data);
  return response.data;
};

export const updateDataset = async (id: string, data: Partial<Dataset>) => {
  const response = await api.put(`/admin/datasets/${id}`, data);
  return response.data;
};

export const deleteDataset = async (id: string) => {
  const response = await api.delete(`/admin/datasets/${id}`);
  return response.data;
};

export const toggleDatasetFeatured = async (id: string) => {
  const response = await api.put(`/admin/datasets/${id}/toggle-featured`);
  return response.data;
};

export const toggleDatasetActive = async (id: string) => {
  const response = await api.put(`/admin/datasets/${id}/toggle-active`);
  return response.data;
};


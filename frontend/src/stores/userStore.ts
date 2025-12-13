/**
 * User Store
 * Zustand store for managing user authentication and profile state
 */

import { create } from 'zustand';
import * as api from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  emailVerified?: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  role: 'admin' | 'member' | 'viewer';
  memberCount?: number;
  createdAt: string;
}

export interface UsageStats {
  workflows: { current: number; limit: number | 'unlimited' };
  executionsPerMonth: { current: number; limit: number | 'unlimited' };
  storageGB: { current: number; limit: number | 'unlimited' };
  apiCallsPerMonth: { current: number; limit: number | 'unlimited' };
  intelligenceProjects: { current: number; limit: number | 'unlimited' };
  findingsPerMonth: { current: number; limit: number | 'unlimited' };
}

interface UserState {
  // Auth state
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Usage stats
  usageStats: UsageStats | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  fetchOrganization: () => Promise<void>;
  fetchUsageStats: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  user: null,
  organization: null,
  isAuthenticated: false,
  isLoading: true,
  usageStats: null,

  // Login
  login: async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      set({
        user: response.user,
        organization: response.organization,
        isAuthenticated: !response.requiresVerification, // Only authenticated if verified
      });
      // Store token
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      return response; // Return response so caller can check requiresVerification
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    localStorage.removeItem('token');
    set({
      user: null,
      organization: null,
      isAuthenticated: false,
      usageStats: null,
    });
  },

  // Register
  register: async (email: string, password: string, name: string) => {
    try {
      const response = await api.register(email, password, name);
      set({
        user: response.user,
        organization: response.organization,
        isAuthenticated: !response.requiresVerification, // Only authenticated if verified
      });
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      return response; // Return response so caller can check requiresVerification
    } catch (error) {
      throw error;
    }
  },

  // Fetch current user
  fetchUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // TODO: Replace with actual API call
      const user = await api.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Fetch organization
  fetchOrganization: async () => {
    try {
      const organization = await api.getOrganization();
      set({ organization });
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      // Don't throw - organization might not exist yet
    }
  },

  // Fetch usage stats
  fetchUsageStats: async () => {
    try {
      // TODO: Replace with actual API call
      const usageStats = await api.getUsageStats();
      set({ usageStats });
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    }
  },

  // Update profile
  updateProfile: async (data: Partial<User>) => {
    try {
      // TODO: Replace with actual API call
      const updatedUser = await api.updateProfile(data);
      set({ user: updatedUser });
    } catch (error) {
      throw error;
    }
  },
}));


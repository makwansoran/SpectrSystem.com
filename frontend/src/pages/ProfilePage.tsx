/**
 * User Profile Page
 * Display user information, stats, and quick actions
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Settings,
  Building2,
  BarChart3,
  Zap,
  Workflow,
  Activity,
  ArrowLeft,
  Edit,
  Crown,
  Users,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, organization, fetchUser, fetchOrganization, updateProfile } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Only fetch if data is not already loaded
      if (!user) {
        await fetchUser();
      }
      if (!organization) {
        await fetchOrganization();
      }
      setIsLoading(false);
    };
    loadData();
  }, [fetchUser, fetchOrganization, user, organization]);

  useEffect(() => {
    if (user) {
      setEditedName(user.name || '');
      setEditedEmail(user.email || '');
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!editedName.trim() || editedName === user?.name) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ name: editedName.trim() });
      await fetchUser();
      setIsEditingName(false);
    } catch (error: any) {
      alert(error.message || 'Failed to update name');
      setEditedName(user?.name || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!editedEmail.trim() || editedEmail === user?.email) {
      setIsEditingEmail(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedEmail.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ email: editedEmail.trim() });
      await fetchUser();
      setIsEditingEmail(false);
      alert('Email updated. Please check your inbox to verify your new email address.');
    } catch (error: any) {
      alert(error.message || 'Failed to update email');
      setEditedEmail(user?.email || '');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar activePage="profile" />
        <div className="flex-1 ml-[64px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/signin');
    return null;
  }

  // Get initials for avatar
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Plan badge colors
  const planColors: Record<string, string> = {
    free: 'bg-slate-100 text-slate-700 border-slate-300',
    standard: 'bg-blue-50 text-blue-700 border-blue-300',
    pro: 'bg-purple-50 text-purple-700 border-purple-300',
    enterprise: 'bg-amber-50 text-amber-700 border-amber-300',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activePage="profile" />
      <div className="flex-1 ml-[64px]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/home"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
              <div className="h-4 w-px bg-slate-300" />
              <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
            </div>
            <Link
              to="/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-slate-200 p-6"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || 'User'}
                      className="w-24 h-24 rounded-full border-4 border-slate-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center text-white text-2xl font-semibold border-4 border-slate-200">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-slate-800 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                {isEditingName ? (
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-xl font-semibold text-slate-900 border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      disabled={isSaving}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSaving}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setEditedName(user.name);
                      }}
                      disabled={isSaving}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-900">{user?.name || 'User'}</h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {isEditingEmail ? (
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="text-sm text-slate-600 border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      disabled={isSaving}
                    />
                    <button
                      onClick={handleSaveEmail}
                      disabled={isSaving}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingEmail(false);
                        setEditedEmail(user?.email || '');
                      }}
                      disabled={isSaving}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-sm text-slate-600">{user?.email || ''}</p>
                    <button
                      onClick={() => setIsEditingEmail(true)}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-3 border-t border-slate-200 pt-6">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{user?.email || ''}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">
                    Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {organization && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{organization.name}</span>
                  </div>
                )}
                {user.role && (
                  <div className="flex items-center gap-3 text-sm">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 capitalize">{user.role}</span>
                  </div>
                )}
              </div>

              {/* Organization Plan */}
              {organization && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Plan
                    </span>
                    {organization.plan !== 'free' && (
                      <Crown className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div
                    className={clsx(
                      'px-3 py-1.5 rounded-lg border text-sm font-medium capitalize mb-3',
                      planColors[organization.plan] || planColors.free
                    )}
                  >
                    {organization.plan}
                  </div>
                  {organization.plan === 'free' && (
                    <Link
                      to="/pricing"
                      className="block w-full text-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                    >
                      Upgrade Plan
                    </Link>
                  )}
                  {organization.plan !== 'free' && organization.plan !== 'enterprise' && (
                    <Link
                      to="/pricing"
                      className="block w-full text-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                    >
                      Change Plan
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Workflows
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">0</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Executions
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">0</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      This Month
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">0</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Success Rate
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">—</div>
                </div>
              </div>
            </motion.div>

            {/* Organization Info */}
            {organization && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Organization</h3>
                  <Link
                    to="/organization"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Manage →
                  </Link>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{organization.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 ml-6">
                      Created {new Date(organization.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 pt-4 border-t border-slate-200">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {organization.memberCount || 1} member
                          {organization.memberCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Your Role
                      </span>
                      <div className="text-sm font-medium text-slate-900 capitalize mt-1">
                        {organization.role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/app"
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">Create Workflow</div>
                      <div className="text-xs text-slate-500">Start a new automation</div>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/subscription"
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Crown className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">View Usage</div>
                      <div className="text-xs text-slate-500">Check your limits</div>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProfilePage;


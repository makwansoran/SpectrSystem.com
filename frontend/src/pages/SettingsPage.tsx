/**
 * User Settings Page
 * Account settings, security, preferences
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Shield,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, fetchUsageStats } = useUserStore();
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications' | 'danger'>('account');
  
  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);
  
  // Account form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  
  // Security form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'danger' as const, label: 'Danger Zone', icon: Trash2 },
  ];

  const handleSaveAccount = async () => {
    setIsSavingAccount(true);
    try {
      await updateProfile({ name, email });
      // Show success message
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    setIsSavingPassword(true);
    try {
      // TODO: Implement password change API
      console.log('Changing password...');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activePage="settings" />
      <div className="flex-1 ml-[64px]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
              <div className="h-4 w-px bg-slate-300" />
              <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1',
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-slate-200 p-6"
            >
              {/* Account Tab */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-6">Account Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-200">
                      <button
                        onClick={handleSaveAccount}
                        disabled={isSavingAccount}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                      >
                        {isSavingAccount ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                      )}
                      {confirmPassword && newPassword === confirmPassword && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Passwords match
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-200">
                      <button
                        onClick={handleChangePassword}
                        disabled={isSavingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSavingPassword ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span>Changing...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Change Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-slate-900">Email Notifications</div>
                        <div className="text-xs text-slate-500 mt-1">Receive email updates about your workflows</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-slate-900">Workflow Execution Alerts</div>
                        <div className="text-xs text-slate-500 mt-1">Get notified when workflows fail</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-slate-900">Weekly Summary</div>
                        <div className="text-xs text-slate-500 mt-1">Receive a weekly summary of your activity</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'danger' && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-6">Danger Zone</h2>
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium text-red-900 mb-1">Delete Account</div>
                          <div className="text-xs text-red-700">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SettingsPage;


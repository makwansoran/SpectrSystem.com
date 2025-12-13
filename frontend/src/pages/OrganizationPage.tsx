/**
 * Organization Management Page
 * View and manage organization, members, and settings
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Users,
  Crown,
  Settings,
  UserPlus,
  Mail,
  Calendar,
  Shield,
  MoreVertical,
  Trash2,
  Edit,
  Check,
  X,
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import clsx from 'clsx';

const OrganizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { organization, fetchOrganization } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchOrganization();
      // TODO: Fetch members
      setMembers([
        { id: '1', email: 'user@example.com', role: 'admin', joinedAt: '2024-01-01' },
        { id: '2', email: 'member@example.com', role: 'member', joinedAt: '2024-01-15' },
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchOrganization]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!organization) {
    navigate('/home');
    return null;
  }

  const planColors = {
    free: 'bg-slate-100 text-slate-700 border-slate-300',
    pro: 'bg-blue-50 text-blue-700 border-blue-300',
    enterprise: 'bg-purple-50 text-purple-700 border-purple-300',
  };

  const roleColors = {
    admin: 'bg-red-50 text-red-700 border-red-300',
    member: 'bg-blue-50 text-blue-700 border-blue-300',
    viewer: 'bg-slate-50 text-slate-700 border-slate-300',
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    // TODO: Implement invite API
    console.log('Inviting:', inviteEmail);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
              <h1 className="text-xl font-semibold text-slate-900">Organization</h1>
            </div>
            {organization.role === 'admin' && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Member</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organization Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-slate-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{organization.name}</h2>
                  <div
                    className={clsx(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border mt-1',
                      planColors[organization.plan]
                    )}
                  >
                    {organization.plan !== 'free' && <Crown className="w-3 h-3" />}
                    <span className="capitalize">{organization.plan}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Members</span>
                  <span className="font-medium text-slate-900">{members.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Created</span>
                  <span className="font-medium text-slate-900">
                    {new Date(organization.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Your Role</span>
                  <span
                    className={clsx(
                      'px-2 py-0.5 rounded text-xs font-medium border capitalize',
                      roleColors[organization.role]
                    )}
                  >
                    {organization.role}
                  </span>
                </div>
              </div>

              {organization.role === 'admin' && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <Link
                    to="/subscription"
                    className="block w-full text-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                  >
                    Manage Subscription
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Members List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Members</h3>
                <span className="text-sm text-slate-600">{members.length} total</span>
              </div>

              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{member.email}</div>
                        <div className="text-xs text-slate-500">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={clsx(
                          'px-2 py-1 rounded text-xs font-medium border capitalize',
                          roleColors[member.role as keyof typeof roleColors]
                        )}
                      >
                        {member.role}
                      </span>
                      {organization.role === 'admin' && member.role !== 'admin' && (
                        <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {members.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-sm text-slate-500">No members yet</p>
                  {organization.role === 'admin' && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="mt-4 text-sm font-medium text-slate-900 hover:text-slate-700"
                    >
                      Invite your first member
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg border border-slate-200 p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Invite Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail}
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrganizationPage;


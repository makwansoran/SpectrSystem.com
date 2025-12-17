/**
 * Usage Page
 * Display usage statistics and limits
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Folder,
  Play,
  Database,
  Zap,
  Brain,
  FileJson,
  Crown,
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';
import { useUserStore } from '../stores/userStore';

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
  const remaining = limitValue === Infinity ? Infinity : Math.max(0, limitValue - current);

  return (
    <div className="p-5 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors bg-slate-50/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={clsx(
            'p-1.5 rounded',
            isAtLimit ? 'bg-red-100 text-red-600' : 
            isNearLimit ? 'bg-amber-100 text-amber-600' : 
            'bg-slate-100 text-slate-600'
          )}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-slate-900">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx(
            'text-sm font-mono font-semibold',
            isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-slate-900'
          )}>
            {current.toLocaleString()}
          </span>
          <span className="text-sm text-slate-400">/</span>
          <span className="text-sm text-slate-500">
            {limit === 'unlimited' ? '∞' : limit.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-300',
              isAtLimit ? 'bg-red-600' : isNearLimit ? 'bg-amber-500' : 'bg-slate-900'
            )}
            style={{
              width: `${Math.min(percentage, 100)}%`
            }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={clsx(
            'flex items-center gap-1',
            isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-slate-600'
          )}>
            {isAtLimit ? (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>Limit reached</span>
              </>
            ) : isNearLimit ? (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>Near limit</span>
              </>
            ) : limit === 'unlimited' ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Unlimited</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>{remaining.toLocaleString()} remaining</span>
              </>
            )}
          </span>
          <span className="text-slate-500">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

const UsagePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, organization, usageStats, fetchUsageStats, fetchUser, fetchOrganization } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch user and organization if not already loaded
        if (!user) {
          await fetchUser();
        }
        if (!organization) {
          await fetchOrganization();
        }
        // Fetch usage stats
        await fetchUsageStats();
      } catch (error) {
        console.error('Failed to load usage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, organization, fetchUser, fetchOrganization, fetchUsageStats]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activePage="usage" />
      <div className="flex-1 ml-[64px]">
        {/* Header */}
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-slate-900" />
                <h1 className="text-xl font-semibold text-slate-900">Usage & Limits</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Plan Info Card */}
          {organization && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-slate-200 p-6 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    'p-3 rounded-lg',
                    organization.plan === 'free' ? 'bg-slate-100' : 
                    organization.plan === 'pro' ? 'bg-amber-50' : 'bg-purple-50'
                  )}>
                    {organization.plan !== 'free' ? (
                      <Crown className={clsx(
                        'w-6 h-6',
                        organization.plan === 'pro' ? 'text-amber-600' : 'text-purple-600'
                      )} />
                    ) : (
                      <BarChart3 className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Current Plan</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-semibold text-slate-900 capitalize">{organization.plan}</p>
                      {organization.plan === 'free' && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded">
                          Limited
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  to="/store"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  View Store
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Usage Stats */}
          {isLoading ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-slate-900 animate-spin mb-4" />
                <p className="text-sm text-slate-600">Loading usage statistics...</p>
              </div>
            </div>
          ) : usageStats ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Usage Statistics</h2>
                  <p className="text-sm text-slate-600">Track your current usage against plan limits</p>
                </div>
                <button
                  onClick={() => fetchUsageStats()}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <Loader2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Summary */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    Usage resets monthly. Upgrade your plan for higher limits and more features.
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-slate-200 p-12"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to load usage data</h3>
                <p className="text-sm text-slate-600 mb-4">
                  We couldn't fetch your usage statistics. Please try again.
                </p>
                <button
                  onClick={() => {
                    fetchUsageStats();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsagePage;


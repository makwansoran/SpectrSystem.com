/**
 * Subscription & Usage Page
 * Display plan, limits, and usage statistics
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Crown,
  BarChart3,
  Zap,
  Workflow,
  Database,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import clsx from 'clsx';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { organization, usageStats, fetchOrganization, fetchUsageStats } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchOrganization(), fetchUsageStats()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchOrganization, fetchUsageStats]);

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

  const plan = organization.plan || 'free';
  const planInfo = {
    free: { name: 'Free', price: 0, color: 'slate', features: ['10 workflows', '1,000 executions/month', '0.5GB storage'] },
    pro: { name: 'Pro', price: 29, color: 'blue', features: ['100 workflows', '100,000 executions/month', '10GB storage', 'Priority support'] },
    enterprise: { name: 'Enterprise', price: 299, color: 'purple', features: ['Unlimited workflows', 'Unlimited executions', 'Unlimited storage', 'Dedicated support'] },
  };

  const currentPlan = planInfo[plan];

  // Usage metrics
  const metrics = usageStats ? [
    {
      name: 'Workflows',
      current: usageStats.workflows.current,
      limit: usageStats.workflows.limit,
      icon: Workflow,
      color: 'blue',
    },
    {
      name: 'Executions (This Month)',
      current: usageStats.executionsPerMonth.current,
      limit: usageStats.executionsPerMonth.limit,
      icon: Zap,
      color: 'green',
    },
    {
      name: 'Storage',
      current: usageStats.storageGB.current,
      limit: usageStats.storageGB.limit,
      icon: Database,
      color: 'purple',
      unit: 'GB',
    },
    {
      name: 'API Calls (This Month)',
      current: usageStats.apiCallsPerMonth.current,
      limit: usageStats.apiCallsPerMonth.limit,
      icon: Activity,
      color: 'orange',
    },
    {
      name: 'Intelligence Projects',
      current: usageStats.intelligenceProjects.current,
      limit: usageStats.intelligenceProjects.limit,
      icon: BarChart3,
      color: 'pink',
    },
    {
      name: 'Findings (This Month)',
      current: usageStats.findingsPerMonth.current,
      limit: usageStats.findingsPerMonth.limit,
      icon: TrendingUp,
      color: 'indigo',
    },
  ] : [];

  const getUsagePercentage = (current: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'orange';
    return 'green';
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
              <h1 className="text-xl font-semibold text-slate-900">Subscription & Usage</h1>
            </div>
            {plan !== 'enterprise' && (
              <Link
                to="/pricing"
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-slate-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                {plan !== 'free' && <Crown className="w-5 h-5 text-amber-500" />}
                <h2 className="text-lg font-semibold text-slate-900">Current Plan</h2>
              </div>
              <div
                className={clsx(
                  'px-4 py-3 rounded-lg border mb-4',
                  plan === 'free' && 'bg-slate-50 border-slate-300',
                  plan === 'pro' && 'bg-blue-50 border-blue-300',
                  plan === 'enterprise' && 'bg-purple-50 border-purple-300'
                )}
              >
                <div className="text-2xl font-bold text-slate-900 mb-1">{currentPlan.name}</div>
                <div className="text-sm text-slate-600">
                  {currentPlan.price === 0 ? 'Free' : `$${currentPlan.price}/month`}
                </div>
              </div>
              <div className="space-y-2 mb-6">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              {plan !== 'enterprise' && (
                <Link
                  to="/pricing"
                  className="block w-full text-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  Upgrade Plan
                </Link>
              )}
            </motion.div>
          </div>

          {/* Usage Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Usage Statistics</h3>
              <div className="space-y-6">
                {metrics.map((metric, index) => {
                  const Icon = metric.icon;
                  const limit = metric.limit === 'unlimited' ? Infinity : metric.limit;
                  const percentage = getUsagePercentage(metric.current, metric.limit);
                  const color = getUsageColor(percentage);
                  const isUnlimited = metric.limit === 'unlimited';

                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={clsx('w-4 h-4', `text-${metric.color}-600`)} />
                          <span className="text-sm font-medium text-slate-700">{metric.name}</span>
                        </div>
                        <div className="text-sm text-slate-600">
                          {metric.current.toLocaleString()}
                          {metric.unit && ` ${metric.unit}`}
                          {' / '}
                          {isUnlimited ? 'Unlimited' : `${limit.toLocaleString()}${metric.unit || ''}`}
                        </div>
                      </div>
                      {!isUnlimited && (
                        <>
                          <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                            <div
                              className={clsx(
                                'h-2 rounded-full transition-all',
                                color === 'red' && 'bg-red-500',
                                color === 'orange' && 'bg-orange-500',
                                color === 'green' && 'bg-green-500'
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={clsx(
                              'flex items-center gap-1',
                              color === 'red' && 'text-red-600',
                              color === 'orange' && 'text-orange-600',
                              color === 'green' && 'text-green-600'
                            )}>
                              {percentage >= 90 && <AlertCircle className="w-3 h-3" />}
                              {percentage.toFixed(1)}% used
                            </span>
                            <span className="text-slate-500">
                              {Math.max(0, limit - metric.current).toLocaleString()} remaining
                            </span>
                          </div>
                        </>
                      )}
                      {isUnlimited && (
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          Unlimited usage
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Billing Cycle Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Billing Cycle</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Current Period</span>
                  <span className="font-medium text-slate-900">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Resets On</span>
                  <span className="font-medium text-slate-900">
                    {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()}
                  </span>
                </div>
                {plan !== 'free' && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="text-slate-600">Next Billing Date</span>
                    <span className="font-medium text-slate-900">
                      {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;


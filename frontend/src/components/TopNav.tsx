/**
 * Top Navigation Component
 * Light theme - Clean & Friendly
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Save,
  MoreHorizontal,
  Undo2,
  Redo2,
  Loader2,
  Trash2,
  Copy,
  Download,
  FileJson,
  BarChart3,
  Zap,
  Eye,
  Folder,
  Brain,
  User,
  Settings,
  LogOut,
  Crown,
  Database
} from 'lucide-react';
import clsx from 'clsx';
import { useWorkflowStore } from '../stores/workflowStore';
import { useUserStore } from '../stores/userStore';
import { X } from 'lucide-react';
import AgentChat from './AgentChat';

const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const {
    workflowName,
    setWorkflowName,
    hasUnsavedChanges,
    isSaving,
    isExecuting,
    saveWorkflow,
    executeWorkflow,
    undo,
    redo,
    historyIndex,
    history,
    setBottomPanelOpen,
    setBottomPanelView,
    bottomPanelOpen,
    bottomPanelView,
    currentExecution,
    fetchExecutions,
    addProjection,
  } = useWorkflowStore();

  const { user, organization, logout, usageStats, fetchUsageStats } = useUserStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(workflowName);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAgentChat, setShowAgentChat] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { createNewWorkflow } = useWorkflowStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    setTempName(workflowName);
  }, [workflowName]);

  // Fetch usage stats on mount
  useEffect(() => {
    if (user && organization) {
      fetchUsageStats();
    }
  }, [user, organization, fetchUsageStats]);

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      setWorkflowName(tempName.trim());
    } else {
      setTempName(workflowName);
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNameSubmit();
    if (e.key === 'Escape') {
      setTempName(workflowName);
      setIsEditingName(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 's') {
          e.preventDefault();
          saveWorkflow();
        } else if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'z' && e.shiftKey) {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [saveWorkflow, undo, redo]);

  return (
    <>
    <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-slate-300/50 sticky top-0 z-10 backdrop-blur-sm">
      {/* Left - Logo & Name & Undo/Redo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center">
          <img src="/EyelogoBlack.png" alt="SPECTR SYSTEM" className="h-20 w-auto" />
          <span className="text-xs font-semibold text-slate-900 tracking-tight uppercase" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.01em' }}>SPECTR SYSTEM</span>
        </Link>
        
        <span className="text-slate-400">/</span>

        {isEditingName ? (
          <input
            ref={inputRef}
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            className="px-2.5 py-1 text-xs text-slate-900 bg-white border border-slate-300/50 rounded-lg focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-mono uppercase tracking-tight"
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-900 hover:text-slate-900 transition-colors px-1.5 py-0.5 rounded-lg hover:bg-slate-100/50 uppercase tracking-tight"
          >
            {workflowName}
            {hasUnsavedChanges && (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse" />
            )}
          </button>
        )}

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 bg-white border border-slate-300/50 rounded-lg p-1 ml-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className={clsx(
              'p-1.5 rounded-lg transition-all',
              historyIndex > 0
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                : 'text-slate-300 cursor-not-allowed'
            )}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className={clsx(
              'p-1.5 rounded-lg transition-all',
              historyIndex < history.length - 1
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                : 'text-slate-300 cursor-not-allowed'
            )}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setShowAgentChat(true)}
          className="text-xs font-medium text-slate-900 hover:text-slate-900 transition-all uppercase tracking-tight relative group inline-flex items-center gap-1.5"
          title="Agent"
        >
          <Brain className="w-3.5 h-3.5" />
          <span className="relative">
            Agent
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></span>
          </span>
        </button>
        <button
          onClick={async () => {
            // Toggle bottom panel
            if (bottomPanelOpen && bottomPanelView === 'execution') {
              // If already open and showing execution, close it
              setBottomPanelOpen(false);
            } else {
              // Fetch latest executions if needed
              if (!currentExecution) {
                await fetchExecutions();
              }
              // Add current execution as a projection if available
              if (currentExecution) {
                addProjection(currentExecution);
              }
              // Open bottom panel with execution view
              setBottomPanelView('execution');
              setBottomPanelOpen(true);
            }
          }}
          className={clsx(
            'text-xs font-medium transition-all uppercase tracking-tight relative group',
            bottomPanelOpen && bottomPanelView === 'execution'
              ? 'text-slate-900'
              : 'text-slate-900 hover:text-slate-900'
          )}
          title="View Projection Results"
        >
          <span className="relative">
            View
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></span>
          </span>
        </button>
        <Link
          to="/home"
          className="text-xs font-medium text-slate-900 hover:text-slate-900 transition-all uppercase tracking-tight relative group"
        >
          <span className="relative">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></span>
          </span>
        </Link>

        {/* Usage Stats Display */}
        {user && organization && usageStats && (
          <button
            onClick={() => setShowUsageModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100/50 transition-colors border border-slate-300/50"
            title="View Usage & Limits"
          >
            <BarChart3 className="w-4 h-4 text-slate-600" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-900">
                {usageStats.workflows.current}
              </span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs text-slate-500">
                {usageStats.workflows.limit === 'unlimited' ? '∞' : usageStats.workflows.limit}
              </span>
            </div>
          </button>
        )}

        <button
          onClick={saveWorkflow}
          disabled={isSaving || !hasUnsavedChanges}
          className={clsx(
            'text-xs font-medium transition-all uppercase tracking-tight relative group inline-flex items-center gap-1.5',
            hasUnsavedChanges
              ? 'text-slate-900 hover:text-slate-900'
              : 'text-slate-300 cursor-not-allowed'
          )}
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span className="relative">
            Save
            {hasUnsavedChanges && (
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></span>
            )}
          </span>
        </button>

        <button
          onClick={executeWorkflow}
          disabled={isExecuting}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-green-600',
            'bg-green-600 text-white hover:bg-green-700',
            isExecuting && 'opacity-70 cursor-not-allowed'
          )}
        >
          {isExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span className="uppercase tracking-tight">{isExecuting ? 'Running' : 'Run'}</span>
        </button>

        {/* User Menu */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-100/50 transition-colors"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-medium flex items-center justify-center">
                  {getInitials(user.name)}
                </div>
              )}
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-1.5 w-56 py-1.5 bg-white border border-slate-300/50 rounded-lg z-50 shadow-lg"
                >
                  <div className="px-3 py-2 border-b border-slate-200">
                    <div className="text-sm font-medium text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                    {organization && (
                      <div className="flex items-center gap-1 mt-1">
                        {organization.plan !== 'free' && <Crown className="w-3 h-3 text-amber-500" />}
                        <span className="text-xs text-slate-600 capitalize">{organization.plan}</span>
                      </div>
                    )}
                  </div>
                  <UserMenuItem
                    icon={User}
                    label="Profile"
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                  />
                  <UserMenuItem
                    icon={Settings}
                    label="Settings"
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                  />
                  <UserMenuItem
                    icon={Crown}
                    label="Subscription"
                    onClick={() => {
                      navigate('/subscription');
                      setShowUserMenu(false);
                    }}
                  />
                  <div className="h-px bg-slate-200 my-1" />
                  <UserMenuItem
                    icon={LogOut}
                    label="Sign Out"
                    onClick={handleLogout}
                    danger
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={clsx(
              'p-1.5 rounded-lg transition-all border border-slate-300/50',
              'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50',
              showDropdown && 'bg-slate-100/50 text-slate-900'
            )}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-1.5 w-44 py-1.5 bg-white border border-slate-300/50 rounded-lg z-50"
              >
                <DropdownItem icon={Copy} label="Duplicate" />
                <DropdownItem icon={FileJson} label="Export" />
                <DropdownItem icon={Download} label="Import" />
                <div className="h-px bg-slate-300/50 my-1" />
                <DropdownItem icon={Trash2} label="Delete" danger />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Workflow List Modal */}
    </header>

    {/* Agent Chat Sidebar */}
    <AgentChat isOpen={showAgentChat} onClose={() => setShowAgentChat(false)} />

    {/* Usage Stats Modal */}
    <AnimatePresence>
      {showUsageModal && usageStats && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUsageModal(false)}
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
            <div className="bg-white border border-slate-300/50 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300/50 bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-slate-900" />
                  <h2 className="text-lg font-semibold text-slate-900">Usage & Limits</h2>
                </div>
                <button
                  onClick={() => setShowUsageModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100/50 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Plan Info */}
                  {organization && (
                    <div className="pb-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Current Plan</p>
                          <div className="flex items-center gap-2">
                            {organization.plan !== 'free' && <Crown className="w-4 h-4 text-amber-500" />}
                            <p className="text-lg font-semibold text-slate-900 capitalize">{organization.plan}</p>
                          </div>
                        </div>
                        <Link
                          to="/store"
                          className="text-xs font-medium text-slate-900 hover:text-slate-700 transition-colors underline"
                        >
                          View Store
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Usage Stats */}
                  <div className="space-y-4">
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
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};

interface DropdownItemProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ icon: Icon, label, danger, onClick }) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium transition-all',
      danger
        ? 'text-red-600 hover:bg-red-50'
        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/50'
    )}
  >
    <Icon className="w-3.5 h-3.5" />
    <span className="uppercase tracking-tight">{label}</span>
  </button>
);

interface UserMenuItemProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

const UserMenuItem: React.FC<UserMenuItemProps> = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium transition-all',
      danger
        ? 'text-red-600 hover:bg-red-50'
        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
    )}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-900">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx(
            'text-sm font-mono font-semibold',
            isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-slate-900'
          )}>
            {current}
          </span>
          <span className="text-sm text-slate-400">/</span>
          <span className="text-sm text-slate-500 font-mono">
            {limit === 'unlimited' ? '∞' : limit}
          </span>
        </div>
      </div>
      {limitValue !== Infinity && (
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all duration-300',
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-slate-900'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default TopNav;

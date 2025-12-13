/**
 * Workflow List Component
 * Light theme - workflow selector
 */

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Play,
  Clock
} from 'lucide-react';
import clsx from 'clsx';
import { useWorkflowStore } from '../stores/workflowStore';
import type { WorkflowListItem } from '../types';

interface WorkflowListProps {
  onClose?: () => void;
}

const WorkflowList: React.FC<WorkflowListProps> = ({ onClose }) => {
  const {
    workflows,
    workflowId,
    fetchWorkflows,
    loadWorkflow,
    createNewWorkflow,
    deleteWorkflow,
  } = useWorkflowStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const filteredWorkflows = workflows.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (newWorkflowName.trim()) {
      await createNewWorkflow(newWorkflowName.trim());
      setNewWorkflowName('');
      setIsCreating(false);
      onClose?.();
    }
  };

  const handleSelect = async (id: string) => {
    await loadWorkflow(id);
    onClose?.();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this workflow?')) {
      await deleteWorkflow(id);
      setMenuOpen(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header - with padding for close button */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3 pr-10">
          <h2 className="text-lg font-semibold text-slate-800">Workflows</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white"
          />
        </div>
      </div>

      {/* Create form */}
      {isCreating && (
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <input
            type="text"
            placeholder="Workflow name"
            value={newWorkflowName}
            onChange={(e) => setNewWorkflowName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
            className="w-full px-3 py-1.5 mb-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newWorkflowName.trim()}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => { setIsCreating(false); setNewWorkflowName(''); }}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredWorkflows.length > 0 ? (
          <div className="p-2 space-y-0.5">
            {filteredWorkflows.map((workflow) => (
              <WorkflowItem
                key={workflow.id}
                workflow={workflow}
                isActive={workflowId === workflow.id}
                isMenuOpen={menuOpen === workflow.id}
                onSelect={() => handleSelect(workflow.id)}
                onMenuToggle={() => setMenuOpen(menuOpen === workflow.id ? null : workflow.id)}
                onDelete={() => handleDelete(workflow.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-slate-400">No workflows</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-200">
        <p className="text-xs text-slate-400 text-center">{workflows.length} workflows</p>
      </div>
    </div>
  );
};

interface WorkflowItemProps {
  workflow: WorkflowListItem;
  isActive: boolean;
  isMenuOpen: boolean;
  onSelect: () => void;
  onMenuToggle: () => void;
  onDelete: () => void;
}

const WorkflowItem: React.FC<WorkflowItemProps> = ({
  workflow,
  isActive,
  isMenuOpen,
  onSelect,
  onMenuToggle,
  onDelete,
}) => {
  return (
    <div className="relative">
      <button
        onClick={onSelect}
        className={clsx(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
          isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
          <Play className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-slate-700 truncate">{workflow.name}</div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{workflow.nodeCount} nodes</span>
            {workflow.lastExecuted && (
              <>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{formatTime(workflow.lastExecuted)}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onMenuToggle(); }}
          className="p-1 text-slate-400 hover:text-slate-600 rounded"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </button>

      {isMenuOpen && (
        <div className="absolute right-2 top-full mt-1 w-32 py-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

export default WorkflowList;

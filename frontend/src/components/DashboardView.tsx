/**
 * Dashboard View Component
 * Displays the actual dashboard with widgets rendered (read-only view)
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Table,
  BarChart3,
  PieChart,
  MapPin,
  FileText,
  Gauge,
  TrendingUp,
  PenTool,
  X,
} from 'lucide-react';
import type { FlowNode } from '../types';
import { DashboardWidget } from './DashboardDesigner';

interface DashboardViewProps {
  dashboardNode: FlowNode;
  workflowNodes: FlowNode[];
  onEdit: () => void;
  onClose: () => void;
}

const WIDGET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'table': Table,
  'card': FileText,
  'bar-chart': BarChart3,
  'line-chart': TrendingUp,
  'pie-chart': PieChart,
  'gauge': Gauge,
  'map': MapPin,
  'text': FileText,
};

const DashboardView: React.FC<DashboardViewProps> = ({
  dashboardNode,
  workflowNodes,
  onEdit,
  onClose,
}) => {
  // Get widgets from dashboard node config
  const widgets = useMemo(() => {
    const config = dashboardNode.data.config as { widgets?: DashboardWidget[] };
    return config?.widgets || [];
  }, [dashboardNode]);

  // Get data source nodes
  const dataSourceNodes = useMemo(() => {
    return workflowNodes.filter(node => 
      node.id !== dashboardNode.id && 
      (node.data.nodeType === 'web-scraper' || 
       node.data.nodeType === 'database' ||
       node.data.nodeType === 'ai-agent' ||
       node.data.nodeType === 'connected-data-input')
    );
  }, [workflowNodes, dashboardNode.id]);

  // If no widgets, show empty state
  if (widgets.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300/50 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900 uppercase tracking-tight">
                {dashboardNode.data.label || 'Untitled Dashboard'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Dashboard View</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
            >
              <PenTool className="w-4 h-4" />
              Design Dashboard
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200/50 rounded transition-colors"
              title="Close Dashboard"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center bg-slate-50">
          <div className="text-center max-w-md">
            <LayoutDashboard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-slate-900 mb-2">No widgets yet</h3>
            <p className="text-xs text-slate-600 mb-6">
              This dashboard hasn't been designed yet. Click "Design Dashboard" to add widgets and create your custom dashboard.
            </p>
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
            >
              <PenTool className="w-4 h-4" />
              Design Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render widgets
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300/50 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900 uppercase tracking-tight">
                {dashboardNode.data.label || 'Untitled Dashboard'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {widgets.length} {widgets.length === 1 ? 'widget' : 'widgets'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors border border-slate-300"
            >
              <PenTool className="w-4 h-4" />
              Edit Dashboard
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200/50 rounded transition-colors"
              title="Close Dashboard"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

      {/* Dashboard Canvas */}
      <div className="flex-1 overflow-auto bg-slate-100 p-4">
        <div
          className="relative bg-white border border-slate-300 rounded-lg shadow-sm mx-auto"
          style={{ 
            minWidth: '1200px', 
            minHeight: '800px',
            position: 'relative',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Widgets */}
          {widgets.map((widget) => {
            const WidgetIcon = WIDGET_ICONS[widget.type] || FileText;
            const dataSourceNode = widget.dataSource 
              ? dataSourceNodes.find(n => n.id === widget.dataSource)
              : null;

            return (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute border border-slate-300 rounded-lg bg-white shadow-sm"
                style={{
                  left: widget.x,
                  top: widget.y,
                  width: widget.width,
                  height: widget.height,
                }}
              >
                {/* Widget Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <WidgetIcon className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-semibold text-slate-900">{widget.title}</span>
                  </div>
                  {dataSourceNode && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {dataSourceNode.data.label || dataSourceNode.id.slice(0, 8)}
                    </span>
                  )}
                </div>

                {/* Widget Content */}
                <div className="p-4 h-full overflow-auto" style={{ height: `calc(100% - 41px)` }}>
                  {widget.type === 'table' && (
                    <div className="space-y-2">
                      <div className="text-xs text-slate-600 mb-3">
                        {widget.config.fields && widget.config.fields.length > 0 ? (
                          <div>
                            <p className="font-medium mb-2">Fields:</p>
                            <div className="flex flex-wrap gap-1">
                              {widget.config.fields.map((field, idx) => (
                                <span key={idx} className="px-2 py-1 bg-slate-100 rounded text-[10px] font-mono">
                                  {field}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400">No fields configured. Data will appear here when workflow runs.</p>
                        )}
                      </div>
                      <div className="border border-slate-200 rounded">
                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                          <p className="text-[10px] font-semibold text-slate-700 uppercase">Table Preview</p>
                        </div>
                        <div className="p-3 text-center text-slate-400">
                          <Table className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Table data will appear here</p>
                          <p className="text-[10px] mt-1">Run the workflow to see data</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {widget.type === 'card' && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-xs font-medium text-slate-600">Card Widget</p>
                      <p className="text-[10px] text-slate-400 mt-1">Key metrics will appear here</p>
                    </div>
                  )}

                  {widget.type === 'bar-chart' && (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-xs font-medium text-slate-600">Bar Chart</p>
                      <p className="text-[10px] text-slate-400 mt-1">Chart will render when data is available</p>
                    </div>
                  )}

                  {widget.type === 'line-chart' && (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-xs font-medium text-slate-600">Line Chart</p>
                      <p className="text-[10px] text-slate-400 mt-1">Trend visualization will appear here</p>
                    </div>
                  )}

                  {widget.type === 'pie-chart' && (
                    <div className="text-center py-8">
                      <PieChart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-xs font-medium text-slate-600">Pie Chart</p>
                      <p className="text-[10px] text-slate-400 mt-1">Proportional data visualization</p>
                    </div>
                  )}

                  {widget.type === 'gauge' && (
                    <div className="text-center py-8">
                      <Gauge className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-xs font-medium text-slate-600">Gauge Widget</p>
                      <p className="text-[10px] text-slate-400 mt-1">Progress indicator will appear here</p>
                    </div>
                  )}

                  {widget.type === 'map' && (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-xs font-medium text-slate-600">Map Widget</p>
                      <p className="text-[10px] text-slate-400 mt-1">Geographic visualization will appear here</p>
                    </div>
                  )}

                  {widget.type === 'text' && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-xs font-medium text-slate-600">Text Widget</p>
                      <p className="text-[10px] text-slate-400 mt-1">Custom content will appear here</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;


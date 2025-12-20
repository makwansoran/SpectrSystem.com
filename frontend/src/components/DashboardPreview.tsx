/**
 * Dashboard Preview Component
 * Live dashboard visualization during agent creation
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Table,
  BarChart3,
  PieChart,
  MapPin,
  FileText,
  Gauge,
} from 'lucide-react';
import type { DashboardWidget } from './DashboardDesigner';

interface DashboardPreviewProps {
  widgets: DashboardWidget[];
  progress?: string;
}

const WIDGET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  table: Table,
  card: FileText,
  'bar-chart': BarChart3,
  'line-chart': BarChart3,
  'pie-chart': PieChart,
  map: MapPin,
  text: FileText,
  gauge: Gauge,
};

const DashboardPreview: React.FC<DashboardPreviewProps> = ({ widgets, progress }) => {
  return (
    <div className="h-full w-full bg-white border-l border-slate-300/50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-300/50 bg-white flex items-center justify-between">
        <div>
          <h3 className="text-xs font-medium text-slate-900 uppercase tracking-tight">Dashboard Preview</h3>
          {progress && (
            <p className="text-[10px] text-slate-500 mt-1">{progress}</p>
          )}
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Dashboard Canvas */}
      <div className="flex-1 overflow-auto bg-slate-100 p-4">
        {widgets.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <LayoutDashboard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-500">Waiting for widgets...</p>
            </div>
          </div>
        ) : (
          <div
            className="relative bg-white border border-slate-300 rounded-lg shadow-sm mx-auto"
            style={{
              minWidth: '800px',
              minHeight: '600px',
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >
            {widgets.map((widget) => {
              const WidgetIcon = WIDGET_ICONS[widget.type] || FileText;

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
                  </div>

                  {/* Widget Content Preview */}
                  <div className="p-4 h-full overflow-auto flex items-center justify-center" style={{ height: `calc(100% - 41px)` }}>
                    <div className="text-center text-slate-400">
                      <WidgetIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-[10px] font-mono">{widget.type}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPreview;


/**
 * Dashboard Designer Component
 * Allows users to design custom dashboards with widgets, charts, and data visualizations
 */

import React, { useState, useCallback, useMemo } from 'react';
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
  X,
  Plus,
  Trash2,
  Settings,
  Move,
  Maximize2,
  Minimize2,
  Eye,
} from 'lucide-react';
import clsx from 'clsx';
import { WorkflowMapComponent, type WorkflowMapConfig } from './WorkflowMap';
import type { FlowNode } from '../types';

// Widget Types
export type WidgetType = 'table' | 'card' | 'bar-chart' | 'line-chart' | 'pie-chart' | 'map' | 'text' | 'gauge';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dataSource?: string; // Node ID that provides data
  config: {
    fields?: string[]; // Fields to display
    chartType?: string;
    aggregation?: string;
    [key: string]: unknown;
  };
}

interface DashboardDesignerProps {
  dashboardNode: FlowNode;
  workflowNodes: FlowNode[];
  onSave: (widgets: DashboardWidget[]) => void;
  onClose: () => void;
  onView?: () => void;
}

const WIDGET_TYPES: Array<{ type: WidgetType; name: string; icon: React.ComponentType<{ className?: string }>; description: string }> = [
  { type: 'table', name: 'Table', icon: Table, description: 'Display data in rows and columns' },
  { type: 'card', name: 'Card', icon: FileText, description: 'Show key metrics or values' },
  { type: 'bar-chart', name: 'Bar Chart', icon: BarChart3, description: 'Visualize data with bars' },
  { type: 'line-chart', name: 'Line Chart', icon: TrendingUp, description: 'Show trends over time' },
  { type: 'pie-chart', name: 'Pie Chart', icon: PieChart, description: 'Display proportions' },
  { type: 'gauge', name: 'Gauge', icon: Gauge, description: 'Show progress or percentage' },
  { type: 'map', name: 'Map', icon: MapPin, description: 'Geographic visualization' },
  { type: 'text', name: 'Text', icon: FileText, description: 'Custom text or HTML content' },
];

const DashboardDesigner: React.FC<DashboardDesignerProps> = ({
  dashboardNode,
  workflowNodes,
  onSave,
  onClose,
  onView,
}) => {
  // Load existing widgets from dashboard node config
  const initialWidgets = useMemo(() => {
    const config = dashboardNode.data.config as { widgets?: DashboardWidget[] };
    return config?.widgets || [];
  }, [dashboardNode]);

  const [widgets, setWidgets] = useState<DashboardWidget[]>(initialWidgets);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showWidgetPalette, setShowWidgetPalette] = useState(true);
  const [showConfigPanel, setShowConfigPanel] = useState(true);

  // Get nodes that can provide data (nodes that connect to this dashboard)
  const dataSourceNodes = useMemo(() => {
    return workflowNodes.filter(node => 
      node.id !== dashboardNode.id && 
      (node.data.nodeType === 'web-scraper' || 
       node.data.nodeType === 'database' ||
       node.data.nodeType === 'ai-agent' ||
       node.data.nodeType === 'connected-data-input')
    );
  }, [workflowNodes, dashboardNode.id]);

  const selectedWidget = widgets.find(w => w.id === selectedWidgetId);

  // Add new widget
  const addWidget = (type: WidgetType) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: `${WIDGET_TYPES.find(w => w.type === type)?.name || type} Widget`,
      x: 0,
      y: widgets.length * 200,
      width: 400,
      height: 300,
      config: {},
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidgetId(newWidget.id);
  };

  // Delete widget
  const deleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    if (selectedWidgetId === widgetId) {
      setSelectedWidgetId(null);
    }
  };

  // Update widget
  const updateWidget = (widgetId: string, updates: Partial<DashboardWidget>) => {
    setWidgets(widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w));
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    setDraggedWidget(widgetId);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle drag
  const handleDrag = useCallback((e: MouseEvent) => {
    if (!draggedWidget) return;
    
    const canvas = document.getElementById('dashboard-canvas');
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;
    
    // Snap to grid (20px grid)
    const gridSize = 20;
    const snappedX = Math.max(0, Math.round(x / gridSize) * gridSize);
    const snappedY = Math.max(0, Math.round(y / gridSize) * gridSize);
    
    updateWidget(draggedWidget, { x: snappedX, y: snappedY });
  }, [draggedWidget, dragOffset]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedWidget(null);
  }, []);

  // Attach drag listeners
  React.useEffect(() => {
    if (draggedWidget) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [draggedWidget, handleDrag, handleDragEnd]);

  // Save dashboard
  const handleSave = () => {
    onSave(widgets);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300/50 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-5 h-5 text-purple-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900 uppercase tracking-tight">
              Dashboard Designer
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {dashboardNode.data.label || 'Untitled Dashboard'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onView && (
            <button
              onClick={onView}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors border border-slate-300"
            >
              <Eye className="w-4 h-4" />
              View Dashboard
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
          >
            Save Dashboard
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/50 rounded transition-colors"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Widget Palette */}
        {showWidgetPalette && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 280 }}
            exit={{ width: 0 }}
            className="border-r border-slate-300/50 bg-slate-50/30 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-tight">
                  Widgets
                </h3>
                <button
                  onClick={() => setShowWidgetPalette(false)}
                  className="p-1 hover:bg-slate-200/50 rounded"
                >
                  <Minimize2 className="w-3 h-3 text-slate-600" />
                </button>
              </div>
              <div className="space-y-2">
                {WIDGET_TYPES.map((widgetType) => {
                  const Icon = widgetType.icon;
                  return (
                    <button
                      key={widgetType.type}
                      onClick={() => addWidget(widgetType.type)}
                      className="w-full p-3 text-left border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <Icon className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-900">{widgetType.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{widgetType.description}</p>
                        </div>
                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {!showWidgetPalette && (
          <button
            onClick={() => setShowWidgetPalette(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-12 bg-white border-r border-y border-slate-300/50 rounded-r-lg hover:bg-slate-50 transition-colors flex items-center justify-center shadow-sm"
          >
            <Maximize2 className="w-4 h-4 text-slate-600" />
          </button>
        )}

        {/* Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-auto bg-slate-100 p-4">
            <div
              id="dashboard-canvas"
              className="relative bg-white border border-slate-300 rounded-lg shadow-sm"
              style={{ minWidth: '1200px', minHeight: '800px', position: 'relative' }}
            >
              {/* Grid Background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #cbd5e1 1px, transparent 1px),
                    linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Widgets */}
              {widgets.map((widget) => {
                const WidgetIcon = WIDGET_TYPES.find(w => w.type === widget.type)?.icon || FileText;
                const isSelected = selectedWidgetId === widget.id;
                const isDragging = draggedWidget === widget.id;

                return (
                  <motion.div
                    key={widget.id}
                    initial={false}
                    animate={{
                      x: widget.x,
                      y: widget.y,
                      scale: isDragging ? 1.02 : 1,
                    }}
                    className={clsx(
                      "absolute border-2 rounded-lg bg-white shadow-md cursor-move",
                      isSelected
                        ? "border-purple-500 ring-2 ring-purple-200"
                        : "border-slate-300 hover:border-purple-300"
                    )}
                    style={{
                      width: widget.width,
                      height: widget.height,
                      zIndex: isSelected ? 10 : 1,
                    }}
                    onClick={() => setSelectedWidgetId(widget.id)}
                    onMouseDown={(e) => handleDragStart(e, widget.id)}
                  >
                    {/* Widget Header */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                      <div className="flex items-center gap-2">
                        <WidgetIcon className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-semibold text-slate-900">{widget.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWidgetId(widget.id);
                            setShowConfigPanel(true);
                          }}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <Settings className="w-3 h-3 text-slate-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWidget(widget.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Widget Content Preview */}
                    <div className="p-4 h-full overflow-auto">
                      {widget.type === 'table' && (
                        <div className="text-center py-8 text-slate-400">
                          <Table className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Table Widget</p>
                          {widget.dataSource && (
                            <p className="text-[10px] text-slate-500 mt-1">Data: {workflowNodes.find(n => n.id === widget.dataSource)?.data.label}</p>
                          )}
                        </div>
                      )}
                      {widget.type === 'card' && (
                        <div className="text-center py-8 text-slate-400">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Card Widget</p>
                        </div>
                      )}
                      {widget.type === 'bar-chart' && (
                        <div className="text-center py-8 text-slate-400">
                          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Bar Chart</p>
                        </div>
                      )}
                      {widget.type === 'line-chart' && (
                        <div className="text-center py-8 text-slate-400">
                          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Line Chart</p>
                        </div>
                      )}
                      {widget.type === 'pie-chart' && (
                        <div className="text-center py-8 text-slate-400">
                          <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Pie Chart</p>
                        </div>
                      )}
                      {widget.type === 'gauge' && (
                        <div className="text-center py-8 text-slate-400">
                          <Gauge className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Gauge Widget</p>
                        </div>
                      )}
                      {widget.type === 'map' && (
                        <div className="w-full h-full">
                          <WorkflowMapComponent
                            config={{
                              center: (widget.config.center as [number, number]) || [51.505, -0.09],
                              zoom: (widget.config.zoom as number) || 13,
                              tileProvider: (widget.config.tileProvider as 'osm' | 'carto' | 'esri' | 'stamen' | 'custom') || 'osm',
                              markers: (widget.config.markers as any[]) || [],
                              showZoomControls: widget.config.showZoomControls !== false,
                              showFullscreen: false,
                              showSettings: false,
                              height: '100%',
                            }}
                            className="rounded-lg"
                          />
                        </div>
                      )}
                      {widget.type === 'text' && (
                        <div className="text-center py-8 text-slate-400">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Text Widget</p>
                        </div>
                      )}
                    </div>

                    {/* Resize Handles */}
                    {isSelected && (
                      <>
                        <div
                          className="absolute bottom-0 right-0 w-4 h-4 bg-purple-500 cursor-se-resize"
                          style={{ transform: 'translate(50%, 50%)' }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            // TODO: Implement resize
                          }}
                        />
                      </>
                    )}
                  </motion.div>
                );
              })}

              {widgets.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <LayoutDashboard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm text-slate-600 mb-2">No widgets yet</p>
                    <p className="text-xs text-slate-400">Add widgets from the left panel to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfigPanel && selectedWidget && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 320 }}
            exit={{ width: 0 }}
            className="border-l border-slate-300/50 bg-slate-50/30 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-tight">
                  Widget Settings
                </h3>
                <button
                  onClick={() => setShowConfigPanel(false)}
                  className="p-1 hover:bg-slate-200/50 rounded"
                >
                  <X className="w-3 h-3 text-slate-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={selectedWidget.title}
                    onChange={(e) => updateWidget(selectedWidget.id, { title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Data Source */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Data Source</label>
                  <select
                    value={selectedWidget.dataSource || ''}
                    onChange={(e) => updateWidget(selectedWidget.id, { dataSource: e.target.value || undefined })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">No data source</option>
                    {dataSourceNodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.data.label || node.id}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Select a node that provides data (e.g., Web Scraper)
                  </p>
                </div>

                {/* Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Width</label>
                    <input
                      type="number"
                      value={selectedWidget.width}
                      onChange={(e) => updateWidget(selectedWidget.id, { width: parseInt(e.target.value) || 400 })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="200"
                      max="800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Height</label>
                    <input
                      type="number"
                      value={selectedWidget.height}
                      onChange={(e) => updateWidget(selectedWidget.id, { height: parseInt(e.target.value) || 300 })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="150"
                      max="600"
                    />
                  </div>
                </div>

                {/* Widget-specific config */}
                {selectedWidget.type === 'table' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Fields to Display</label>
                    <textarea
                      value={(selectedWidget.config.fields as string[])?.join(', ') || ''}
                      onChange={(e) => updateWidget(selectedWidget.id, {
                        config: {
                          ...selectedWidget.config,
                          fields: e.target.value.split(',').map(f => f.trim()).filter(Boolean),
                        },
                      })}
                      placeholder="field1, field2, field3"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Comma-separated list of fields to display
                    </p>
                  </div>
                )}

                {selectedWidget.type === 'map' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Map Center (Lat, Lng)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="any"
                          value={((selectedWidget.config.center as [number, number])?.[0] || 51.505).toString()}
                          onChange={(e) => {
                            const lat = parseFloat(e.target.value) || 51.505;
                            const lng = ((selectedWidget.config.center as [number, number])?.[1] || -0.09);
                            updateWidget(selectedWidget.id, {
                              config: {
                                ...selectedWidget.config,
                                center: [lat, lng],
                              },
                            });
                          }}
                          placeholder="Latitude"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="number"
                          step="any"
                          value={((selectedWidget.config.center as [number, number])?.[1] || -0.09).toString()}
                          onChange={(e) => {
                            const lat = ((selectedWidget.config.center as [number, number])?.[0] || 51.505);
                            const lng = parseFloat(e.target.value) || -0.09;
                            updateWidget(selectedWidget.id, {
                              config: {
                                ...selectedWidget.config,
                                center: [lat, lng],
                              },
                            });
                          }}
                          placeholder="Longitude"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Zoom Level</label>
                      <input
                        type="number"
                        value={(selectedWidget.config.zoom as number) || 13}
                        onChange={(e) => updateWidget(selectedWidget.id, {
                          config: {
                            ...selectedWidget.config,
                            zoom: parseInt(e.target.value) || 13,
                          },
                        })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="1"
                        max="18"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Tile Provider</label>
                      <select
                        value={(selectedWidget.config.tileProvider as string) || 'osm'}
                        onChange={(e) => updateWidget(selectedWidget.id, {
                          config: {
                            ...selectedWidget.config,
                            tileProvider: e.target.value,
                          },
                        })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="osm">OpenStreetMap</option>
                        <option value="carto">CartoDB</option>
                        <option value="esri">Esri</option>
                        <option value="stamen">Stamen</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="showZoomControls"
                        checked={selectedWidget.config.showZoomControls !== false}
                        onChange={(e) => updateWidget(selectedWidget.id, {
                          config: {
                            ...selectedWidget.config,
                            showZoomControls: e.target.checked,
                          },
                        })}
                        className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="showZoomControls" className="text-xs font-medium text-slate-700">
                        Show Zoom Controls
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardDesigner;


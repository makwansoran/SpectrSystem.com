/**
 * Dashboard View Component
 * Displays the actual dashboard with widgets rendered (read-only view)
 * Shows real data from workflow executions with charts, analysis, and risk indicators
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
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { FlowNode } from '../types';
import { DashboardWidget } from './DashboardDesigner';
import { useWorkflowStore } from '../stores/workflowStore';

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

// Helper function to extract data from node output
const extractDataFromOutput = (output: unknown): unknown[] => {
  if (!output) return [];
  
  if (Array.isArray(output)) {
    return output;
  }
  
  if (typeof output === 'object' && output !== null) {
    // If it's an object, try to find array properties
    const obj = output as Record<string, unknown>;
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        return obj[key] as unknown[];
      }
    }
    // If no array found, convert object to array of entries
    return [output];
  }
  
  return [];
};

// Helper function to process data for charts
const processChartData = (data: unknown[], fields?: string[]): Array<Record<string, unknown>> => {
  if (!Array.isArray(data) || data.length === 0) return [];
  
  // If fields are specified, extract only those fields
  if (fields && fields.length > 0) {
    return data.map((item) => {
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>;
        const result: Record<string, unknown> = {};
        fields.forEach((field) => {
          result[field] = obj[field] ?? null;
        });
        return result;
      }
      return { value: item };
    });
  }
  
  // Auto-detect fields from first item
  if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
    const firstItem = data[0] as Record<string, unknown>;
    return data.map((item) => {
      if (typeof item === 'object' && item !== null) {
        return item as Record<string, unknown>;
      }
      return { value: item };
    });
  }
  
  // Simple array of values
  return data.map((item, index) => ({ name: `Item ${index + 1}`, value: item }));
};

// Helper function to calculate risk score
const calculateRiskScore = (data: unknown[]): number => {
  if (!Array.isArray(data) || data.length === 0) return 0;
  
  let riskScore = 0;
  data.forEach((item) => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      // Look for risk-related fields
      if (typeof obj.risk === 'number') riskScore += obj.risk as number;
      if (typeof obj.error === 'string' && obj.error) riskScore += 10;
      if (typeof obj.status === 'string' && obj.status === 'failed') riskScore += 20;
    }
  });
  
  return Math.min(100, Math.max(0, riskScore / data.length));
};

// Helper function to analyze data
const analyzeData = (data: unknown[]): { summary: string; risks: string[]; insights: string[] } => {
  const risks: string[] = [];
  const insights: string[] = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    return {
      summary: 'No data available',
      risks: ['No data to analyze'],
      insights: ['Add data sources to see analysis'],
    };
  }
  
  const dataLength = data.length;
  insights.push(`Total records: ${dataLength}`);
  
  // Check for errors or failures
  const hasErrors = data.some((item) => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return obj.error || obj.status === 'failed';
    }
    return false;
  });
  
  if (hasErrors) {
    risks.push('Some records contain errors');
  }
  
  // Check for missing data
  if (dataLength === 0) {
    risks.push('No data available');
  }
  
  // Analyze data structure
  if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
    const firstItem = data[0] as Record<string, unknown>;
    const keys = Object.keys(firstItem);
    insights.push(`Data fields: ${keys.length}`);
  }
  
  return {
    summary: `${dataLength} records processed`,
    risks: risks.length > 0 ? risks : ['No risks detected'],
    insights: insights.length > 0 ? insights : ['Data looks good'],
  };
};

const DashboardView: React.FC<DashboardViewProps> = ({
  dashboardNode,
  workflowNodes,
  onEdit,
  onClose,
}) => {
  const { currentExecution, executions } = useWorkflowStore();
  
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
  
  // Get execution data for a specific node
  const getNodeExecutionData = (nodeId: string): unknown => {
    // Try current execution first
    if (currentExecution?.nodeResults) {
      const result = currentExecution.nodeResults.find(r => r.nodeId === nodeId);
      if (result?.output) return result.output;
    }
    
    // Try latest execution - get workflowId from store
    const { workflowId } = useWorkflowStore.getState();
    const latestExecution = executions
      .filter(e => e.workflowId === workflowId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    if (latestExecution?.nodeResults) {
      const result = latestExecution.nodeResults.find(r => r.nodeId === nodeId);
      if (result?.output) return result.output;
    }
    
    // Try node's stored execution output
    const node = workflowNodes.find(n => n.id === nodeId);
    if (node?.data.executionOutput) {
      return node.data.executionOutput;
    }
    
    return null;
  };

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
                {widgets.length} {widgets.length === 1 ? 'widget' : 'widgets'} • 
                {currentExecution ? ' Showing latest execution' : ' No execution data'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Refresh data by re-fetching executions
                const { fetchExecutions } = useWorkflowStore.getState();
                fetchExecutions();
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors border border-slate-300"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors shadow-sm"
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
                  {(() => {
                    // Get data from data source node
                    const nodeData = widget.dataSource ? getNodeExecutionData(widget.dataSource) : null;
                    const rawData = extractDataFromOutput(nodeData);
                    const chartData = processChartData(rawData, widget.config.fields as string[]);
                    const analysis = analyzeData(rawData);
                    const riskScore = calculateRiskScore(rawData);
                    
                    // Render based on widget type
                    if (widget.type === 'table') {
                      if (rawData.length === 0) {
                        return (
                          <div className="text-center py-8 text-slate-400">
                            <Table className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">No data available</p>
                            <p className="text-[10px] mt-1">Run the workflow to see data</p>
                          </div>
                        );
                      }
                      
                      // Get headers from first item or configured fields
                      const headers = widget.config.fields && widget.config.fields.length > 0
                        ? widget.config.fields
                        : (rawData.length > 0 && typeof rawData[0] === 'object' && rawData[0] !== null
                          ? Object.keys(rawData[0] as Record<string, unknown>)
                          : ['Value']);
                      
                      return (
                        <div className="overflow-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                {headers.map((header, idx) => (
                                  <th key={idx} className="px-2 py-2 text-left font-semibold text-slate-700">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {rawData.slice(0, 50).map((row, rowIdx) => (
                                <tr key={rowIdx} className="border-b border-slate-100 hover:bg-slate-50">
                                  {headers.map((header, colIdx) => {
                                    const value = typeof row === 'object' && row !== null
                                      ? (row as Record<string, unknown>)[header]
                                      : row;
                                    return (
                                      <td key={colIdx} className="px-2 py-2 text-slate-600">
                                        {value !== null && value !== undefined
                                          ? String(value).slice(0, 50)
                                          : '-'}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {rawData.length > 50 && (
                            <p className="text-[10px] text-slate-400 mt-2 text-center">
                              Showing 50 of {rawData.length} rows
                            </p>
                          )}
                        </div>
                      );
                    }
                    
                    if (widget.type === 'card') {
                      const firstItem = rawData.length > 0 ? rawData[0] : null;
                      const value = firstItem && typeof firstItem === 'object' && firstItem !== null
                        ? Object.values(firstItem as Record<string, unknown>)[0]
                        : rawData.length;
                      
                      return (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="text-4xl font-bold text-purple-600 mb-2">
                            {typeof value === 'number' ? value.toLocaleString() : String(value)}
                          </div>
                          <p className="text-xs text-slate-600 font-medium">{widget.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {rawData.length} {rawData.length === 1 ? 'record' : 'records'}
                          </p>
                        </div>
                      );
                    }
                    
                    if (widget.type === 'bar-chart') {
                      if (chartData.length === 0) {
                        return (
                          <div className="text-center py-8 text-slate-400">
                            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">No data available</p>
                          </div>
                        );
                      }
                      
                      const dataKeys = chartData.length > 0
                        ? Object.keys(chartData[0]).filter(k => k !== 'name')
                        : [];
                      
                      return (
                        <div className="w-full h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                              <YAxis stroke="#64748b" fontSize={10} />
                              <Tooltip />
                              <Legend />
                              {dataKeys.map((key, idx) => (
                                <Bar
                                  key={key}
                                  dataKey={key}
                                  fill={['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][idx % 5]}
                                />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    }
                    
                    if (widget.type === 'line-chart') {
                      if (chartData.length === 0) {
                        return (
                          <div className="text-center py-8 text-slate-400">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">No data available</p>
                          </div>
                        );
                      }
                      
                      const dataKeys = chartData.length > 0
                        ? Object.keys(chartData[0]).filter(k => k !== 'name')
                        : [];
                      
                      return (
                        <div className="w-full h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                              <YAxis stroke="#64748b" fontSize={10} />
                              <Tooltip />
                              <Legend />
                              {dataKeys.map((key, idx) => (
                                <Line
                                  key={key}
                                  type="monotone"
                                  dataKey={key}
                                  stroke={['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][idx % 5]}
                                  strokeWidth={2}
                                />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    }
                    
                    if (widget.type === 'pie-chart') {
                      if (chartData.length === 0) {
                        return (
                          <div className="text-center py-8 text-slate-400">
                            <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">No data available</p>
                          </div>
                        );
                      }
                      
                      const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];
                      const dataKey = chartData.length > 0
                        ? Object.keys(chartData[0]).find(k => k !== 'name') || 'value'
                        : 'value';
                      
                      return (
                        <div className="w-full h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey={dataKey}
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    }
                    
                    if (widget.type === 'gauge') {
                      const value = rawData.length > 0 && typeof rawData[0] === 'object' && rawData[0] !== null
                        ? (rawData[0] as Record<string, unknown>).value || riskScore
                        : riskScore;
                      
                      const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
                      const percentage = Math.min(100, Math.max(0, numValue));
                      
                      return (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="relative w-32 h-32">
                            <svg className="transform -rotate-90 w-32 h-32">
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="#e2e8f0"
                                strokeWidth="12"
                                fill="none"
                              />
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke={percentage > 70 ? '#ef4444' : percentage > 40 ? '#f59e0b' : '#10b981'}
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 56}`}
                                strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-slate-900">{Math.round(percentage)}%</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 mt-4 font-medium">{widget.title}</p>
                        </div>
                      );
                    }
                    
                    if (widget.type === 'text') {
                      const textContent = widget.config.textContent as string || analysis.summary;
                      return (
                        <div className="h-full overflow-auto">
                          <div className="prose prose-sm max-w-none">
                            <p className="text-xs text-slate-700 whitespace-pre-wrap">{textContent}</p>
                            {analysis.insights.length > 0 && (
                              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                                <p className="text-[10px] font-semibold text-blue-900 mb-2">INSIGHTS</p>
                                <ul className="text-[10px] text-blue-800 space-y-1">
                                  {analysis.insights.map((insight, idx) => (
                                    <li key={idx}>• {insight}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {analysis.risks.length > 0 && analysis.risks[0] !== 'No risks detected' && (
                              <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                                <p className="text-[10px] font-semibold text-red-900 mb-2 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  RISKS
                                </p>
                                <ul className="text-[10px] text-red-800 space-y-1">
                                  {analysis.risks.map((risk, idx) => (
                                    <li key={idx}>• {risk}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    
                    if (widget.type === 'map') {
                      return (
                        <div className="text-center py-8 text-slate-400">
                          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Map visualization</p>
                          <p className="text-[10px] mt-1">Geographic data: {rawData.length} points</p>
                        </div>
                      );
                    }
                    
                    return null;
                  })()}
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


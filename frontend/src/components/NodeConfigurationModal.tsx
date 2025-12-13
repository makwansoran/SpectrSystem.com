/**
 * Node Configuration Modal
 * Modal for configuring nodes, including integration nodes with provider/action selection
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Copy, Trash2, ChevronDown,
  CreditCard, Wallet, Square, ShoppingBag, ShoppingCart,
  Database, Leaf, Zap, Flame,
  MessageSquare, MessageCircle, Mail, Send, Phone, Users,
  HardDrive, Droplet, Box, Cloud, FolderSync,
  Twitter, Linkedin, Facebook, Instagram, Youtube, Music,
  Target, TrendingUp, Building2, UserCheck,
  Table, FileText, Calendar, BookOpen, Grid3X3, LayoutGrid, CheckSquare, LayoutDashboard, MousePointerClick, ListTodo,
  Github, GitBranch, Bug, Layers, AlertTriangle, Sparkles, Megaphone,
  BarChart3, PieChart, Activity, FileQuestion, ClipboardList, FormInput,
  Headphones, HelpCircle, MessagesSquare
} from 'lucide-react';
import { useWorkflowStore } from '../stores/workflowStore';
import { getNodeDefinition } from '../constants/nodes';
import { INTEGRATION_CATEGORIES, getProvidersForCategory, getActionsForProvider } from '../constants/integrations';
import type { 
  HttpRequestConfig, 
  SetVariableConfig, 
  ConditionConfig,
  WebhookResponseConfig,
  WebhookTriggerConfig,
  ScheduleConfig,
  StoreDataConfig,
  WebScraperConfig,
  DatabaseConfig,
  LoopConfig,
  CodeConfig,
  AIAgentConfig
} from '../types';
import {
  DomainIntelligenceSettings,
  IPGeolocationSettings,
  EntityExtractionSettings,
  GeocodingSettings,
  WeatherDataSettings,
  ShipTrackingSettings,
  FlightTrackingSettings,
  SatelliteImagerySettings,
  DataEnrichmentSettings,
  MapVisualizationSettings,
  ReportGeneratorSettings,
} from './IntelligenceNodeSettings';

const NodeConfigurationModal: React.FC = () => {
  const {
    selectedNode,
    setSelectedNode,
    updateNodeData,
    deleteSelected,
    duplicateNode,
  } = useWorkflowStore();

  const [activeTab, setActiveTab] = useState<'settings' | 'output'>('settings');
  const [integrationCategory, setIntegrationCategory] = useState<string>('');
  const [integrationProvider, setIntegrationProvider] = useState<string>('');
  const [integrationAction, setIntegrationAction] = useState<string>('');

  useEffect(() => {
    setActiveTab('settings');
    if (selectedNode) {
      // Check if this is an integration node
      const isIntegrationNode = selectedNode.type.includes('-integration');
      if (isIntegrationNode) {
        // Extract category from node type (e.g., 'financial-integration' -> 'financial')
        // Handle 'social-media-integration' -> 'social-media' correctly
        const category = selectedNode.type.replace('-integration', '');
        setIntegrationCategory(category);
        
        // Load saved integration config
        const config = selectedNode.data.config as any;
        if (config.provider) {
          setIntegrationProvider(config.provider);
        } else {
          setIntegrationProvider(''); // Reset if no provider saved
        }
        if (config.action) {
          setIntegrationAction(config.action);
        } else {
          setIntegrationAction(''); // Reset if no action saved
        }
      } else {
        // Reset integration state for non-integration nodes
        setIntegrationCategory('');
        setIntegrationProvider('');
        setIntegrationAction('');
      }
    } else {
      // Reset when no node selected
      setIntegrationCategory('');
      setIntegrationProvider('');
      setIntegrationAction('');
    }
  }, [selectedNode?.id]);

  if (!selectedNode) return null;

  const definition = getNodeDefinition(selectedNode.type);
  const isIntegrationNode = selectedNode.type.includes('-integration');

  const handleConfigChange = (key: string, value: unknown) => {
    updateNodeData(selectedNode.id, {
      config: { ...selectedNode.data.config, [key]: value },
    });
  };

  const handleLabelChange = (label: string) => {
    updateNodeData(selectedNode.id, { label });
  };

  const handleDelete = () => {
    deleteSelected();
    setSelectedNode(null);
  };

  const handleDuplicate = () => {
    duplicateNode(selectedNode.id);
    setSelectedNode(null);
  };

  const handleClose = () => {
    setSelectedNode(null);
  };

  // Integration node handlers
  const handleIntegrationProviderChange = (providerId: string) => {
    setIntegrationProvider(providerId);
    setIntegrationAction(''); // Reset action when provider changes
    handleConfigChange('provider', providerId);
    handleConfigChange('action', '');
  };

  const handleIntegrationActionChange = (actionId: string) => {
    setIntegrationAction(actionId);
    handleConfigChange('action', actionId);
  };

  // Get integration category data
  const integrationCategoryData = integrationCategory ? INTEGRATION_CATEGORIES[integrationCategory] : null;
  
  // Get providers for this category
  const providers = integrationCategoryData ? getProvidersForCategory(integrationCategory) : [];
  
  // Get selected provider details
  const provider = integrationProvider && integrationCategoryData 
    ? integrationCategoryData.providers[integrationProvider] 
    : null;
  
  // Get actions for selected provider
  const actions = provider && integrationCategory 
    ? getActionsForProvider(integrationCategory, integrationProvider) 
    : [];
  
  // Get selected action details
  const selectedAction = integrationAction && provider 
    ? provider.actions[integrationAction] 
    : null;

  return (
    <AnimatePresence>
      {selectedNode && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col relative" style={{ overflow: 'visible' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={selectedNode.data.label}
                    onChange={(e) => handleLabelChange(e.target.value)}
                    className="text-sm font-semibold text-slate-900 bg-transparent border-none outline-none w-full focus:bg-slate-50 focus:px-2 focus:py-1 focus:rounded focus:border focus:border-slate-300 transition-all"
                  />
                  <div className="text-xs text-slate-500 mt-1">{definition?.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDuplicate}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                    title="Duplicate node"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete node"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-6 px-6 py-3 border-b border-slate-200 bg-white">
                {(['settings', 'output'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-all uppercase tracking-tight relative group pb-1"
                  >
                    <span className="relative">
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {activeTab === tab && (
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-slate-900 transition-all duration-300"></span>
                      )}
                      {activeTab !== tab && (
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></span>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-white relative" style={{ overflowX: 'visible' }}>
                {activeTab === 'settings' ? (
                  <>
                    {isIntegrationNode ? (
                      <IntegrationNodeSettings
                        category={integrationCategory}
                        categoryData={integrationCategoryData}
                        providers={providers}
                        selectedProvider={integrationProvider}
                        provider={provider}
                        actions={actions}
                        selectedAction={integrationAction}
                        action={selectedAction}
                        config={selectedNode.data.config}
                        onProviderChange={handleIntegrationProviderChange}
                        onActionChange={handleIntegrationActionChange}
                        onConfigChange={handleConfigChange}
                      />
                    ) : (
                      <NodeSettings
                        nodeType={selectedNode.type}
                        config={selectedNode.data.config}
                        onChange={handleConfigChange}
                      />
                    )}
                  </>
                ) : (
                  <OutputView output={selectedNode.data.executionOutput} />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Icon mapping for providers (by icon name from integration definitions)
const PROVIDER_ICONS: Record<string, React.FC<{ className?: string }>> = {
  CreditCard,
  Wallet,
  Square,
  ShoppingBag,
  ShoppingCart,
  Database,
  Leaf,
  Zap,
  Flame,
  MessageSquare,
  MessageCircle,
  Mail,
  Send,
  Phone,
  Users,
  HardDrive,
  Droplet,
  Box,
  Cloud,
  FolderSync,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Music,
  Target,      // HubSpot
  TrendingUp,  // Pipedrive
  Building2,   // Zoho CRM
  UserCheck,   // Freshsales
  Table,       // Google Sheets, Excel
  FileText,    // Google Docs
  Calendar,    // Google Calendar
  BookOpen,    // Notion
  Grid3X3,     // Airtable
  LayoutGrid,  // Trello
  CheckSquare, // Asana
  LayoutDashboard, // Monday.com
  MousePointerClick, // ClickUp
  ListTodo,    // Todoist
  Github,      // GitHub
  GitBranch,   // GitLab, Bitbucket
  Bug,         // Jira
  Layers,      // Linear
  AlertTriangle, // Sentry
  Sparkles,    // ConvertKit
  Megaphone,   // Google Ads, Facebook Ads
  BarChart3,   // Google Analytics
  PieChart,    // Mixpanel
  Activity,    // Segment
  FileQuestion, // Typeform
  ClipboardList, // Google Forms
  FormInput,   // JotForm
  Headphones,  // Zendesk
  HelpCircle,  // Freshdesk
  MessagesSquare, // Crisp
};

// Animated Dropdown Component
interface AnimatedDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; name: string; icon?: string }>;
  placeholder: string;
  label: string;
  required?: boolean;
}

const AnimatedDropdown: React.FC<AnimatedDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder,
  label,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Calculate position for fixed dropdown
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.id === value);
  const SelectedIcon = selectedOption?.icon ? (PROVIDER_ICONS[selectedOption.icon] || null) : null;

  const dropdownMenu = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed bg-white border border-slate-300 rounded-lg shadow-xl max-h-60 overflow-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 10000,
          }}
        >
          {options.map((option, index) => {
            const Icon = option.icon ? (PROVIDER_ICONS[option.icon] || null) : null;
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                  value === option.id ? 'bg-slate-100' : ''
                }`}
              >
                {Icon && (
                  <Icon className="w-4 h-4 flex-shrink-0 text-slate-600" />
                )}
                <span className="flex-1">{option.name}</span>
                {value === option.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-slate-900"
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="relative">
        <label className="block text-sm font-medium text-slate-900 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all flex items-center justify-between hover:border-slate-400"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {SelectedIcon && (
              <SelectedIcon className="w-4 h-4 flex-shrink-0 text-slate-600" />
            )}
            <span className="truncate">{selectedOption ? selectedOption.name : placeholder}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
          </motion.div>
        </button>
      </div>
      {typeof document !== 'undefined' && createPortal(dropdownMenu, document.body)}
    </>
  );
};

// Integration Node Settings
interface IntegrationNodeSettingsProps {
  category: string;
  categoryData: any;
  providers: any[];
  selectedProvider: string;
  provider: any;
  actions: any[];
  selectedAction: string;
  action: any;
  config: Record<string, unknown>;
  onProviderChange: (providerId: string) => void;
  onActionChange: (actionId: string) => void;
  onConfigChange: (key: string, value: unknown) => void;
}

const IntegrationNodeSettings: React.FC<IntegrationNodeSettingsProps> = ({
  categoryData,
  providers,
  selectedProvider,
  provider,
  actions,
  selectedAction,
  action,
  config,
  onProviderChange,
  onActionChange,
  onConfigChange,
}) => {
  if (!categoryData) {
    return (
      <div className="text-center text-slate-400 text-sm py-8">
        Loading integration category...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Select Provider */}
      <div>
        <AnimatedDropdown
          value={selectedProvider}
          onChange={onProviderChange}
          options={providers.map(p => ({
            id: p.id,
            name: p.name,
            icon: p.icon,
          }))}
          placeholder="Select Provider"
          label="Select Integration Provider"
          required
        />
        {provider && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-slate-500 mt-1"
          >
            {provider.description}
          </motion.p>
        )}
        {providers.length === 0 && (
          <p className="text-xs text-red-500 mt-1">No providers found for this integration category</p>
        )}
      </div>

      {/* Step 2: Select Action */}
      {provider && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatedDropdown
            value={selectedAction}
            onChange={onActionChange}
            options={actions.map(a => ({
              id: a.id,
              name: a.name,
            }))}
            placeholder="Select Action"
            label="Select Action"
            required
          />
          {action && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-slate-500 mt-1"
            >
              {action.description}
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Step 3: Configure Parameters */}
      {action && action.parameters && (
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-3">
            Action Parameters
          </label>
          <div className="space-y-4">
            {action.parameters.map((param: any) => (
              <div key={param.name}>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  {param.label}
                  {param.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {param.type === 'select' ? (
                  <select
                    value={(config[param.name] as string) || param.default || ''}
                    onChange={(e) => onConfigChange(param.name, e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  >
                    {param.options?.map((opt: string) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : param.type === 'textarea' ? (
                  <textarea
                    value={(config[param.name] as string) || ''}
                    onChange={(e) => onConfigChange(param.name, e.target.value)}
                    placeholder={param.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 resize-none"
                  />
                ) : param.type === 'number' ? (
                  <input
                    type="number"
                    value={(config[param.name] as number) || param.default || ''}
                    onChange={(e) => onConfigChange(param.name, e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder={param.placeholder}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                ) : param.type === 'boolean' ? (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(config[param.name] as boolean) || false}
                      onChange={(e) => onConfigChange(param.name, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{param.label}</span>
                  </label>
                ) : (
                  <input
                    type="text"
                    value={(config[param.name] as string) || ''}
                    onChange={(e) => onConfigChange(param.name, e.target.value)}
                    placeholder={param.placeholder}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                )}
                {param.placeholder && param.type !== 'textarea' && (
                  <p className="text-xs text-slate-400 mt-1">{param.placeholder}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Node Settings (reuse from RightPanel)
interface NodeSettingsProps {
  nodeType: string;
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

const NodeSettings: React.FC<NodeSettingsProps> = ({ nodeType, config, onChange }) => {
  switch (nodeType) {
    case 'http-request':
      return <HttpRequestSettings config={(config || {}) as unknown as HttpRequestConfig} onChange={onChange} />;
    case 'web-scraper':
      return <WebScraperSettings config={(config || {}) as unknown as WebScraperConfig} onChange={onChange} />;
    case 'database':
      return <DatabaseSettings config={(config || {}) as unknown as DatabaseConfig} onChange={onChange} />;
    case 'set-variable':
      return <SetVariableSettings config={(config || {}) as unknown as SetVariableConfig} onChange={onChange} />;
    case 'condition':
      return <ConditionSettings config={(config || {}) as unknown as ConditionConfig} onChange={onChange} />;
    case 'loop':
      return <LoopSettings config={(config || {}) as unknown as LoopConfig} onChange={onChange} />;
    case 'code':
      return <CodeSettings config={(config || {}) as unknown as CodeConfig} onChange={onChange} />;
    case 'ai-agent':
      return <AIAgentSettings config={(config || {}) as unknown as AIAgentConfig} onChange={onChange} />;
    case 'webhook-response':
      return <WebhookResponseSettings config={(config || {}) as unknown as WebhookResponseConfig} onChange={onChange} />;
    case 'webhook-trigger':
      return <WebhookTriggerSettings config={(config || {}) as unknown as WebhookTriggerConfig} onChange={onChange} />;
    case 'schedule-trigger':
      return <ScheduleSettings config={(config || {}) as unknown as ScheduleConfig} onChange={onChange} />;
    case 'store-data':
      return <StoreDataSettings config={(config || {}) as unknown as StoreDataConfig} onChange={onChange} />;
    // Intelligence nodes
    case 'osint-domain':
      return <DomainIntelligenceSettings config={config} onChange={onChange} />;
    case 'intel-entity-extraction':
      return <EntityExtractionSettings config={config} onChange={onChange} />;
    case 'geoint-geocoding':
      return <GeocodingSettings config={config} onChange={onChange} />;
    case 'geoint-weather':
      return <WeatherDataSettings config={config} onChange={onChange} />;
    case 'geoint-ip-geolocation':
      return <IPGeolocationSettings config={config} onChange={onChange} />;
    case 'geoint-ship-tracking':
      return <ShipTrackingSettings config={config} onChange={onChange} />;
    case 'geoint-flight-tracking':
      return <FlightTrackingSettings config={config} onChange={onChange} />;
    case 'geoint-satellite':
      return <SatelliteImagerySettings config={config} onChange={onChange} />;
    case 'intel-data-enrichment':
      return <DataEnrichmentSettings config={config} onChange={onChange} />;
    case 'intel-map-visualization':
      return <MapVisualizationSettings config={config} onChange={onChange} />;
    case 'intel-report-generator':
      return <ReportGeneratorSettings config={config} onChange={onChange} />;
    default:
      return <div className="text-center text-slate-400 text-sm py-8">No settings available</div>;
  }
};

// Reuse form components from RightPanel (simplified versions)
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-sm font-medium text-slate-900 mb-2">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
  />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select
    {...props}
    className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
  />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className="w-full px-3 py-2 text-sm rounded-lg resize-none bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
  />
);

// Settings components (simplified - reuse logic from RightPanel)
const HttpRequestSettings: React.FC<{
  config: HttpRequestConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Method</Label>
      <Select value={config.method || 'GET'} onChange={(e) => onChange('method', e.target.value)}>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
      </Select>
    </div>
    <div>
      <Label>URL</Label>
      <Input
        value={config.url || ''}
        onChange={(e) => onChange('url', e.target.value)}
        placeholder="https://api.example.com"
      />
    </div>
    {['POST', 'PUT', 'PATCH'].includes(config.method || 'GET') && (
      <div>
        <Label>Body</Label>
        <Textarea
          value={config.body || ''}
          onChange={(e) => onChange('body', e.target.value)}
          placeholder='{"key": "value"}'
          rows={4}
        />
      </div>
    )}
  </div>
);

const SetVariableSettings: React.FC<{
  config: SetVariableConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  const variables = config.variables || [];
  return (
    <div className="space-y-3">
      {variables.map((variable, index) => (
        <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex gap-2 mb-2">
            <Input
              value={variable.key}
              onChange={(e) => {
                const updated = variables.map((v, i) => (i === index ? { ...v, key: e.target.value } : v));
                onChange('variables', updated);
              }}
              placeholder="key"
              className="flex-1"
            />
          </div>
          <Input
            value={variable.value}
            onChange={(e) => {
              const updated = variables.map((v, i) => (i === index ? { ...v, value: e.target.value } : v));
              onChange('variables', updated);
            }}
            placeholder="value"
          />
        </div>
      ))}
    </div>
  );
};

const ConditionSettings: React.FC<{
  config: ConditionConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Field</Label>
      <Input
        value={config.field || ''}
        onChange={(e) => onChange('field', e.target.value)}
        placeholder="data.status"
      />
    </div>
    <div>
      <Label>Operator</Label>
      <Select value={config.operator || 'equals'} onChange={(e) => onChange('operator', e.target.value)}>
        <option value="equals">equals</option>
        <option value="not_equals">not equals</option>
        <option value="contains">contains</option>
        <option value="greater_than">greater than</option>
        <option value="less_than">less than</option>
      </Select>
    </div>
    <div>
      <Label>Value</Label>
      <Input
        value={config.value || ''}
        onChange={(e) => onChange('value', e.target.value)}
        placeholder="expected value"
      />
    </div>
  </div>
);

const WebhookResponseSettings: React.FC<{
  config: WebhookResponseConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Status Code</Label>
      <Select value={config.statusCode || 200} onChange={(e) => onChange('statusCode', parseInt(e.target.value))}>
        <option value={200}>200 OK</option>
        <option value={201}>201 Created</option>
        <option value={400}>400 Bad Request</option>
        <option value={404}>404 Not Found</option>
        <option value={500}>500 Error</option>
      </Select>
    </div>
    <div>
      <Label>Body</Label>
      <Textarea
        value={config.body || ''}
        onChange={(e) => onChange('body', e.target.value)}
        placeholder='{"success": true}'
        rows={4}
      />
    </div>
  </div>
);

const WebhookTriggerSettings: React.FC<{
  config: WebhookTriggerConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Method</Label>
      <Select value={config.method || 'POST'} onChange={(e) => onChange('method', e.target.value)}>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
      </Select>
    </div>
    <div>
      <Label>Path</Label>
      <Input
        value={config.path || ''}
        onChange={(e) => onChange('path', e.target.value)}
        placeholder="/webhook"
      />
    </div>
  </div>
);

const ScheduleSettings: React.FC<{
  config: ScheduleConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Cron Expression</Label>
      <Input
        value={config.cronExpression || ''}
        onChange={(e) => onChange('cronExpression', e.target.value)}
        placeholder="0 * * * *"
      />
      <p className="text-xs text-slate-400 mt-1">minute hour day month weekday</p>
    </div>
  </div>
);

const StoreDataSettings: React.FC<{
  config: StoreDataConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Key</Label>
      <Input
        value={config.key || ''}
        onChange={(e) => onChange('key', e.target.value)}
        placeholder="my-data"
      />
    </div>
    <div>
      <Label>Value</Label>
      <Input
        value={config.value || ''}
        onChange={(e) => onChange('value', e.target.value)}
        placeholder="{{$input.data}}"
      />
    </div>
  </div>
);

const WebScraperSettings: React.FC<{
  config: WebScraperConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>URL to Scrape</Label>
      <Input
        value={config.url || ''}
        onChange={(e) => onChange('url', e.target.value)}
        placeholder="https://example.com/page"
      />
    </div>
  </div>
);

const DatabaseSettings: React.FC<{
  config: DatabaseConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Operation</Label>
      <Select value={config.operation || 'insert'} onChange={(e) => onChange('operation', e.target.value)}>
        <option value="insert">INSERT</option>
        <option value="select">SELECT</option>
        <option value="update">UPDATE</option>
        <option value="delete">DELETE</option>
        <option value="query">RAW SQL Query</option>
      </Select>
    </div>
    {config.operation !== 'query' && (
      <div>
        <Label>Table Name</Label>
        <Input
          value={config.table || ''}
          onChange={(e) => onChange('table', e.target.value)}
          placeholder="scraped_data"
        />
      </div>
    )}
    {config.operation === 'query' && (
      <div>
        <Label>SQL Query</Label>
        <Textarea
          value={config.query || ''}
          onChange={(e) => onChange('query', e.target.value)}
          placeholder="SELECT * FROM table WHERE ..."
          rows={4}
        />
      </div>
    )}
  </div>
);

const LoopSettings: React.FC<{
  config: LoopConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Items (array expression)</Label>
      <Input
        value={config.items || ''}
        onChange={(e) => onChange('items', e.target.value)}
        placeholder="{{$input.data}}"
      />
    </div>
    <div>
      <Label>Item Variable Name</Label>
      <Input
        value={config.itemVariable || ''}
        onChange={(e) => onChange('itemVariable', e.target.value)}
        placeholder="item"
      />
    </div>
  </div>
);

const CodeSettings: React.FC<{
  config: CodeConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>JavaScript Code</Label>
      <Textarea
        value={config.code || ''}
        onChange={(e) => onChange('code', e.target.value)}
        placeholder="// Access input data with $input"
        rows={10}
        className="font-mono text-xs"
      />
    </div>
  </div>
);

const AIAgentSettings: React.FC<{
  config: AIAgentConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Provider</Label>
      <Select value={config.provider || 'openai'} onChange={(e) => onChange('provider', e.target.value)}>
        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic (Claude)</option>
        <option value="ollama">Ollama (Local)</option>
      </Select>
    </div>
    <div>
      <Label>Model</Label>
      <Input
        value={config.model || ''}
        onChange={(e) => onChange('model', e.target.value)}
        placeholder="gpt-4o-mini"
      />
    </div>
    <div>
      <Label>System Prompt</Label>
      <Textarea
        value={config.systemPrompt || ''}
        onChange={(e) => onChange('systemPrompt', e.target.value)}
        placeholder="You are a helpful assistant..."
        rows={3}
      />
    </div>
    <div>
      <Label>User Prompt</Label>
      <Textarea
        value={config.userPrompt || ''}
        onChange={(e) => onChange('userPrompt', e.target.value)}
        placeholder="Analyze this data: {{$input.data}}"
        rows={4}
      />
    </div>
  </div>
);

// Output View
const OutputView: React.FC<{ output?: unknown }> = ({ output }) => (
  <div>
    {output ? (
      <pre className="text-xs text-slate-600 bg-slate-50 p-4 rounded-lg overflow-auto max-h-96 font-mono border border-slate-200">
        {JSON.stringify(output, null, 2)}
      </pre>
    ) : (
      <div className="text-center text-slate-400 text-sm py-8">
        Run workflow to see output
      </div>
    )}
  </div>
);

export default NodeConfigurationModal;


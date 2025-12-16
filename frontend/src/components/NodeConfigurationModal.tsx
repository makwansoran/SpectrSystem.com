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
  Headphones, HelpCircle, MessagesSquare, Link, Upload, Globe, Server, 
  Lock, Key, CheckCircle2, AlertCircle, RefreshCw, Webhook,
  Shield, Network, MapPin, Ship, DollarSign, Search, Brain
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
    case 'form':
      return <FormSettings config={config || {}} onChange={onChange} />;
    case 'connected-data-input':
      return <ConnectedDataInputSettings config={config || {}} onChange={onChange} />;
    case 'purchased-data-input':
      return <SpectrLiveDataSettings config={config || {}} onChange={onChange} />;
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
}> = ({ config, onChange }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'extraction' | 'advanced' | 'output'>('basic');
  
  const advancedPrompt = `You are an expert web scraping AI. Your task is to extract structured data from websites with precision and efficiency. The scraper must:

Support dynamic content: Handle JavaScript-rendered pages, infinite scrolling, and AJAX-loaded content.

Handle anti-bot measures: Rotate user agents, IPs, manage cookies, solve basic CAPTCHAs, and respect rate limits.

Data extraction rules: Identify relevant fields automatically, extract nested and tabular data, handle multi-page navigation, and detect pagination patterns.

Data normalization: Clean text, remove HTML tags, unify date and number formats, detect duplicates, and categorize data based on semantic meaning.

Error handling & logging: Detect failed requests, retry intelligently, log all errors with page context, and resume scraping from last successful point.

Extensibility: Allow configuration to target new sites without code changes, supporting custom CSS selectors, XPath, or AI-based field detection.

Output: Return data in structured formats (JSON, CSV, or database-ready), preserving hierarchical relationships, timestamps, and source URLs.

Security & compliance: Respect robots.txt, rate limits, and GDPR-sensitive fields where applicable.

Begin by analyzing the target site's structure automatically. Identify all relevant content, including hidden or dynamically loaded elements. Ensure data is validated and cleaned before outputting. Optimize for speed and reliability while minimizing detection.`;

  return (
    <div className="space-y-4">
      {/* Advanced Prompt Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-2">
          <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">AI Scraping Instructions</h3>
            <Textarea
              value={config.advancedPrompt || advancedPrompt}
              onChange={(e) => onChange('advancedPrompt', e.target.value)}
              rows={8}
              className="font-mono text-xs bg-white border-slate-300"
              placeholder="Enter custom scraping instructions..."
            />
            <p className="text-xs text-slate-500 mt-2">These instructions guide the AI-powered scraper. Modify to customize behavior for specific sites.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-2">
          {(['basic', 'extraction', 'advanced', 'output'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div>
            <Label>URL to Scrape</Label>
            <Input
              value={config.url || ''}
              onChange={(e) => onChange('url', e.target.value)}
              placeholder="https://example.com/page"
              required
            />
            <p className="text-xs text-slate-400 mt-1">Enter the URL of the webpage to scrape</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Timeout (seconds)</Label>
              <Input
                type="number"
                value={config.timeout || 60}
                onChange={(e) => onChange('timeout', parseInt(e.target.value) || 60)}
                placeholder="60"
              />
            </div>
            <div>
              <Label>Max Retries</Label>
              <Input
                type="number"
                value={config.maxRetries || 3}
                onChange={(e) => onChange('maxRetries', parseInt(e.target.value) || 3)}
                placeholder="3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.enableJS || false}
                onChange={(e) => onChange('enableJS', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Enable JavaScript Rendering</span>
            </label>
            <p className="text-xs text-slate-400 ml-6">Use headless browser for JavaScript-heavy sites</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.respectRobots !== false}
                onChange={(e) => onChange('respectRobots', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Respect robots.txt</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.rotateUserAgents || false}
                onChange={(e) => onChange('rotateUserAgents', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Rotate User Agents</span>
            </label>
            <p className="text-xs text-slate-400 ml-6">Randomize user agents to avoid detection</p>
          </div>
        </div>
      )}

      {/* Extraction Tab */}
      {activeTab === 'extraction' && (
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={config.aiFieldDetection || false}
                onChange={(e) => onChange('aiFieldDetection', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">AI-Powered Field Detection</span>
            </label>
            <p className="text-xs text-slate-400 ml-6">Automatically identify and extract relevant fields using AI</p>
          </div>

          <div>
            <Label>CSS Selectors / XPath (Optional if AI detection enabled)</Label>
            <Textarea
              value={config.selectors ? JSON.stringify(config.selectors, null, 2) : ''}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onChange('selectors', parsed);
                } catch {
                  // Invalid JSON, don't update
                }
              }}
              placeholder='[{"name": "title", "selector": "h1", "xpath": "//h1", "attribute": "text", "multiple": false}]'
              rows={6}
              className="font-mono text-xs"
            />
            <p className="text-xs text-slate-400 mt-1">JSON array: name, selector (CSS), xpath (optional), attribute, multiple</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.extractTables || false}
                  onChange={(e) => onChange('extractTables', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Extract Tabular Data</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.extractNested || false}
                  onChange={(e) => onChange('extractNested', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Extract Nested Data</span>
              </label>
            </div>
          </div>

          <div>
            <Label>Wait for Selector (Optional)</Label>
            <Input
              value={config.waitForSelector || ''}
              onChange={(e) => onChange('waitForSelector', e.target.value)}
              placeholder=".content-loaded"
            />
            <p className="text-xs text-slate-400 mt-1">CSS selector to wait for before scraping</p>
          </div>

          <div>
            <Label>Wait Time After Load (ms)</Label>
            <Input
              type="number"
              value={config.waitTime || 1000}
              onChange={(e) => onChange('waitTime', parseInt(e.target.value) || 1000)}
              placeholder="1000"
            />
            <p className="text-xs text-slate-400 mt-1">Time to wait after page load for dynamic content</p>
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Dynamic Content Handling</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.handleInfiniteScroll || false}
                  onChange={(e) => onChange('handleInfiniteScroll', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Handle Infinite Scroll</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.waitForNetworkIdle || false}
                  onChange={(e) => onChange('waitForNetworkIdle', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Wait for Network Idle</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Pagination</h4>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={config.pagination?.enabled || false}
                onChange={(e) => onChange('pagination', { ...config.pagination, enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Enable Pagination</span>
            </label>
            {config.pagination?.enabled && (
              <div className="ml-6 space-y-3 mt-3">
                <div>
                  <Label>Next Page Selector</Label>
                  <Input
                    value={config.pagination?.selector || ''}
                    onChange={(e) => onChange('pagination', { ...config.pagination, selector: e.target.value })}
                    placeholder=".next-page, a[rel='next']"
                  />
                </div>
                <div>
                  <Label>Max Pages</Label>
                  <Input
                    type="number"
                    value={config.pagination?.maxPages || 10}
                    onChange={(e) => onChange('pagination', { ...config.pagination, maxPages: parseInt(e.target.value) || 10 })}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label>URL Pattern (Optional)</Label>
                  <Input
                    value={config.pagination?.pattern || ''}
                    onChange={(e) => onChange('pagination', { ...config.pagination, pattern: e.target.value })}
                    placeholder="page={page}"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Rate Limiting</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Requests</Label>
                <Input
                  type="number"
                  value={config.rateLimit?.requests || 10}
                  onChange={(e) => onChange('rateLimit', { ...config.rateLimit, requests: parseInt(e.target.value) || 10 })}
                  placeholder="10"
                />
              </div>
              <div>
                <Label>Window (seconds)</Label>
                <Input
                  type="number"
                  value={config.rateLimit?.window || 60}
                  onChange={(e) => onChange('rateLimit', { ...config.rateLimit, window: parseInt(e.target.value) || 60 })}
                  placeholder="60"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Error Handling</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.resumeFromLastPoint || false}
                  onChange={(e) => onChange('resumeFromLastPoint', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Resume from Last Successful Point</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.logErrors !== false}
                  onChange={(e) => onChange('logErrors', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Log Errors with Context</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Proxy (Optional)</h4>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={config.proxy?.enabled || false}
                onChange={(e) => onChange('proxy', { ...config.proxy, enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Enable Proxy</span>
            </label>
            {config.proxy?.enabled && (
              <div className="ml-6 mt-2">
                <Input
                  value={config.proxy?.url || ''}
                  onChange={(e) => onChange('proxy', { ...config.proxy, url: e.target.value })}
                  placeholder="http://proxy.example.com:8080"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Output Tab */}
      {activeTab === 'output' && (
        <div className="space-y-4">
          <div>
            <Label>Output Format</Label>
            <Select
              value={config.outputFormat || 'json'}
              onChange={(e) => onChange('outputFormat', e.target.value)}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="database">Database-Ready</option>
            </Select>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Data Normalization</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.normalizeData !== false}
                  onChange={(e) => onChange('normalizeData', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Enable Data Normalization</span>
              </label>
              {config.normalizeData !== false && (
                <div className="ml-6 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.removeHTML !== false}
                      onChange={(e) => onChange('removeHTML', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Remove HTML Tags</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.cleanText !== false}
                      onChange={(e) => onChange('cleanText', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Clean Text (trim, normalize whitespace)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.unifyDates || false}
                      onChange={(e) => onChange('unifyDates', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Unify Date Formats</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.unifyNumbers || false}
                      onChange={(e) => onChange('unifyNumbers', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Unify Number Formats</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.detectDuplicates || false}
                      onChange={(e) => onChange('detectDuplicates', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Detect Duplicates</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Security & Compliance</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.gdprCompliance || false}
                  onChange={(e) => onChange('gdprCompliance', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">GDPR Compliance Mode</span>
              </label>
              <p className="text-xs text-slate-400 ml-6">Handle GDPR-sensitive fields appropriately</p>
            </div>
          </div>

          <div>
            <Label>Custom Headers (JSON)</Label>
            <Textarea
              value={config.headers ? JSON.stringify(config.headers, null, 2) : '{}'}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onChange('headers', parsed);
                } catch {
                  // Invalid JSON, don't update
                }
              }}
              rows={4}
              className="font-mono text-xs"
              placeholder='{"User-Agent": "Custom Agent", "Accept": "application/json"}'
            />
          </div>
        </div>
      )}
    </div>
  );
};

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

import { COUNTRIES } from '../constants/countries';

// Connected Data Input Settings
const ConnectedDataInputSettings: React.FC<{
  config: any;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  const [connectionType, setConnectionType] = useState<string>(config.connectionType || 'api');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const connectionTypes = [
    { id: 'api', name: 'API Integration', icon: Globe, description: 'Connect to REST APIs' },
    { id: 'database', name: 'Database', icon: Database, description: 'Direct database connection' },
    { id: 'file', name: 'File Upload', icon: Upload, description: 'Upload CSV, Excel, or JSON files' },
    { id: 'cloud', name: 'Cloud Storage', icon: Cloud, description: 'Google Drive, Dropbox, S3' },
    { id: 'webhook', name: 'Webhook', icon: Webhook, description: 'Receive real-time data' },
    { id: 'oauth', name: 'OAuth Integration', icon: Lock, description: 'Connect via OAuth' },
    { id: 'sftp', name: 'SFTP/FTP', icon: Server, description: 'File server connection' },
  ];
  
  const handleConnectionTypeChange = (type: string) => {
    setConnectionType(type);
    onChange('connectionType', type);
    // Reset test result when changing connection type
    setTestResult(null);
  };
  
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    // Simulate connection test (in real implementation, this would call the backend)
    setTimeout(() => {
      setTesting(false);
      setTestResult({
        success: true,
        message: 'Connection test successful!'
      });
    }, 1500);
  };
  
  const SelectedIcon = connectionTypes.find(t => t.id === connectionType)?.icon || Globe;
  
  return (
    <div className="space-y-6">
      {/* Connection Type Selection */}
      <div>
        <Label>Connection Type</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {connectionTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = connectionType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => handleConnectionTypeChange(type.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900">{type.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{type.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-slate-900 flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Connection Type Specific Configuration */}
      <div className="border-t border-slate-200 pt-6">
        {connectionType === 'api' && (
          <APIConnectionSettings config={config} onChange={onChange} />
        )}
        {connectionType === 'database' && (
          <DatabaseConnectionSettings config={config} onChange={onChange} />
        )}
        {connectionType === 'file' && (
          <FileUploadSettings config={config} onChange={onChange} />
        )}
        {connectionType === 'cloud' && (
          <CloudStorageSettings config={config} onChange={onChange} />
        )}
        {connectionType === 'webhook' && (
          <WebhookConnectionSettings config={config} onChange={onChange} />
        )}
        {connectionType === 'oauth' && (
          <OAuthConnectionSettings config={config} onChange={onChange} />
        )}
        {connectionType === 'sftp' && (
          <SFTPConnectionSettings config={config} onChange={onChange} />
        )}
      </div>
      
      {/* Test Connection Button */}
      {connectionType !== 'file' && (
        <div className="border-t border-slate-200 pt-4">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="w-full px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Test Connection
              </>
            )}
          </button>
          
          {testResult && (
            <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
              testResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <p className="text-xs">{testResult.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// API Connection Settings
const APIConnectionSettings: React.FC<{
  config: any;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>API Endpoint URL</Label>
        <Input
          value={config.apiUrl || ''}
          onChange={(e) => onChange('apiUrl', e.target.value)}
          placeholder="https://api.example.com/suppliers"
        />
      </div>
      <div>
        <Label>Authentication Method</Label>
        <Select
          value={config.authMethod || 'none'}
          onChange={(e) => onChange('authMethod', e.target.value)}
        >
          <option value="none">No Authentication</option>
          <option value="apiKey">API Key</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="oauth2">OAuth 2.0</option>
        </Select>
      </div>
      {config.authMethod === 'apiKey' && (
        <>
          <div>
            <Label>API Key</Label>
            <Input
              type="password"
              value={config.apiKey || ''}
              onChange={(e) => onChange('apiKey', e.target.value)}
              placeholder="Enter API key"
            />
          </div>
          <div>
            <Label>Header Name</Label>
            <Input
              value={config.apiKeyHeader || 'X-API-Key'}
              onChange={(e) => onChange('apiKeyHeader', e.target.value)}
              placeholder="X-API-Key"
            />
          </div>
        </>
      )}
      {config.authMethod === 'bearer' && (
        <div>
          <Label>Bearer Token</Label>
          <Input
            type="password"
            value={config.bearerToken || ''}
            onChange={(e) => onChange('bearerToken', e.target.value)}
            placeholder="Enter bearer token"
          />
        </div>
      )}
      {config.authMethod === 'basic' && (
        <>
          <div>
            <Label>Username</Label>
            <Input
              value={config.basicUsername || ''}
              onChange={(e) => onChange('basicUsername', e.target.value)}
              placeholder="Enter username"
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={config.basicPassword || ''}
              onChange={(e) => onChange('basicPassword', e.target.value)}
              placeholder="Enter password"
            />
          </div>
        </>
      )}
      <div>
        <Label>HTTP Method</Label>
        <Select
          value={config.httpMethod || 'GET'}
          onChange={(e) => onChange('httpMethod', e.target.value)}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
        </Select>
      </div>
      {config.httpMethod === 'POST' && (
        <div>
          <Label>Request Body (JSON)</Label>
          <Textarea
            value={config.requestBody || ''}
            onChange={(e) => onChange('requestBody', e.target.value)}
            placeholder='{"query": "suppliers"}'
            rows={4}
          />
        </div>
      )}
    </div>
  );
};

// Database Connection Settings
const DatabaseConnectionSettings: React.FC<{
  config: any;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Database Type</Label>
        <Select
          value={config.dbType || 'postgresql'}
          onChange={(e) => onChange('dbType', e.target.value)}
        >
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
          <option value="sqlserver">SQL Server</option>
          <option value="mongodb">MongoDB</option>
          <option value="redis">Redis</option>
        </Select>
      </div>
      <div>
        <Label>Connection String</Label>
        <Input
          type="password"
          value={config.connectionString || ''}
          onChange={(e) => onChange('connectionString', e.target.value)}
          placeholder="postgresql://user:password@host:port/database"
        />
        <p className="text-xs text-slate-400 mt-1">Or configure individually below</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Host</Label>
          <Input
            value={config.dbHost || ''}
            onChange={(e) => onChange('dbHost', e.target.value)}
            placeholder="localhost"
          />
        </div>
        <div>
          <Label>Port</Label>
          <Input
            type="number"
            value={config.dbPort || ''}
            onChange={(e) => onChange('dbPort', e.target.value)}
            placeholder="5432"
          />
        </div>
      </div>
      <div>
        <Label>Database Name</Label>
        <Input
          value={config.dbName || ''}
          onChange={(e) => onChange('dbName', e.target.value)}
          placeholder="suppliers_db"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Username</Label>
          <Input
            value={config.dbUsername || ''}
            onChange={(e) => onChange('dbUsername', e.target.value)}
            placeholder="db_user"
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={config.dbPassword || ''}
            onChange={(e) => onChange('dbPassword', e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>
      <div>
        <Label>SQL Query</Label>
        <Textarea
          value={config.sqlQuery || ''}
          onChange={(e) => onChange('sqlQuery', e.target.value)}
          placeholder="SELECT * FROM suppliers WHERE status = 'active'"
          rows={4}
        />
      </div>
    </div>
  );
};

// File Upload Settings
const FileUploadSettings: React.FC<{
  config: any;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onChange('fileName', selectedFile.name);
      onChange('fileType', selectedFile.type);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label>File Type</Label>
        <Select
          value={config.fileType || 'csv'}
          onChange={(e) => onChange('fileType', e.target.value)}
        >
          <option value="csv">CSV</option>
          <option value="excel">Excel (.xlsx, .xls)</option>
          <option value="json">JSON</option>
          <option value="xml">XML</option>
        </Select>
      </div>
      <div>
        <Label>Upload File</Label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 transition-colors"
        >
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          {file ? (
            <div>
              <p className="text-sm font-medium text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-900">Click to upload</p>
              <p className="text-xs text-slate-500 mt-1">CSV, Excel, JSON, or XML files</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json,.xml"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      {config.fileType === 'csv' && (
        <div>
          <Label>CSV Delimiter</Label>
          <Input
            value={config.csvDelimiter || ','}
            onChange={(e) => onChange('csvDelimiter', e.target.value)}
            placeholder=","
            maxLength={1}
          />
        </div>
      )}
    </div>
  );
};

// Cloud Storage Settings
const CloudStorageSettings: React.FC<{
  config: any;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Cloud Service</Label>
        <Select
          value={config.cloudService || 'googledrive'}
          onChange={(e) => onChange('cloudService', e.target.value)}
        >
          <option value="googledrive">Google Drive</option>
          <option value="dropbox">Dropbox</option>
          <option value="onedrive">OneDrive</option>
          <option value="s3">AWS S3</option>
          <option value="azure">Azure Blob Storage</option>
          <option value="googlesheets">Google Sheets</option>
        </Select>
      </div>
      <div>
        <button
          onClick={() => {
            // In real implementation, this would trigger OAuth flow
            alert('OAuth authentication will open in a new window');
          }}
          className="w-full px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          Connect Account
        </button>
      </div>
      {config.cloudService === 's3' && (
        <>
          <div>
            <Label>AWS Access Key ID</Label>
            <Input
              type="password"
              value={config.s3AccessKey || ''}
              onChange={(e) => onChange('s3AccessKey', e.target.value)}
              placeholder="Enter access key"
            />
          </div>
          <div>
            <Label>AWS Secret Access Key</Label>
            <Input
              type="password"
              value={config.s3SecretKey || ''}
              onChange={(e) => onChange('s3SecretKey', e.target.value)}
              placeholder="Enter secret key"
            />
          </div>
          <div>
            <Label>Bucket Name</Label>
            <Input
              value={config.s3Bucket || ''}
              onChange={(e) => onChange('s3Bucket', e.target.value)}
              placeholder="my-bucket"
            />
          </div>
          <div>
            <Label>File Path</Label>
            <Input
              value={config.s3Path || ''}
              onChange={(e) => onChange('s3Path', e.target.value)}
              placeholder="data/suppliers.csv"
            />
          </div>
        </>
      )}
      {(config.cloudService === 'googlesheets' || config.cloudService === 'googledrive') && (
        <div>
          <Label>File/Sheet ID</Label>
          <Input
            value={config.fileId || ''}
            onChange={(e) => onChange('fileId', e.target.value)}
            placeholder="Enter file or sheet ID"
          />
        </div>
      )}
    </div>
  );
};

// Webhook Connection Settings
const WebhookConnectionSettings: React.FC<{
  config: any;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-blue-900">Webhook URL</p>
            <p className="text-[10px] text-blue-700 mt-1">
              Share this URL with external systems to receive data in real-time
            </p>
          </div>
        </div>
      </div>
      <div>
        <Label>Webhook URL</Label>
        <div className="flex gap-2">
          <Input
            value={config.webhookUrl || 'https://api.spectr.systems/webhook/...'}
            readOnly
            className="bg-slate-50"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(config.webhookUrl || '');
            }}
            className="px-3 py-2 bg-slate-900 text-white text-xs rounded-lg hover:bg-slate-800"
          >
            Copy
          </button>
        </div>
      </div>
      <div>
        <Label>Expected Data Format</Label>
        <Select
          value={config.webhookFormat || 'json'}
          onChange={(e) => onChange('webhookFormat', e.target.value)}
        >
          <option value="json">JSON</option>
          <option value="xml">XML</option>
          <option value="form">Form Data</option>
        </Select>
      </div>
    </div>
  );
};

// OAuth Connection Settings
const OAuthConnectionSettings: React.FC<{
  config: any;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Service</Label>
        <Select
          value={config.oauthService || 'salesforce'}
          onChange={(e) => onChange('oauthService', e.target.value)}
        >
          <option value="salesforce">Salesforce</option>
          <option value="servicenow">ServiceNow</option>
          <option value="custom">Custom OAuth</option>
        </Select>
      </div>
      <div>
        <button
          onClick={() => {
            // In real implementation, this would trigger OAuth flow
            alert('OAuth authentication will open in a new window');
          }}
          className="w-full px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          Authorize with {config.oauthService || 'Salesforce'}
        </button>
      </div>
      {config.oauthService === 'custom' && (
        <>
          <div>
            <Label>Authorization URL</Label>
            <Input
              value={config.oauthAuthUrl || ''}
              onChange={(e) => onChange('oauthAuthUrl', e.target.value)}
              placeholder="https://api.example.com/oauth/authorize"
            />
          </div>
          <div>
            <Label>Token URL</Label>
            <Input
              value={config.oauthTokenUrl || ''}
              onChange={(e) => onChange('oauthTokenUrl', e.target.value)}
              placeholder="https://api.example.com/oauth/token"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Client ID</Label>
              <Input
                value={config.oauthClientId || ''}
                onChange={(e) => onChange('oauthClientId', e.target.value)}
                placeholder="Enter client ID"
              />
            </div>
            <div>
              <Label>Client Secret</Label>
              <Input
                type="password"
                value={config.oauthClientSecret || ''}
                onChange={(e) => onChange('oauthClientSecret', e.target.value)}
                placeholder="Enter client secret"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// SFTP Connection Settings
const SFTPConnectionSettings: React.FC<{
  config: any;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Connection Type</Label>
        <Select
          value={config.sftpType || 'sftp'}
          onChange={(e) => onChange('sftpType', e.target.value)}
        >
          <option value="sftp">SFTP (Secure)</option>
          <option value="ftp">FTP</option>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Host</Label>
          <Input
            value={config.sftpHost || ''}
            onChange={(e) => onChange('sftpHost', e.target.value)}
            placeholder="ftp.example.com"
          />
        </div>
        <div>
          <Label>Port</Label>
          <Input
            type="number"
            value={config.sftpPort || (config.sftpType === 'sftp' ? '22' : '21')}
            onChange={(e) => onChange('sftpPort', e.target.value)}
            placeholder={config.sftpType === 'sftp' ? '22' : '21'}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Username</Label>
          <Input
            value={config.sftpUsername || ''}
            onChange={(e) => onChange('sftpUsername', e.target.value)}
            placeholder="Enter username"
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={config.sftpPassword || ''}
            onChange={(e) => onChange('sftpPassword', e.target.value)}
            placeholder="Enter password"
          />
        </div>
      </div>
      <div>
        <Label>Remote File Path</Label>
        <Input
          value={config.sftpPath || ''}
          onChange={(e) => onChange('sftpPath', e.target.value)}
          placeholder="/data/suppliers.csv"
        />
      </div>
      <div>
        <Label>Polling Interval</Label>
        <Select
          value={config.sftpInterval || 'hourly'}
          onChange={(e) => onChange('sftpInterval', e.target.value)}
        >
          <option value="hourly">Every Hour</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="manual">Manual Only</option>
        </Select>
      </div>
    </div>
  );
};

// Spectr Live Data Settings
const SpectrLiveDataSettings: React.FC<{
  config: any;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(config.category || 'all');
  
  // Dataset categories
  const categories = [
    { id: 'all', name: 'All Datasets', count: 24 },
    { id: 'corporate', name: 'Corporate Intelligence', count: 8 },
    { id: 'sanctions', name: 'Sanctions & Compliance', count: 5 },
    { id: 'geographic', name: 'Geographic Intelligence', count: 6 },
    { id: 'financial', name: 'Financial Data', count: 5 },
  ];
  
  // Available datasets (based on subscriptions)
  const availableDatasets = [
    {
      id: 'corp-registry-global',
      name: 'Global Corporate Registry',
      category: 'corporate',
      description: 'Real-time corporate registration data from 180+ countries',
      subscription: 'active',
      updateFrequency: 'Real-time',
      coverage: '180+ countries',
      icon: Building2,
    },
    {
      id: 'sanctions-ofac',
      name: 'OFAC Sanctions List',
      category: 'sanctions',
      description: 'US Treasury OFAC sanctions, SDN, and blocked persons',
      subscription: 'active',
      updateFrequency: 'Daily',
      coverage: 'Global',
      icon: Shield,
    },
    {
      id: 'sanctions-un',
      name: 'UN Sanctions List',
      category: 'sanctions',
      description: 'United Nations consolidated sanctions list',
      subscription: 'active',
      updateFrequency: 'Daily',
      coverage: 'Global',
      icon: Shield,
    },
    {
      id: 'corp-ownership',
      name: 'Corporate Ownership Structures',
      category: 'corporate',
      description: 'Ultimate beneficial ownership and corporate hierarchies',
      subscription: 'active',
      updateFrequency: 'Weekly',
      coverage: '50+ countries',
      icon: Network,
    },
    {
      id: 'geo-risk-indicators',
      name: 'Geographic Risk Indicators',
      category: 'geographic',
      description: 'Country-level risk scores, political stability, conflict zones',
      subscription: 'active',
      updateFrequency: 'Daily',
      coverage: '200+ countries',
      icon: MapPin,
    },
    {
      id: 'port-logistics',
      name: 'Port & Logistics Intelligence',
      category: 'geographic',
      description: 'Port operations, shipping routes, logistics chokepoints',
      subscription: 'active',
      updateFrequency: 'Real-time',
      coverage: 'Global ports',
      icon: Ship,
    },
    {
      id: 'financial-distress',
      name: 'Financial Distress Signals',
      category: 'financial',
      description: 'Early warning indicators of financial distress, bankruptcies',
      subscription: 'active',
      updateFrequency: 'Daily',
      coverage: 'Global',
      icon: AlertTriangle,
    },
    {
      id: 'regulatory-actions',
      name: 'Regulatory Actions Database',
      category: 'sanctions',
      description: 'Regulatory enforcement actions, fines, penalties',
      subscription: 'active',
      updateFrequency: 'Daily',
      coverage: 'Global',
      icon: FileText,
    },
    {
      id: 'supply-chain-mapping',
      name: 'Supply Chain Network Mapping',
      category: 'corporate',
      description: 'Supplier relationships, dependencies, network analysis',
      subscription: 'pending',
      updateFrequency: 'Weekly',
      coverage: 'Global',
      icon: Network,
    },
    {
      id: 'commodity-prices',
      name: 'Commodity Price Intelligence',
      category: 'financial',
      description: 'Real-time commodity prices, futures, market volatility',
      subscription: 'pending',
      updateFrequency: 'Real-time',
      coverage: 'Global markets',
      icon: DollarSign,
    },
  ];
  
  const filteredDatasets = availableDatasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dataset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const selectedDataset = availableDatasets.find(d => d.id === config.datasetId);
  const SelectedIcon = selectedDataset?.icon || ShoppingBag;
  
  return (
    <div className="space-y-6">
      {/* Selected Dataset Display */}
      {selectedDataset && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <SelectedIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-emerald-900">{selectedDataset.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  selectedDataset.subscription === 'active'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {selectedDataset.subscription === 'active' ? 'Active' : 'Pending'}
                </span>
              </div>
              <p className="text-xs text-emerald-700 mb-2">{selectedDataset.description}</p>
              <div className="flex items-center gap-4 text-[10px] text-emerald-600">
                <span>📊 {selectedDataset.updateFrequency}</span>
                <span>🌍 {selectedDataset.coverage}</span>
              </div>
            </div>
            <button
              onClick={() => onChange('datasetId', '')}
              className="p-1 hover:bg-emerald-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-emerald-700" />
            </button>
          </div>
        </div>
      )}
      
      {/* Search */}
      <div>
        <Label>Search Datasets</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or description..."
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Category Filter */}
      <div>
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>
      
      {/* Dataset List */}
      <div>
        <Label>Available Datasets</Label>
        <div className="space-y-2 mt-2 max-h-96 overflow-y-auto">
          {filteredDatasets.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <p>No datasets found</p>
            </div>
          ) : (
            filteredDatasets.map((dataset) => {
              const DatasetIcon = dataset.icon;
              const isSelected = config.datasetId === dataset.id;
              
              return (
                <button
                  key={dataset.id}
                  onClick={() => onChange('datasetId', dataset.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50'
                      : dataset.subscription === 'active'
                      ? 'border-emerald-200 hover:border-emerald-300 bg-white'
                      : 'border-amber-200 hover:border-amber-300 bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : dataset.subscription === 'active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}>
                      <DatasetIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-slate-900">{dataset.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          dataset.subscription === 'active'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}>
                          {dataset.subscription === 'active' ? 'Subscribed' : 'Not Subscribed'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{dataset.description}</p>
                      <div className="flex items-center gap-4 text-[10px] text-slate-500">
                        <span>🔄 {dataset.updateFrequency}</span>
                        <span>🌍 {dataset.coverage}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-slate-900 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
      
      {/* Subscription Notice */}
      {selectedDataset && selectedDataset.subscription === 'pending' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-900 mb-1">Subscription Required</p>
              <p className="text-[10px] text-amber-700">
                This dataset requires an active subscription. Contact your administrator to enable access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FormSettings: React.FC<{
  config: any;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  const fields = config?.fields || [];
  const formData = config?.formData || {};
  const [showSaved, setShowSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('company');
  
  // Group fields by tab
  const fieldsByTab = fields.reduce((acc: any, field: any) => {
    const tab = field.tab || 'company';
    if (!acc[tab]) {
      acc[tab] = [];
    }
    acc[tab].push(field);
    return acc;
  }, {});
  
  const tabs = Object.keys(fieldsByTab);
  
  const updateFormData = (fieldName: string, value: unknown) => {
    const newFormData = { ...formData, [fieldName]: value };
    onChange('formData', newFormData);
  };
  
  const handleSave = () => {
    // Explicitly save the formData
    onChange('formData', formData);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };
  
  const renderField = (field: any, index: number) => {
    if (field.type === 'country-select') {
      return (
        <div key={index} className="space-y-2">
          <Label>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={formData[field.name] || ''}
            onChange={(e) => updateFormData(field.name, e.target.value)}
            className="w-full"
          >
            <option value="">Select a country</option>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </Select>
        </div>
      );
    }
    
    if (field.type === 'select' && field.options) {
      return (
        <div key={index} className="space-y-2">
          <Label>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={formData[field.name] || ''}
            onChange={(e) => updateFormData(field.name, e.target.value)}
            className="w-full"
          >
            <option value="">Select an option</option>
            {field.options.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
      );
    }
    
    if (field.type === 'textarea') {
      return (
        <div key={index} className="space-y-2">
          <Label>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            value={formData[field.name] || ''}
            onChange={(e) => updateFormData(field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            required={field.required}
            rows={4}
          />
        </div>
      );
    }
    
    return (
      <div key={index} className="space-y-2">
        <Label>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
          value={formData[field.name] || ''}
          onChange={(e) => updateFormData(field.name, e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          required={field.required}
        />
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex items-center gap-6 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-all uppercase tracking-tight relative group pb-2"
            >
              <span className="relative capitalize">
                {tab === 'company' ? 'Company Information' : tab === 'product' ? 'Product / Service' : tab === 'volume' ? 'Supply Volume & Dependency' : tab}
                {activeTab === tab && (
                  <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-slate-900 transition-all duration-300"></span>
                )}
                {activeTab !== tab && (
                  <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
      
      {/* Form Data Input Section */}
      {fields.length > 0 ? (
        <div className="space-y-4">
          {(fieldsByTab[activeTab] || []).map((field: any, index: number) => renderField(field, index))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400 text-sm">
          <p>No form fields configured</p>
        </div>
      )}
      
      {/* Save Button */}
      {fields.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            className="w-full px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all"
          >
            {showSaved ? 'Saved!' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
};

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


/**
 * Right Panel Component
 * Light theme - node configuration
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Copy } from 'lucide-react';
import clsx from 'clsx';
import { useWorkflowStore } from '../stores/workflowStore';
import { getNodeDefinition } from '../constants/nodes';
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

const RightPanel: React.FC = () => {
  const {
    selectedNode,
    rightPanelOpen,
    setRightPanelOpen,
    setSelectedNode,
    updateNodeData,
    deleteSelected,
    duplicateNode,
  } = useWorkflowStore();

  const [activeTab, setActiveTab] = useState<'settings' | 'output'>('settings');

  useEffect(() => {
    setActiveTab('settings');
  }, [selectedNode?.id]);

  if (!rightPanelOpen || !selectedNode) return null;

  const definition = getNodeDefinition(selectedNode.type);

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
    setRightPanelOpen(false);
  };

  const handleDuplicate = () => {
    duplicateNode(selectedNode.id);
  };

  return (
    <aside className="w-80 h-full bg-white border-l border-slate-300/50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-300/50 bg-white">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={selectedNode.data.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="text-xs font-medium text-slate-900 uppercase tracking-tight bg-transparent border-none outline-none w-full focus:bg-white focus:px-2 focus:py-1 focus:rounded-lg focus:border focus:border-slate-300/50 transition-all"
          />
          <div className="text-xs font-medium text-[#8b949e] mt-1">{definition?.name}</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDuplicate}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-all"
            title="Duplicate node"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete node"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setRightPanelOpen(false);
              setSelectedNode(null);
            }}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-all"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 px-4 py-3 border-b border-slate-300/50 bg-white">
        {(['settings', 'output'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="text-xs font-medium text-slate-900 hover:text-slate-900 transition-all uppercase tracking-tight relative group pb-1"
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
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {activeTab === 'settings' ? (
          <NodeSettings
            nodeType={selectedNode.type}
            config={selectedNode.data.config}
            onChange={handleConfigChange}
          />
        ) : (
          <OutputView output={selectedNode.data.executionOutput} />
        )}
      </div>
    </aside>
  );
};

// Node Settings
interface NodeSettingsProps {
  nodeType: string;
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

const NodeSettings: React.FC<NodeSettingsProps> = ({ nodeType, config, onChange }) => {
  switch (nodeType) {
    case 'http-request':
      return <HttpRequestSettings config={config as HttpRequestConfig} onChange={onChange} />;
    case 'web-scraper':
      return <WebScraperSettings config={config as WebScraperConfig} onChange={onChange} />;
    case 'database':
      return <DatabaseSettings config={config as DatabaseConfig} onChange={onChange} />;
    case 'set-variable':
      return <SetVariableSettings config={config as SetVariableConfig} onChange={onChange} />;
    case 'condition':
      return <ConditionSettings config={config as ConditionConfig} onChange={onChange} />;
    case 'loop':
      return <LoopSettings config={config as LoopConfig} onChange={onChange} />;
    case 'code':
      return <CodeSettings config={config as CodeConfig} onChange={onChange} />;
    case 'ai-agent':
      return <AIAgentSettings config={config as AIAgentConfig} onChange={onChange} />;
    case 'webhook-response':
      return <WebhookResponseSettings config={config as WebhookResponseConfig} onChange={onChange} />;
    case 'webhook-trigger':
      return <WebhookTriggerSettings config={config as WebhookTriggerConfig} onChange={onChange} />;
    case 'schedule-trigger':
      return <ScheduleSettings config={config as ScheduleConfig} onChange={onChange} />;
    case 'store-data':
      return <StoreDataSettings config={config as StoreDataConfig} onChange={onChange} />;
    // Intelligence - OSINT
    case 'osint-domain':
      return <DomainIntelligenceSettings config={config} onChange={onChange} />;
    case 'intel-entity-extraction':
      return <EntityExtractionSettings config={config} onChange={onChange} />;
    // Intelligence - GEOINT
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
    // Intelligence - Analysis
    case 'intel-data-enrichment':
      return <DataEnrichmentSettings config={config} onChange={onChange} />;
    // Intelligence - Output
    case 'intel-map-visualization':
      return <MapVisualizationSettings config={config} onChange={onChange} />;
    case 'intel-report-generator':
      return <ReportGeneratorSettings config={config} onChange={onChange} />;
    default:
      return <div className="text-center text-slate-400 text-sm py-8">No settings</div>;
  }
};

// Form components
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs font-medium text-slate-900 uppercase tracking-wide mb-2">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={clsx(
      'w-full px-3 py-2 text-xs rounded-lg',
      'bg-white border border-slate-300/50 text-slate-900',
      'placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900',
      'transition-all font-mono',
      props.className
    )}
  />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select
    {...props}
    className={clsx(
      'w-full px-3 py-2 text-xs rounded-lg',
      'bg-white border border-slate-300/50 text-slate-900',
      'focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900',
      'transition-all font-mono',
      props.className
    )}
  />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={clsx(
      'w-full px-3 py-2 text-xs rounded-lg resize-none',
      'bg-white border border-slate-300/50 text-slate-900',
      'placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900',
      'font-mono transition-all',
      props.className
    )}
  />
);

// HTTP Request Settings
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

// Set Variable Settings
const SetVariableSettings: React.FC<{
  config: SetVariableConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  const variables = config.variables || [];

  const addVariable = () => {
    onChange('variables', [...variables, { key: '', value: '', type: 'string' }]);
  };

  const updateVariable = (index: number, field: string, value: string) => {
    const updated = variables.map((v, i) => (i === index ? { ...v, [field]: value } : v));
    onChange('variables', updated);
  };

  const removeVariable = (index: number) => {
    onChange('variables', variables.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {variables.map((variable, index) => (
        <div key={index} className="p-3 bg-white rounded-lg border border-slate-300/50">
          <div className="flex items-center gap-2 mb-2">
            <Input
              value={variable.key}
              onChange={(e) => updateVariable(index, 'key', e.target.value)}
              placeholder="key"
              className="flex-1"
            />
            <button onClick={() => removeVariable(index)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <Input
            value={variable.value}
            onChange={(e) => updateVariable(index, 'value', e.target.value)}
            placeholder="value"
          />
        </div>
      ))}
      <button
        onClick={addVariable}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
      >
        <Plus className="w-3.5 h-3.5" /> Add variable
      </button>
    </div>
  );
};

// Condition Settings
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
        <option value="is_empty">is empty</option>
        <option value="is_not_empty">is not empty</option>
      </Select>
    </div>
    {!['is_empty', 'is_not_empty'].includes(config.operator || 'equals') && (
      <div>
        <Label>Value</Label>
        <Input
          value={config.value || ''}
          onChange={(e) => onChange('value', e.target.value)}
          placeholder="expected value"
        />
      </div>
    )}
  </div>
);

// Webhook Response Settings
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

// Webhook Trigger Settings
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

// Schedule Settings
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

// Store Data Settings
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

// Web Scraper Settings
const WebScraperSettings: React.FC<{
  config: WebScraperConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  const selectors = config.selectors || [];

  const addSelector = () => {
    onChange('selectors', [...selectors, { name: '', selector: '', attribute: 'text' }]);
  };

  const updateSelector = (index: number, field: string, value: string | boolean) => {
    const updated = selectors.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    onChange('selectors', updated);
  };

  const removeSelector = (index: number) => {
    onChange('selectors', selectors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>URL to Scrape</Label>
        <Input
          value={config.url || ''}
          onChange={(e) => onChange('url', e.target.value)}
          placeholder="https://example.com/page"
        />
      </div>

      <div>
        <Label>Data Selectors</Label>
        <div className="space-y-2 mt-2">
          {selectors.map((selector, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border border-slate-300/50 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={selector.name}
                  onChange={(e) => updateSelector(index, 'name', e.target.value)}
                  placeholder="Field name"
                  className="flex-1"
                />
                <button onClick={() => removeSelector(index)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <Input
                value={selector.selector}
                onChange={(e) => updateSelector(index, 'selector', e.target.value)}
                placeholder="CSS selector (e.g., .price, h1, #title)"
              />
              <div className="flex gap-2">
                <Select
                  value={selector.attribute || 'text'}
                  onChange={(e) => updateSelector(index, 'attribute', e.target.value)}
                  className="flex-1"
                >
                  <option value="text">Text content</option>
                  <option value="href">Link (href)</option>
                  <option value="src">Image (src)</option>
                  <option value="value">Value</option>
                </Select>
                <label className="flex items-center gap-1.5 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={selector.multiple || false}
                    onChange={(e) => updateSelector(index, 'multiple', e.target.checked)}
                    className="rounded"
                  />
                  All
                </label>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addSelector}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mt-2"
        >
          <Plus className="w-3.5 h-3.5" /> Add selector
        </button>
      </div>
    </div>
  );
};

// Database Settings
const DatabaseSettings: React.FC<{
  config: DatabaseConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Operation</Label>
      <Select value={config.operation || 'insert'} onChange={(e) => onChange('operation', e.target.value)}>
        <option value="insert">INSERT - Add new row</option>
        <option value="select">SELECT - Read data</option>
        <option value="update">UPDATE - Modify rows</option>
        <option value="delete">DELETE - Remove rows</option>
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

    {config.operation === 'select' && (
      <div>
        <Label>Limit</Label>
        <Input
          type="number"
          value={config.limit || ''}
          onChange={(e) => onChange('limit', parseInt(e.target.value) || undefined)}
          placeholder="100"
        />
      </div>
    )}

    {(config.operation === 'select' || config.operation === 'update' || config.operation === 'delete') && (
      <div>
        <Label>WHERE Clause</Label>
        <Input
          value={config.where || ''}
          onChange={(e) => onChange('where', e.target.value)}
          placeholder="id = 1"
        />
      </div>
    )}
  </div>
);

// Loop Settings
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
    <div>
      <Label>Index Variable (optional)</Label>
      <Input
        value={config.indexVariable || ''}
        onChange={(e) => onChange('indexVariable', e.target.value)}
        placeholder="index"
      />
    </div>
  </div>
);

// Code Settings
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
        placeholder={`// Access input data with $input
// Return data with return statement
const data = $input.data;
return { processed: data };`}
        rows={10}
        className="font-mono text-xs"
      />
      <p className="text-xs text-slate-400 mt-1">Use $input to access previous node data</p>
    </div>
  </div>
);

// AI Agent Settings
const AIAgentSettings: React.FC<{
  config: AIAgentConfig;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  // Default models per provider
  const defaultModels: Record<string, string> = {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-5-sonnet-20241022',
    ollama: 'llama3.2',
  };

  // Handle provider change and auto-set model
  const handleProviderChange = (provider: string) => {
    onChange('provider', provider);
    onChange('model', defaultModels[provider]);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Provider</Label>
        <Select
          value={config.provider || 'openai'}
          onChange={(e) => handleProviderChange(e.target.value)}
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="ollama">Ollama (Local)</option>
        </Select>
      </div>

      <div>
        <Label>Model</Label>
        <Select
          value={config.model || defaultModels[config.provider || 'openai']}
          onChange={(e) => onChange('model', e.target.value)}
        >
          {(config.provider === 'openai' || !config.provider) && (
            <>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </>
          )}
          {config.provider === 'anthropic' && (
            <>
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
              <option value="claude-3-opus-20240229">Claude 3 Opus</option>
              <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
            </>
          )}
          {config.provider === 'ollama' && (
            <>
              <option value="llama3.2">Llama 3.2</option>
              <option value="mistral">Mistral</option>
              <option value="codellama">Code Llama</option>
              <option value="phi">Phi</option>
            </>
          )}
        </Select>
      </div>

      {config.provider !== 'ollama' && (
        <div>
          <Label>API Key</Label>
          <Input
            type="password"
            value={config.apiKey || ''}
            onChange={(e) => onChange('apiKey', e.target.value)}
            placeholder={config.provider === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
          />
          <p className="text-xs text-slate-400 mt-1">Your API key is stored locally</p>
        </div>
      )}

      {config.provider === 'ollama' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700">
            Make sure Ollama is running locally at <code className="bg-amber-100 px-1 rounded">localhost:11434</code>
          </p>
        </div>
      )}

      <div>
        <Label>System Prompt</Label>
        <Textarea
          value={config.systemPrompt || ''}
          onChange={(e) => onChange('systemPrompt', e.target.value)}
          placeholder="You are a helpful assistant that analyzes data..."
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
        <p className="text-xs text-slate-400 mt-1">
          Use <code className="bg-slate-100 px-1 rounded">{'{{$input.data}}'}</code> to include input data
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Temperature</Label>
          <Input
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature ?? 0.7}
            onChange={(e) => onChange('temperature', parseFloat(e.target.value))}
          />
          <p className="text-xs text-slate-400 mt-1">0 = precise, 2 = creative</p>
        </div>
        <div>
          <Label>Max Tokens</Label>
          <Input
            type="number"
            min="1"
            max="4096"
            value={config.maxTokens || 1000}
            onChange={(e) => onChange('maxTokens', parseInt(e.target.value))}
          />
          <p className="text-xs text-slate-400 mt-1">Response length limit</p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <input
          type="checkbox"
          id="jsonMode"
          checked={config.jsonMode || false}
          onChange={(e) => onChange('jsonMode', e.target.checked)}
          className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
        />
        <div>
          <label htmlFor="jsonMode" className="text-sm font-medium text-slate-700 cursor-pointer">
            JSON Mode
          </label>
          <p className="text-xs text-slate-400">Force AI to respond in valid JSON format</p>
        </div>
      </div>
    </div>
  );
};

// Output View
const OutputView: React.FC<{ output?: unknown }> = ({ output }) => (
  <div>
    {output ? (
      <pre className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg overflow-auto max-h-96 font-mono border border-slate-200">
        {JSON.stringify(output, null, 2)}
      </pre>
    ) : (
      <div className="text-center text-slate-400 text-sm py-8">
        Run workflow to see output
      </div>
    )}
  </div>
);

export default RightPanel;

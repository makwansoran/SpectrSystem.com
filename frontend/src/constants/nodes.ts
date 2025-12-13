/**
 * Node Definitions
 * Comprehensive integration library similar to n8n
 * Organized by functional subcategories
 */

import type { NodeDefinition, NodeType } from '../types';
import { INTELLIGENCE_NODE_DEFINITIONS } from './intelligenceNodes';

export const NODE_DEFINITIONS: NodeDefinition[] = [
  // ==================== 1. WORKFLOW TRIGGERS ====================
  {
    type: 'manual-trigger',
    category: 'trigger',
    subcategory: 'Workflow Triggers',
    name: 'Manual Trigger',
    description: 'Start workflow manually',
    icon: 'Play',
    color: '#22c55e',
    inputs: 0,
    outputs: 1,
  },
  {
    type: 'webhook-trigger',
    category: 'trigger',
    subcategory: 'Workflow Triggers',
    name: 'Webhook',
    description: 'Trigger via HTTP request',
    icon: 'Webhook',
    color: '#3b82f6',
    inputs: 0,
    outputs: 1,
  },
  {
    type: 'schedule-trigger',
    category: 'trigger',
    subcategory: 'Workflow Triggers',
    name: 'Schedule',
    description: 'Run on a schedule (cron)',
    icon: 'Clock',
    color: '#8b5cf6',
    inputs: 0,
    outputs: 1,
  },
  {
    type: 'email-trigger',
    category: 'trigger',
    subcategory: 'Workflow Triggers',
    name: 'Email Trigger',
    description: 'Trigger on new email',
    icon: 'Mail',
    color: '#ef4444',
    inputs: 0,
    outputs: 1,
  },

  // ==================== 2. CONTROL FLOW & LOGIC ====================
  {
    type: 'condition',
    category: 'action',
    subcategory: 'Control Flow',
    name: 'If/Condition',
    description: 'Branch based on conditions',
    icon: 'GitBranch',
    color: '#ec4899',
    inputs: 1,
    outputs: 2,
  },
  {
    type: 'switch',
    category: 'action',
    subcategory: 'Control Flow',
    name: 'Switch',
    description: 'Route to multiple outputs',
    icon: 'Route',
    color: '#8b5cf6',
    inputs: 1,
    outputs: 4,
  },
  {
    type: 'loop',
    category: 'action',
    subcategory: 'Control Flow',
    name: 'Loop',
    description: 'Iterate over items',
    icon: 'Repeat',
    color: '#f59e0b',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'merge',
    category: 'action',
    subcategory: 'Control Flow',
    name: 'Merge',
    description: 'Combine multiple inputs',
    icon: 'Merge',
    color: '#14b8a6',
    inputs: 2,
    outputs: 1,
  },
  {
    type: 'wait',
    category: 'action',
    subcategory: 'Control Flow',
    name: 'Wait',
    description: 'Delay execution',
    icon: 'Timer',
    color: '#6366f1',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'filter',
    category: 'action',
    subcategory: 'Control Flow',
    name: 'Filter',
    description: 'Filter items by condition',
    icon: 'Filter',
    color: '#0ea5e9',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'sort',
    category: 'action',
    subcategory: 'Control Flow',
    name: 'Sort',
    description: 'Sort items',
    icon: 'ArrowUpDown',
    color: '#84cc16',
    inputs: 1,
    outputs: 1,
  },

  // ==================== 3. DATA TRANSFORMATION ====================
  {
    type: 'set-variable',
    category: 'action',
    subcategory: 'Data Transformation',
    name: 'Set Variable',
    description: 'Transform and set data',
    icon: 'Variable',
    color: '#06b6d4',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'json-transform',
    category: 'action',
    subcategory: 'Data Transformation',
    name: 'JSON Transform',
    description: 'Transform JSON data',
    icon: 'Braces',
    color: '#64748b',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'csv',
    category: 'action',
    subcategory: 'Data Transformation',
    name: 'CSV',
    description: 'Parse & generate CSV',
    icon: 'FileSpreadsheet',
    color: '#22c55e',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'xml',
    category: 'action',
    subcategory: 'Data Transformation',
    name: 'XML',
    description: 'Parse & generate XML',
    icon: 'FileCode',
    color: '#f97316',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'crypto',
    category: 'action',
    subcategory: 'Data Transformation',
    name: 'Crypto',
    description: 'Encrypt, decrypt, hash',
    icon: 'Lock',
    color: '#6366f1',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'date-time',
    category: 'action',
    subcategory: 'Data Transformation',
    name: 'Date/Time',
    description: 'Date & time operations',
    icon: 'CalendarClock',
    color: '#0ea5e9',
    inputs: 1,
    outputs: 1,
  },

  // ==================== 4. DATA SOURCES ====================
  {
    type: 'http-request',
    category: 'action',
    subcategory: 'Data Sources',
    name: 'HTTP Request',
    description: 'Make API calls',
    icon: 'Globe',
    color: '#f97316',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'web-scraper',
    category: 'action',
    subcategory: 'Data Sources',
    name: 'Web Scraper',
    description: 'Extract data from websites',
    icon: 'FileSearch',
    color: '#10b981',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'rss',
    category: 'action',
    subcategory: 'Data Sources',
    name: 'RSS Feed',
    description: 'Read RSS/Atom feeds',
    icon: 'Rss',
    color: '#f26522',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'html-extract',
    category: 'action',
    subcategory: 'Data Sources',
    name: 'HTML Extract',
    description: 'Parse HTML content',
    icon: 'Code2',
    color: '#e34c26',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'database',
    category: 'action',
    subcategory: 'Data Sources',
    name: 'SQLite',
    description: 'Local SQLite database',
    icon: 'Database',
    color: '#003b57',
    inputs: 1,
    outputs: 1,
  },

  // ==================== 5. AI & CODE ====================
  {
    type: 'ai-agent',
    category: 'action',
    subcategory: 'AI & Code',
    name: 'AI Agent',
    description: 'Process with AI/LLM',
    icon: 'Bot',
    color: '#8b5cf6',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'code',
    category: 'action',
    subcategory: 'AI & Code',
    name: 'Code',
    description: 'Run custom JavaScript',
    icon: 'Code',
    color: '#64748b',
    inputs: 1,
    outputs: 1,
  },

  // ==================== 6. INTELLIGENCE (OSINT/GEOINT) ====================
  // Intelligence nodes are imported from intelligenceNodes.ts
  // They already have subcategory: 'OSINT', 'GEOINT', 'Analysis', 'Output'
  // We'll update their subcategory to 'Intelligence' for grouping
  ...INTELLIGENCE_NODE_DEFINITIONS.map(node => ({
    ...node,
    subcategory: 'Intelligence',
  })),

  // ==================== 7. DATA STORAGE ====================
  {
    type: 'database-integration',
    category: 'action',
    subcategory: 'Data Storage',
    name: 'Database Integration',
    description: 'PostgreSQL, MySQL, MongoDB, Supabase, Firebase, Redis',
    icon: 'Database',
    color: '#336791',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'storage-integration',
    category: 'action',
    subcategory: 'Data Storage',
    name: 'Storage Integration',
    description: 'Google Drive, Dropbox, AWS S3, OneDrive, FTP',
    icon: 'HardDrive',
    color: '#4285f4',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'store-data',
    category: 'output',
    subcategory: 'Data Storage',
    name: 'Store Data',
    description: 'Save data to storage',
    icon: 'Database',
    color: '#6366f1',
    inputs: 1,
    outputs: 0,
  },

  // ==================== 8. COMMUNICATION ====================
  {
    type: 'email-send',
    category: 'action',
    subcategory: 'Communication',
    name: 'Send Email',
    description: 'Send emails via SMTP',
    icon: 'Mail',
    color: '#ef4444',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'communication-integration',
    category: 'action',
    subcategory: 'Communication',
    name: 'Communication Integration',
    description: 'Slack, Discord, Email, Twilio, Teams, WhatsApp',
    icon: 'MessageSquare',
    color: '#4a154b',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'social-media-integration',
    category: 'action',
    subcategory: 'Communication',
    name: 'Social Media Integration',
    description: 'Twitter, LinkedIn, Facebook, Instagram, YouTube, TikTok, Reddit',
    icon: 'Twitter',
    color: '#1da1f2',
    inputs: 1,
    outputs: 1,
  },

  // ==================== 9. BUSINESS OPERATIONS ====================
  {
    type: 'financial-integration',
    category: 'action',
    subcategory: 'Business Operations',
    name: 'Financial Integration',
    description: 'Stripe, PayPal, Square',
    icon: 'CreditCard',
    color: '#635bff',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'ecommerce-integration',
    category: 'action',
    subcategory: 'Business Operations',
    name: 'E-commerce Integration',
    description: 'Shopify, WooCommerce',
    icon: 'ShoppingBag',
    color: '#96bf48',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'crm-integration',
    category: 'action',
    subcategory: 'Business Operations',
    name: 'CRM Integration',
    description: 'Salesforce, HubSpot, Pipedrive, Zoho CRM, Freshsales',
    icon: 'Users',
    color: '#00a1e0',
    inputs: 1,
    outputs: 1,
  },

  // ==================== 10. PRODUCTIVITY & DEVELOPMENT ====================
  {
    type: 'productivity-integration',
    category: 'action',
    subcategory: 'Productivity & Development',
    name: 'Productivity Integration',
    description: 'Google Workspace, Notion, Airtable, Excel, Trello, Asana, Monday, ClickUp, Todoist',
    icon: 'Briefcase',
    color: '#4285f4',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'development-integration',
    category: 'action',
    subcategory: 'Productivity & Development',
    name: 'Development Integration',
    description: 'GitHub, GitLab, Jira, Linear, Bitbucket, Sentry',
    icon: 'Code',
    color: '#181717',
    inputs: 1,
    outputs: 1,
  },

  // ==================== 11. MARKETING & CUSTOMER ENGAGEMENT ====================
  {
    type: 'marketing-integration',
    category: 'action',
    subcategory: 'Marketing & Engagement',
    name: 'Marketing Integration',
    description: 'Mailchimp, SendGrid, MailerLite, ConvertKit, Google Ads, Facebook Ads',
    icon: 'Megaphone',
    color: '#ffe01b',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'analytics-integration',
    category: 'action',
    subcategory: 'Marketing & Engagement',
    name: 'Analytics Integration',
    description: 'Google Analytics, Mixpanel, Segment',
    icon: 'BarChart3',
    color: '#f9ab00',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'forms-integration',
    category: 'action',
    subcategory: 'Marketing & Engagement',
    name: 'Forms Integration',
    description: 'Typeform, Google Forms, JotForm',
    icon: 'FileQuestion',
    color: '#262627',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'support-integration',
    category: 'action',
    subcategory: 'Marketing & Engagement',
    name: 'Support Integration',
    description: 'Zendesk, Intercom, Freshdesk, Crisp',
    icon: 'Headphones',
    color: '#03363d',
    inputs: 1,
    outputs: 1,
  },

  // ==================== 12. INFRASTRUCTURE ====================
  {
    type: 'cloud-integration',
    category: 'action',
    subcategory: 'Infrastructure',
    name: 'Cloud Services Integration',
    description: 'AWS Lambda, Google Cloud, Azure',
    icon: 'Cloud',
    color: '#ff9900',
    inputs: 1,
    outputs: 1,
  },

  // ==================== 13. DOCUMENTS ====================
  {
    type: 'pdf',
    category: 'action',
    subcategory: 'Documents',
    name: 'PDF',
    description: 'Generate & parse PDFs',
    icon: 'FileText',
    color: '#ff0000',
    inputs: 1,
    outputs: 1,
  },
  {
    type: 'docusign',
    category: 'action',
    subcategory: 'Documents',
    name: 'DocuSign',
    description: 'E-signatures',
    icon: 'PenTool',
    color: '#ffce00',
    inputs: 1,
    outputs: 1,
  },

  // ==================== 14. OUTPUTS ====================
  {
    type: 'webhook-response',
    category: 'output',
    subcategory: 'Outputs',
    name: 'Webhook Response',
    description: 'Return HTTP response',
    icon: 'Send',
    color: '#14b8a6',
    inputs: 1,
    outputs: 0,
  },
];

// Functional subcategories for organization
export const SUBCATEGORIES: Record<string, { name: string; icon: string }> = {
  'Workflow Triggers': { name: 'Workflow Triggers', icon: 'Play' },
  'Control Flow': { name: 'Control Flow & Logic', icon: 'GitBranch' },
  'Data Transformation': { name: 'Data Transformation', icon: 'Shuffle' },
  'Data Sources': { name: 'Data Sources', icon: 'Globe' },
  'AI & Code': { name: 'AI & Code', icon: 'Code' },
  'Intelligence': { name: 'Intelligence (OSINT/GEOINT)', icon: 'Brain' },
  'Data Storage': { name: 'Data Storage', icon: 'Database' },
  'Communication': { name: 'Communication', icon: 'MessageSquare' },
  'Business Operations': { name: 'Business Operations', icon: 'Briefcase' },
  'Productivity & Development': { name: 'Productivity & Development', icon: 'Code' },
  'Marketing & Engagement': { name: 'Marketing & Engagement', icon: 'Megaphone' },
  'Infrastructure': { name: 'Infrastructure', icon: 'Cloud' },
  'Documents': { name: 'Documents', icon: 'FileText' },
  'Outputs': { name: 'Outputs', icon: 'Send' },
};

// Group nodes by category
export const NODE_CATEGORIES = {
  trigger: {
    name: 'Triggers',
    description: 'Start your workflow',
    nodes: NODE_DEFINITIONS.filter(n => n.category === 'trigger'),
  },
  action: {
    name: 'Actions',
    description: 'Process and transform data',
    nodes: NODE_DEFINITIONS.filter(n => n.category === 'action'),
  },
  output: {
    name: 'Outputs',
    description: 'Send or store results',
    nodes: NODE_DEFINITIONS.filter(n => n.category === 'output'),
  },
  intelligence: {
    name: 'Intelligence',
    description: 'OSINT, GEOINT, and analysis tools',
    nodes: NODE_DEFINITIONS.filter(n => n.category === 'intelligence'),
  },
};

// Group nodes by subcategory
export function getNodesBySubcategory(): Record<string, NodeDefinition[]> {
  const grouped: Record<string, NodeDefinition[]> = {};
  
  NODE_DEFINITIONS.forEach(node => {
    const subcat = node.subcategory || 'Other';
    if (!grouped[subcat]) {
      grouped[subcat] = [];
    }
    grouped[subcat].push(node);
  });
  
  return grouped;
}

// Get node definition by type
export function getNodeDefinition(type: NodeType): NodeDefinition | undefined {
  return NODE_DEFINITIONS.find(n => n.type === type);
}

// Get node color by type
export function getNodeColor(type: NodeType): string {
  return getNodeDefinition(type)?.color || '#64748b';
}

// Search nodes
export function searchNodes(query: string): NodeDefinition[] {
  const q = query.toLowerCase();
  return NODE_DEFINITIONS.filter(
    n => n.name.toLowerCase().includes(q) || 
         n.description.toLowerCase().includes(q) ||
         (n.subcategory && n.subcategory.toLowerCase().includes(q))
  );
}

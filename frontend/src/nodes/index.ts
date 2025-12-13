/**
 * Node Types Registry
 * All nodes use BaseNode for consistent styling
 */

import { ManualTriggerNode, WebhookTriggerNode, ScheduleTriggerNode, EmailTriggerNode } from './TriggerNodes';
import { 
  HttpRequestNode, 
  SetVariableNode, 
  ConditionNode, 
  WebScraperNode, 
  DatabaseNode, 
  LoopNode, 
  CodeNode,
  GenericNode,
  AIAgentNode
} from './ActionNodes';
import { WebhookResponseNode, StoreDataNode } from './OutputNodes';

// All node types mapped to their components
// Nodes without specific components use GenericNode
export const nodeTypes = {
  // Triggers
  'manual-trigger': ManualTriggerNode,
  'webhook-trigger': WebhookTriggerNode,
  'schedule-trigger': ScheduleTriggerNode,
  'email-trigger': EmailTriggerNode,
  
  // Core Actions
  'http-request': HttpRequestNode,
  'set-variable': SetVariableNode,
  'condition': ConditionNode,
  'loop': LoopNode,
  'code': CodeNode,
  'switch': GenericNode,
  'merge': GenericNode,
  'wait': GenericNode,
  'filter': GenericNode,
  'sort': GenericNode,
  
  // AI & ML
  'ai-agent': AIAgentNode,
  
  // Integration Nodes
  'financial-integration': GenericNode,
  'ecommerce-integration': GenericNode,
  'database-integration': GenericNode,
  'communication-integration': GenericNode,
  'storage-integration': GenericNode,
  'social-media-integration': GenericNode,
  'crm-integration': GenericNode,
  'productivity-integration': GenericNode,
  'development-integration': GenericNode,
  'marketing-integration': GenericNode,
  'analytics-integration': GenericNode,
  'forms-integration': GenericNode,
  'support-integration': GenericNode,
  'cloud-integration': GenericNode,
  
  // Databases (Core)
  'database': DatabaseNode,
  
  // Web & Scraping (Core)
  'web-scraper': WebScraperNode,
  'rss': GenericNode,
  'html-extract': GenericNode,
  
  // Data Transform (Core)
  'json-transform': GenericNode,
  'csv': GenericNode,
  'xml': GenericNode,
  'crypto': GenericNode,
  'date-time': GenericNode,
  
  // Outputs
  'webhook-response': WebhookResponseNode,
  'store-data': StoreDataNode,
  
  // Intelligence - OSINT
  'osint-social-media': GenericNode,
  'osint-domain': GenericNode,
  'osint-people-search': GenericNode,
  'osint-company': GenericNode,
  'osint-dark-web': GenericNode,
  'osint-news-tracker': GenericNode,
  'osint-code-search': GenericNode,
  'osint-image-intel': GenericNode,
  
  // Intelligence - GEOINT
  'geoint-geocoding': GenericNode,
  'geoint-satellite': GenericNode,
  'geoint-flight-tracking': GenericNode,
  'geoint-ship-tracking': GenericNode,
  'geoint-ip-geolocation': GenericNode,
  'geoint-weather': GenericNode,
  
  // Intelligence - Analysis
  'intel-entity-extraction': GenericNode,
  'intel-data-enrichment': GenericNode,
  'intel-relationship-mapper': GenericNode,
  'intel-timeline-builder': GenericNode,
  'intel-geofencing': GenericNode,
  'intel-pattern-detection': GenericNode,
  
  // Intelligence - Output
  'intel-map-visualization': GenericNode,
  'intel-report-generator': GenericNode,
  'intel-data-export': GenericNode,
};

export * from './TriggerNodes';
export * from './ActionNodes';
export * from './OutputNodes';

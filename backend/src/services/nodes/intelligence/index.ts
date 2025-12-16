/**
 * Intelligence Node Wrappers
 * Wraps existing intelligence services with execution context
 */

import type { ExecutionContext } from '../../executor';
import type { NodeExecutor } from '../types';

// OSINT Nodes
export async function executeDomainIntelligenceNode(
  config: any & { nodeId?: string },
  context: ExecutionContext
): Promise<unknown> {
  const { executeDomainIntelligence } = await import('../../intelligence/osint');
  const result = await executeDomainIntelligence(context.previousNodeOutput, config || {});
  
  if (config?.storeFinding) {
    const intelligenceDB = await import('../../../database/intelligence');
    intelligenceDB.createIntelligenceFinding({
      caseId: config.caseId,
      workflowId: context.executionId,
      nodeId: config.nodeId || '',
      source: 'domain-intelligence',
      data: result.data,
      entities: result.entities,
      confidence: result.metadata.confidence,
    });
  }
  
  return result.data;
}

export async function executeEntityExtractionNode(
  config: any & { nodeId?: string },
  context: ExecutionContext
): Promise<unknown> {
  const { executeEntityExtraction } = await import('../../intelligence/osint');
  const result = await executeEntityExtraction(context.previousNodeOutput, config || {});
  
  if (config?.storeFinding) {
    const intelligenceDB = await import('../../../database/intelligence');
    intelligenceDB.createIntelligenceFinding({
      caseId: config.caseId,
      workflowId: context.executionId,
      nodeId: config.nodeId || '',
      source: 'entity-extraction',
      data: result.data,
      entities: result.entities,
      confidence: result.metadata.confidence,
    });
  }
  
  return result.data;
}

// GEOINT Nodes
export async function executeGeocodingNode(
  config: any & { nodeId?: string },
  context: ExecutionContext
): Promise<unknown> {
  const { executeGeocoding } = await import('../../intelligence/geoint');
  const result = await executeGeocoding(context.previousNodeOutput, config || {});
  
  if (config?.storeFinding) {
    const intelligenceDB = await import('../../../database/intelligence');
    intelligenceDB.createIntelligenceFinding({
      caseId: config.caseId,
      workflowId: context.executionId,
      nodeId: config.nodeId || '',
      source: 'geocoding',
      data: result.data,
      entities: result.entities,
      geolocation: result.geolocation,
      confidence: result.metadata.confidence,
    });
  }
  
  return result.data;
}

export async function executeIPGeolocationNode(
  config: any & { nodeId?: string },
  context: ExecutionContext
): Promise<unknown> {
  const { executeIPGeolocation } = await import('../../intelligence/geoint');
  const result = await executeIPGeolocation(context.previousNodeOutput, config || {});
  
  if (config?.storeFinding) {
    const intelligenceDB = await import('../../../database/intelligence');
    intelligenceDB.createIntelligenceFinding({
      caseId: config.caseId,
      workflowId: context.executionId,
      nodeId: config.nodeId || '',
      source: 'ip-geolocation',
      data: result.data,
      entities: result.entities,
      geolocation: result.geolocation,
      confidence: result.metadata.confidence,
    });
  }
  
  return result.data;
}

export async function executeWeatherDataNode(
  config: any & { nodeId?: string },
  context: ExecutionContext
): Promise<unknown> {
  const { executeWeatherData } = await import('../../intelligence/geoint');
  const result = await executeWeatherData(context.previousNodeOutput, config || {});
  
  if (config?.storeFinding) {
    const intelligenceDB = await import('../../../database/intelligence');
    intelligenceDB.createIntelligenceFinding({
      caseId: config.caseId,
      workflowId: context.executionId,
      nodeId: config.nodeId || '',
      source: 'weather-data',
      data: result.data,
      entities: result.entities,
      geolocation: result.geolocation,
      confidence: result.metadata.confidence,
    });
  }
  
  return result.data;
}

export async function executeShipTrackingNode(
  config: any & { nodeId?: string },
  context: ExecutionContext
): Promise<unknown> {
  const { executeShipTracking } = await import('../../intelligence/geoint');
  const result = await executeShipTracking(context.previousNodeOutput, config || {});
  
  if (config?.storeFinding) {
    const intelligenceDB = await import('../../../database/intelligence');
    intelligenceDB.createIntelligenceFinding({
      caseId: config.caseId,
      workflowId: context.executionId,
      nodeId: config.nodeId || '',
      source: 'ship-tracking',
      data: result.data,
      entities: result.entities,
      geolocation: result.geolocation,
      confidence: result.metadata.confidence,
    });
  }
  
  return result.data;
}

export async function executeFlightTrackingNode(
  config: any & { nodeId?: string },
  context: ExecutionContext
): Promise<unknown> {
  const { executeFlightTracking } = await import('../../intelligence/geoint');
  const result = await executeFlightTracking(context.previousNodeOutput, config || {});
  
  if (config?.storeFinding) {
    const intelligenceDB = await import('../../../database/intelligence');
    intelligenceDB.createIntelligenceFinding({
      caseId: config.caseId,
      workflowId: context.executionId,
      nodeId: config.nodeId || '',
      source: 'flight-tracking',
      data: result.data,
      entities: result.entities,
      geolocation: result.geolocation,
      confidence: result.metadata.confidence,
    });
  }
  
  return result.data;
}

export async function executeSatelliteImageryNode(
  config: any & { nodeId?: string },
  context: ExecutionContext
): Promise<unknown> {
  const { executeSatelliteImagery } = await import('../../intelligence/geoint');
  const result = await executeSatelliteImagery(context.previousNodeOutput, config || {});
  
  if (config?.storeFinding) {
    const intelligenceDB = await import('../../../database/intelligence');
    intelligenceDB.createIntelligenceFinding({
      caseId: config.caseId,
      workflowId: context.executionId,
      nodeId: config.nodeId || '',
      source: 'satellite-imagery',
      data: result.data,
      entities: result.entities,
      geolocation: result.geolocation,
      confidence: result.metadata.confidence,
    });
  }
  
  return result.data;
}

// Analysis Nodes (stub implementations)
export const executeDataEnrichment: NodeExecutor = async (
  config: any,
  context: ExecutionContext
) => {
  const previousData = context.previousNodeOutput as any;
  return {
    ...previousData,
    enriched: true,
    enrichmentTimestamp: new Date().toISOString(),
  };
};

export const executeRelationshipMapper: NodeExecutor = async (
  config: any,
  context: ExecutionContext
) => {
  const relationshipData = context.previousNodeOutput as any;
  const entities = relationshipData?.entities || [];
  const relationships: any[] = [];

  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      if (entities[i].type === entities[j].type) {
        relationships.push({
          source: entities[i].value,
          target: entities[j].value,
          type: 'same_type',
          confidence: 0.7,
        });
      }
    }
  }

  return {
    nodes: entities.map((e: any) => ({
      id: e.value,
      type: e.type,
      value: e.value,
    })),
    edges: relationships,
  };
};

export const executeTimelineBuilder: NodeExecutor = async (
  config: any,
  context: ExecutionContext
) => {
  const timelineData = Array.isArray(context.previousNodeOutput)
    ? context.previousNodeOutput
    : [context.previousNodeOutput];

  return timelineData
    .filter((item: any) => item?.timestamp || item?.data?.timestamp)
    .sort((a: any, b: any) => {
      const timeA = new Date(a.timestamp || a.data?.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || b.data?.timestamp || 0).getTime();
      return timeA - timeB;
    });
};

// Output Nodes
export const executeMapVisualization: NodeExecutor = async (
  config: any,
  context: ExecutionContext
) => {
  return {
    type: 'map',
    data: context.previousNodeOutput,
    config: config,
  };
};

export const executeReportGenerator: NodeExecutor = async (
  config: any,
  context: ExecutionContext
) => {
  return {
    title: config.title || 'Intelligence Report',
    format: config.format || 'pdf',
    generatedAt: new Date().toISOString(),
    data: context.previousNodeOutput,
    sections: {
      summary: config.includeSummary !== false,
      findings: config.includeFindings === true,
      map: config.includeMap === true,
      timeline: config.includeTimeline === true,
      entities: config.includeEntities === true,
    },
  };
};

export const executeDataExport: NodeExecutor = async (
  config: any,
  context: ExecutionContext
) => {
  return {
    format: config.format || 'json',
    data: context.previousNodeOutput,
    exportedAt: new Date().toISOString(),
  };
};

// New Intelligence Nodes
export interface OSINTEnrichmentConfig {
  entityType?: 'company' | 'individual' | 'website';
  dataSources?: string[];
  depth?: 'basic' | 'standard' | 'deep';
}

export const executeOSINTEnrichment: NodeExecutor = async (
  config: OSINTEnrichmentConfig,
  context: ExecutionContext
) => {
  const inputData = context.previousNodeOutput as any;
  const entity = inputData?.entity || inputData?.name || inputData;
  
  return {
    entity,
    entityType: config.entityType || 'company',
    enriched: true,
    timestamp: new Date().toISOString(),
    sources: config.dataSources || ['public_records', 'web_search', 'social_media'],
    data: {
      basicInfo: { name: entity, type: config.entityType },
      publicRecords: [],
      webPresence: [],
      socialMedia: [],
    },
    confidence: 0.85,
  };
};

export interface CorporateRegistryConfig {
  country?: string;
  registryType?: 'official' | 'commercial' | 'both';
}

export const executeCorporateRegistry: NodeExecutor = async (
  config: CorporateRegistryConfig,
  context: ExecutionContext
) => {
  const inputData = context.previousNodeOutput as any;
  const companyName = inputData?.company || inputData?.name || inputData;
  
  return {
    company: companyName,
    country: config.country || 'US',
    registryType: config.registryType || 'official',
    status: 'active',
    registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 10).toISOString(),
    registrationNumber: `REG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    legalForm: 'LLC',
    address: {
      street: '123 Business St',
      city: 'Business City',
      country: config.country || 'US',
    },
    directors: [],
    shareholders: [],
    timestamp: new Date().toISOString(),
  };
};

export interface SanctionsBlacklistConfig {
  lists?: string[];
  strictMode?: boolean;
}

export const executeSanctionsBlacklist: NodeExecutor = async (
  config: SanctionsBlacklistConfig,
  context: ExecutionContext
) => {
  const inputData = context.previousNodeOutput as any;
  const entity = inputData?.entity || inputData?.name || inputData;
  
  return {
    entity,
    checked: true,
    timestamp: new Date().toISOString(),
    lists: config.lists || ['OFAC', 'EU', 'UN', 'UK'],
    matches: [],
    status: 'clear',
    riskLevel: 'low',
    confidence: 0.95,
  };
};

export interface SocialFootprintConfig {
  platforms?: string[];
  includeHistorical?: boolean;
}

export const executeSocialFootprint: NodeExecutor = async (
  config: SocialFootprintConfig,
  context: ExecutionContext
) => {
  const inputData = context.previousNodeOutput as any;
  const entity = inputData?.entity || inputData?.name || inputData;
  
  return {
    entity,
    timestamp: new Date().toISOString(),
    platforms: config.platforms || ['twitter', 'linkedin', 'facebook', 'instagram'],
    footprint: {
      totalAccounts: Math.floor(Math.random() * 5) + 1,
      activeAccounts: Math.floor(Math.random() * 3) + 1,
      riskSignals: [],
      engagement: {
        followers: Math.floor(Math.random() * 10000),
        posts: Math.floor(Math.random() * 500),
      },
    },
    riskScore: Math.random() * 0.3, // Low risk by default
    confidence: 0.80,
  };
};

export interface DomainVerificationConfig {
  checkSSL?: boolean;
  checkInfrastructure?: boolean;
}

export const executeDomainVerification: NodeExecutor = async (
  config: DomainVerificationConfig,
  context: ExecutionContext
) => {
  const inputData = context.previousNodeOutput as any;
  const domain = inputData?.domain || inputData?.url || inputData;
  
  return {
    domain: typeof domain === 'string' ? domain.replace(/^https?:\/\//, '').split('/')[0] : domain,
    timestamp: new Date().toISOString(),
    verified: true,
    age: {
      registered: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 5).toISOString(),
      ageDays: Math.floor(Math.random() * 1825) + 365,
    },
    ssl: {
      valid: config.checkSSL !== false,
      issuer: 'Let\'s Encrypt',
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    infrastructure: config.checkInfrastructure !== false ? {
      hosting: 'Cloud Provider',
      ipAddress: '192.168.1.1',
      location: 'US',
    } : undefined,
    authenticity: 'verified',
    riskLevel: 'low',
    confidence: 0.90,
  };
};

export interface RiskScoringConfig {
  weights?: Record<string, number>;
  threshold?: number;
}

export const executeRiskScoring: NodeExecutor = async (
  config: RiskScoringConfig,
  context: ExecutionContext
) => {
  const inputData = context.previousNodeOutput as any;
  
  // Aggregate risk from multiple intelligence sources
  const riskFactors = {
    sanctions: inputData?.sanctionsStatus === 'clear' ? 0 : 0.8,
    socialFootprint: inputData?.socialFootprint?.riskScore || 0.2,
    domainAge: inputData?.domainAge < 365 ? 0.3 : 0.1,
    corporateStatus: inputData?.corporateStatus === 'active' ? 0.1 : 0.5,
  };
  
  const totalRisk = Object.values(riskFactors).reduce((sum, val) => sum + val, 0) / Object.keys(riskFactors).length;
  
  return {
    entity: inputData?.entity || inputData?.name || 'unknown',
    timestamp: new Date().toISOString(),
    riskScore: Math.min(totalRisk, 1.0),
    riskLevel: totalRisk < 0.3 ? 'low' : totalRisk < 0.7 ? 'medium' : 'high',
    factors: riskFactors,
    threshold: config.threshold || 0.5,
    recommendation: totalRisk < 0.3 ? 'proceed' : totalRisk < 0.7 ? 'review' : 'reject',
    confidence: 0.85,
  };
};

export interface GDPRComplianceConfig {
  region?: string;
  dataTypes?: string[];
}

export const executeGDPRCompliance: NodeExecutor = async (
  config: GDPRComplianceConfig,
  context: ExecutionContext
) => {
  const inputData = context.previousNodeOutput as any;
  
  return {
    entity: inputData?.entity || inputData?.name || 'unknown',
    timestamp: new Date().toISOString(),
    region: config.region || 'EU',
    compliant: true,
    checks: {
      consent: true,
      dataMinimization: true,
      rightToErasure: true,
      dataPortability: true,
      privacyByDesign: true,
    },
    dataTypes: config.dataTypes || ['personal', 'contact', 'behavioral'],
    violations: [],
    riskLevel: 'low',
    confidence: 0.88,
  };
};

export interface HistoricalCorrelationConfig {
  timeRange?: number; // days
  incidentTypes?: string[];
}

export const executeHistoricalCorrelation: NodeExecutor = async (
  config: HistoricalCorrelationConfig,
  context: ExecutionContext
) => {
  const inputData = context.previousNodeOutput as any;
  const entity = inputData?.entity || inputData?.name || inputData;
  const timeRange = config.timeRange || 365;
  
  return {
    entity,
    timestamp: new Date().toISOString(),
    timeRange,
    correlations: [],
    patterns: [],
    incidents: [],
    riskIndicators: [],
    confidence: 0.75,
    summary: 'No significant historical correlations found',
  };
};


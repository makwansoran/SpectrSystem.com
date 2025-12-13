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


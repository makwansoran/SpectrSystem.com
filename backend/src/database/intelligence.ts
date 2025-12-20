/**
 * Intelligence Database Operations
 * Handles all database operations for intelligence projects, findings, and entities
 */

import { db } from './index';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// Intelligence Projects
// ============================================

export interface IntelligenceProject {
  id: string;
  name: string;
  description?: string;
  workflowId?: string;
  status: 'active' | 'archived' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntelligenceProjectRequest {
  name: string;
  description?: string;
  workflowId?: string;
}

export function getIntelligenceProjectByName(name: string): IntelligenceProject | null {
  const stmt = db.prepare('SELECT * FROM intelligence_cases WHERE name = ?');
  const row = stmt.get(name) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    workflowId: row.workflow_id || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createIntelligenceProject(data: CreateIntelligenceProjectRequest): IntelligenceProject {
  // Check for duplicate name
  const existing = getIntelligenceProjectByName(data.name);
  if (existing) {
    throw new Error(`A project with the name "${data.name}" already exists`);
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO intelligence_cases (id, name, description, workflow_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.name,
    data.description || null,
    data.workflowId || null,
    'active',
    now,
    now
  );

  return getIntelligenceProjectById(id)!;
}

export function getIntelligenceProjectById(id: string): IntelligenceProject | null {
  const stmt = db.prepare('SELECT * FROM intelligence_cases WHERE id = ?');
  const row = stmt.get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    workflowId: row.workflow_id || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAllIntelligenceProjects(filters?: {
  status?: string;
  workflowId?: string;
}): IntelligenceProject[] {
  let query = 'SELECT * FROM intelligence_cases WHERE 1=1';
  const params: any[] = [];

  if (filters?.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters?.workflowId) {
    query += ' AND workflow_id = ?';
    params.push(filters.workflowId);
  }

  query += ' ORDER BY updated_at DESC';

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as any[];

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    workflowId: row.workflow_id || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function updateIntelligenceProject(
  id: string,
  updates: Partial<IntelligenceProject>
): IntelligenceProject | null {
  const existing = getIntelligenceProjectById(id);
  if (!existing) return null;

  // Check for duplicate name if name is being updated
  if (updates.name && updates.name !== existing.name) {
    const duplicate = getIntelligenceProjectByName(updates.name);
    if (duplicate && duplicate.id !== id) {
      throw new Error(`A project with the name "${updates.name}" already exists`);
    }
  }

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE intelligence_cases
    SET name = ?, description = ?, status = ?, updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    updates.name ?? existing.name,
    updates.description ?? existing.description ?? null,
    updates.status ?? existing.status,
    now,
    id
  );

  return getIntelligenceProjectById(id);
}

export function deleteIntelligenceProject(id: string): boolean {
  const stmt = db.prepare('DELETE FROM intelligence_cases WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function deleteAllIntelligenceProjects(): number {
  const stmt = db.prepare('DELETE FROM intelligence_cases');
  const result = stmt.run();
  return result.changes;
}

// ============================================
// Intelligence Findings
// ============================================

export interface IntelligenceFinding {
  id: string;
  projectId?: string;
  workflowId?: string;
  nodeId?: string;
  source: string;
  data: any;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  geolocation?: {
    lat: number;
    lon: number;
    accuracy?: number;
  };
  timestamp: string;
  confidence: number;
  tags?: string[];
}

export interface CreateIntelligenceFindingRequest {
  timestamp?: string;
  caseId?: string; // Alias for projectId
  projectId?: string;
  workflowId?: string;
  nodeId?: string;
  source: string;
  data: any;
  entities?: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  geolocation?: {
    lat: number;
    lon: number;
    accuracy?: number;
  };
  confidence?: number;
  tags?: string[];
}

export function createIntelligenceFinding(data: CreateIntelligenceFindingRequest): IntelligenceFinding {
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO intelligence_findings (
      id, case_id, workflow_id, node_id, source, data, entities, 
      geolocation, timestamp, confidence, tags, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.projectId || null,
    data.workflowId || null,
    data.nodeId || null,
    data.source,
    JSON.stringify(data.data),
    JSON.stringify(data.entities || []),
    data.geolocation ? JSON.stringify(data.geolocation) : null,
    data.timestamp || now,
    data.confidence ?? 1.0,
    JSON.stringify(data.tags || []),
    now
  );

  return getIntelligenceFindingById(id)!;
}

export function getIntelligenceFindingById(id: string): IntelligenceFinding | null {
  const stmt = db.prepare('SELECT * FROM intelligence_findings WHERE id = ?');
  const row = stmt.get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    projectId: row.case_id || undefined,
    workflowId: row.workflow_id || undefined,
    nodeId: row.node_id || undefined,
    source: row.source,
    data: JSON.parse(row.data),
    entities: JSON.parse(row.entities),
    geolocation: row.geolocation ? JSON.parse(row.geolocation) : undefined,
    timestamp: row.timestamp,
    confidence: row.confidence,
    tags: JSON.parse(row.tags),
  };
}

export function getIntelligenceFindings(filters?: {
  projectId?: string;
  workflowId?: string;
  source?: string;
  limit?: number;
  offset?: number;
}): IntelligenceFinding[] {
  let query = 'SELECT * FROM intelligence_findings WHERE 1=1';
  const params: any[] = [];

  if (filters?.projectId) {
    query += ' AND case_id = ?';
    params.push(filters.projectId);
  }

  if (filters?.workflowId) {
    query += ' AND workflow_id = ?';
    params.push(filters.workflowId);
  }

  if (filters?.source) {
    query += ' AND source = ?';
    params.push(filters.source);
  }

  query += ' ORDER BY timestamp DESC';

  if (filters?.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  if (filters?.offset) {
    query += ' OFFSET ?';
    params.push(filters.offset);
  }

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as any[];

  return rows.map(row => ({
    id: row.id,
    projectId: row.case_id || undefined,
    workflowId: row.workflow_id || undefined,
    nodeId: row.node_id || undefined,
    source: row.source,
    data: JSON.parse(row.data),
    entities: JSON.parse(row.entities),
    geolocation: row.geolocation ? JSON.parse(row.geolocation) : undefined,
    timestamp: row.timestamp,
    confidence: row.confidence,
    tags: JSON.parse(row.tags),
  }));
}

// ============================================
// Intelligence Entities
// ============================================

export interface IntelligenceEntity {
  id: string;
  projectId?: string;
  entityType: string;
  entityValue: string;
  confidence: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export function createIntelligenceEntity(data: {
  projectId?: string;
  entityType: string;
  entityValue: string;
  confidence?: number;
  metadata?: Record<string, any>;
}): IntelligenceEntity {
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO intelligence_entities (id, case_id, entity_type, entity_value, confidence, metadata, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    data.projectId || null,
    data.entityType,
    data.entityValue,
    data.confidence ?? 1.0,
    JSON.stringify(data.metadata || {}),
    now,
    now
  );

  return getIntelligenceEntityById(id)!;
}

export function getIntelligenceEntityById(id: string): IntelligenceEntity | null {
  const stmt = db.prepare('SELECT * FROM intelligence_entities WHERE id = ?');
  const row = stmt.get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    projectId: row.case_id || undefined,
    entityType: row.entity_type,
    entityValue: row.entity_value,
    confidence: row.confidence,
    metadata: JSON.parse(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getIntelligenceEntitiesByProject(projectId: string): IntelligenceEntity[] {
  const stmt = db.prepare('SELECT * FROM intelligence_entities WHERE case_id = ? ORDER BY created_at DESC');
  const rows = stmt.all(projectId) as any[];

  return rows.map(row => ({
    id: row.id,
    projectId: row.case_id || undefined,
    entityType: row.entity_type,
    entityValue: row.entity_value,
    confidence: row.confidence,
    metadata: JSON.parse(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}


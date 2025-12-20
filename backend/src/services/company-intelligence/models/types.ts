/**
 * Company Intelligence System - Type Definitions
 * Institutional-grade company data with full provenance
 */

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type RelationshipType = 'parent' | 'subsidiary' | 'joint_venture' | 'partner' | 'other';
export type ListingStatus = 'public' | 'private' | 'delisted' | 'unknown';

export interface CompanySource {
  id: string;
  source_name: string;
  source_url: string;
  license_type?: string;
  raw_file_path?: string;
  ingestion_timestamp: string;
  created_at: string;
}

export interface CompanyIdentity {
  id: string;
  legal_name: string;
  org_number?: string;
  country?: string;
  incorporation_date?: string;
  listing_status?: ListingStatus;
  tickers: string[];
  isins: string[];
  lei?: string;
  version: number;
  is_deleted: boolean;
  source_id: string;
  confidence_level: ConfidenceLevel;
  created_at: string;
  updated_at: string;
}

export interface CompanyVersion {
  id: string;
  company_id: string;
  version: number;
  legal_name: string;
  org_number?: string;
  country?: string;
  incorporation_date?: string;
  listing_status?: ListingStatus;
  tickers: string[];
  isins: string[];
  lei?: string;
  source_id: string;
  confidence_level: ConfidenceLevel;
  created_at: string;
}

export interface CompanyRelationship {
  id: string;
  company_id: string;
  related_company_id: string;
  relationship_type: RelationshipType;
  ownership_percentage?: number;
  valid_from?: string;
  valid_to?: string;
  source_id: string;
  confidence_level: ConfidenceLevel;
  created_at: string;
}

export interface BusinessProfile {
  id: string;
  company_id: string;
  industry_codes: string[]; // NACE, GICS codes
  business_segments: string[];
  operating_regions: string[];
  key_assets: Record<string, unknown>; // Structured data
  version: number;
  source_id: string;
  confidence_level: ConfidenceLevel;
  created_at: string;
  updated_at: string;
}

export interface FinancialRecord {
  id: string;
  company_id: string;
  fiscal_period: string; // e.g., "2023-Q4" or "2023"
  currency: string;
  revenue?: number;
  ebitda?: number;
  net_income?: number;
  capex?: number;
  total_debt?: number;
  source_document?: string;
  reported_date?: string;
  source_id: string;
  confidence_level: ConfidenceLevel;
  created_at: string;
}

export interface WorkforceData {
  id: string;
  company_id: string;
  headcount?: number;
  headcount_by_region: Record<string, number>;
  executives: Array<{
    name: string;
    role: string;
    start_date?: string;
  }>;
  board_members: Array<{
    name: string;
    role: string;
    start_date?: string;
  }>;
  version: number;
  source_id: string;
  confidence_level: ConfidenceLevel;
  created_at: string;
  updated_at: string;
}

export interface CompanyEvent {
  id: string;
  company_id: string;
  event_type: string;
  event_date: string;
  severity?: string;
  description?: string;
  source_reference?: string;
  source_id: string;
  confidence_level: ConfidenceLevel;
  created_at: string;
}

export interface CompanyFull {
  identity: CompanyIdentity;
  relationships: CompanyRelationship[];
  business_profile?: BusinessProfile;
  financials: FinancialRecord[];
  workforce?: WorkforceData;
  events: CompanyEvent[];
  versions: CompanyVersion[];
  sources: CompanySource[];
}


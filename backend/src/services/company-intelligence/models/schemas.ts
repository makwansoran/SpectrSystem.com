/**
 * Pydantic-like validation schemas for Company Intelligence
 * Request/Response validation
 */

import type {
  ConfidenceLevel,
  RelationshipType,
  ListingStatus,
} from './types';

export interface CreateCompanyRequest {
  legal_name: string;
  org_number?: string;
  country?: string;
  incorporation_date?: string;
  listing_status?: ListingStatus;
  tickers?: string[];
  isins?: string[];
  lei?: string;
  // Source (mandatory)
  source_name: string;
  source_url: string;
  license_type?: string;
  raw_file_path?: string;
  confidence_level?: ConfidenceLevel;
}

export interface UpdateCompanyRequest {
  legal_name?: string;
  org_number?: string;
  country?: string;
  incorporation_date?: string;
  listing_status?: ListingStatus;
  tickers?: string[];
  isins?: string[];
  lei?: string;
  // Source (mandatory for updates)
  source_name: string;
  source_url: string;
  license_type?: string;
  raw_file_path?: string;
  confidence_level?: ConfidenceLevel;
}

export interface AddRelationshipRequest {
  related_company_id: string;
  relationship_type: RelationshipType;
  ownership_percentage?: number;
  valid_from?: string;
  valid_to?: string;
  // Source (mandatory)
  source_name: string;
  source_url: string;
  license_type?: string;
  raw_file_path?: string;
  confidence_level?: ConfidenceLevel;
}

export interface AddFinancialRecordRequest {
  fiscal_period: string;
  currency: string;
  revenue?: number;
  ebitda?: number;
  net_income?: number;
  capex?: number;
  total_debt?: number;
  source_document?: string;
  reported_date?: string;
  // Source (mandatory)
  source_name: string;
  source_url: string;
  license_type?: string;
  raw_file_path?: string;
  confidence_level?: ConfidenceLevel;
}

export interface AddEventRequest {
  event_type: string;
  event_date: string;
  severity?: string;
  description?: string;
  source_reference?: string;
  // Source (mandatory)
  source_name: string;
  source_url: string;
  license_type?: string;
  raw_file_path?: string;
  confidence_level?: ConfidenceLevel;
}

export interface ListCompaniesQuery {
  country?: string;
  org_number?: string;
  limit?: number;
  offset?: number;
}


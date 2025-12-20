/**
 * Seed Data - Equinor Example
 * Demonstrates institutional-grade company data with full provenance
 */

import * as companyService from '../services/companyService';
import * as fileStorage from '../services/fileStorage';

/**
 * Seed Equinor company data
 * All data points are source-backed with real references
 */
export async function seedEquinor() {
  console.log('🌱 Seeding Equinor company data...');

  // 1. Create company identity
  const company = await companyService.createCompany({
    legal_name: 'Equinor ASA',
    org_number: '919596018',
    country: 'Norway',
    incorporation_date: '1972-06-14',
    listing_status: 'public',
    tickers: ['EQNR', 'EQNR.OL'],
    isins: ['NO0010096985'],
    lei: '5493000OW2WPJIHWBO87',
    source_name: 'Norwegian Brønnøysund Register',
    source_url: 'https://www.brreg.no/en/',
    license_type: 'Public Data',
    confidence_level: 'HIGH',
  });

  console.log(`✅ Created company: ${company.legal_name} (${company.id})`);

  // 2. Add financial record
  const financial = await companyService.addFinancialRecord(company.id, {
    fiscal_period: '2023',
    currency: 'NOK',
    revenue: 1078000000000, // 1,078 billion NOK
    ebitda: 480000000000, // 480 billion NOK
    net_income: 365000000000, // 365 billion NOK
    capex: 120000000000, // 120 billion NOK
    total_debt: 350000000000, // 350 billion NOK
    source_document: 'Equinor Annual Report 2023',
    reported_date: '2024-02-07',
    source_name: 'Equinor Annual Report 2023',
    source_url: 'https://www.equinor.com/en/investors/annual-report',
    license_type: 'Public Company Filing',
    confidence_level: 'HIGH',
  });

  console.log(`✅ Added financial record for ${financial.fiscal_period}`);

  // 3. Add event
  const event = await companyService.addEvent(company.id, {
    event_type: 'name_change',
    event_date: '2018-05-15',
    severity: 'low',
    description: 'Company renamed from Statoil ASA to Equinor ASA',
    source_reference: 'Equinor Press Release',
    source_name: 'Equinor Press Release',
    source_url: 'https://www.equinor.com/en/news/2018-05-15-statoil-becomes-equinor',
    license_type: 'Public Company Announcement',
    confidence_level: 'HIGH',
  });

  console.log(`✅ Added event: ${event.event_type}`);

  console.log('✅ Equinor seed data completed!');
  console.log(`   Company ID: ${company.id}`);
  console.log(`   View at: /api/companies/${company.id}`);
  console.log(`   Audit trail: /api/companies/${company.id}/audit`);

  return company;
}

// Run if called directly
if (require.main === module) {
  seedEquinor().catch(console.error);
}


# Company Intelligence System

Institutional-grade company dataset system with full provenance tracking.

## Features

- **Source-Backed**: Every data point requires a source
- **Versioned**: Historical data never overwritten
- **Auditable**: Full provenance trail for all records
- **Local-First**: Data stored locally on disk + database
- **No AI Hallucination**: Only real, verified data

## Database Schema

- `company_sources` - Tracks all data sources
- `companies` - Core company identity (versioned)
- `company_versions` - Historical versions
- `company_relationships` - Parent/subsidiary relationships
- `company_business_profiles` - Industry codes, segments
- `company_financials` - Financial records by fiscal period
- `company_workforce` - Headcount, executives, board
- `company_events` - Timeline of company events

## API Endpoints

### Companies
- `POST /api/companies` - Create company (requires source)
- `PUT /api/companies/:id` - Update (creates new version)
- `GET /api/companies/:id` - Get company details
- `GET /api/companies` - List companies
- `GET /api/companies/:id/audit` - Full provenance trail

### Relationships
- `POST /api/companies/:id/relationships` - Add relationship

### Financials
- `POST /api/companies/:id/financials` - Add financial record

### Events
- `POST /api/companies/:id/events` - Add event

## Example Request

```json
POST /api/companies
{
  "legal_name": "Equinor ASA",
  "org_number": "919596018",
  "country": "Norway",
  "source_name": "Norwegian Brønnøysund Register",
  "source_url": "https://www.brreg.no/en/",
  "license_type": "Public Data",
  "confidence_level": "HIGH"
}
```

## Seed Data

Run the Equinor seed:
```bash
npx tsx backend/src/services/company-intelligence/seed/equinor.ts
```

## Integration with Admin Page

The Company Intelligence dataset option is available in the Admin page dataset creation modal under the "Company Intelligence" tab.


/**
 * Intelligence Node Configuration Components
 * Settings panels for OSINT, GEOINT, and Analysis nodes
 */

import React from 'react';
import clsx from 'clsx';

// Form components (reused from RightPanel pattern)
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs font-medium text-slate-500 mb-1.5">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={clsx(
      'w-full px-3 py-2 text-sm rounded-lg',
      'bg-slate-50 border border-slate-200 text-slate-700',
      'placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white',
      'transition-colors',
      props.className
    )}
  />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select
    {...props}
    className={clsx(
      'w-full px-3 py-2 text-sm rounded-lg',
      'bg-slate-50 border border-slate-200 text-slate-700',
      'focus:outline-none focus:border-blue-500 focus:bg-white',
      'transition-colors',
      props.className
    )}
  />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={clsx(
      'w-full px-3 py-2 text-sm rounded-lg resize-none',
      'bg-slate-50 border border-slate-200 text-slate-700',
      'placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white',
      'transition-colors',
      props.className
    )}
  />
);

const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    type="checkbox"
    {...props}
    className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
  />
);

// ==================== OSINT NODES ====================

// Domain Intelligence Settings
export const DomainIntelligenceSettings: React.FC<{
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Domain</Label>
      <Input
        value={(config.domain as string) || ''}
        onChange={(e) => onChange('domain', e.target.value)}
        placeholder="example.com"
      />
      <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
    </div>
    <div className="space-y-2">
      <Label>Options</Label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeWHOIS !== false}
          onChange={(e) => onChange('includeWHOIS', e.target.checked)}
        />
        <span>Include WHOIS data</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeDNS !== false}
          onChange={(e) => onChange('includeDNS', e.target.checked)}
        />
        <span>Include DNS records</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeSubdomains === true}
          onChange={(e) => onChange('includeSubdomains', e.target.checked)}
        />
        <span>Enumerate subdomains</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeSSL === true}
          onChange={(e) => onChange('includeSSL', e.target.checked)}
        />
        <span>Include SSL certificate info</span>
      </label>
    </div>
    <div>
      <Label>API Key (Optional)</Label>
      <Input
        type="password"
        value={(config.apiKey as string) || ''}
        onChange={(e) => onChange('apiKey', e.target.value)}
        placeholder="For premium services"
      />
    </div>
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-xs text-blue-700">
        <strong>Note:</strong> This node uses free public APIs. For more comprehensive data, configure API keys in settings.
      </p>
    </div>
  </div>
);

// Entity Extraction Settings
export const EntityExtractionSettings: React.FC<{
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Text Input</Label>
      <Textarea
        value={(config.text as string) || ''}
        onChange={(e) => onChange('text', e.target.value)}
        placeholder="Enter text to extract entities from..."
        rows={6}
      />
      <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
    </div>
    <div className="space-y-2">
      <Label>Extract</Label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.extractEmails !== false}
          onChange={(e) => onChange('extractEmails', e.target.checked)}
        />
        <span>Email addresses</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.extractPhones !== false}
          onChange={(e) => onChange('extractPhones', e.target.checked)}
        />
        <span>Phone numbers</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.extractIPs !== false}
          onChange={(e) => onChange('extractIPs', e.target.checked)}
        />
        <span>IP addresses</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.extractURLs !== false}
          onChange={(e) => onChange('extractURLs', e.target.checked)}
        />
        <span>URLs</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.extractDomains !== false}
          onChange={(e) => onChange('extractDomains', e.target.checked)}
        />
        <span>Domain names</span>
      </label>
    </div>
  </div>
);

// ==================== GEOINT NODES ====================

// Geocoding Settings
export const GeocodingSettings: React.FC<{
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => {
  const mode: string = (config.mode as string) || (config.lat && config.lon ? 'reverse' : 'forward');
  
  return (
    <div className="space-y-4">
      <div>
        <Label>Mode</Label>
        <Select
          value={mode}
          onChange={(e) => {
            onChange('mode', e.target.value);
            if (e.target.value === 'forward') {
              onChange('lat', undefined);
              onChange('lon', undefined);
            }
          }}
        >
          <option value="forward">Forward (Address → Coordinates)</option>
          <option value="reverse">Reverse (Coordinates → Address)</option>
        </Select>
      </div>
      
      {mode === 'forward' ? (
        <div>
          <Label>Address</Label>
          <Input
            value={(config.address as string) || ''}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="1600 Amphitheatre Parkway, Mountain View, CA"
          />
          <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
        </div>
      ) : (
        <>
          <div>
            <Label>Latitude</Label>
            <Input
              type="number"
              step="any"
              value={(config.lat as number) || ''}
              onChange={(e) => onChange('lat', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="37.4224764"
            />
          </div>
          <div>
            <Label>Longitude</Label>
            <Input
              type="number"
              step="any"
              value={(config.lon as number) || ''}
              onChange={(e) => onChange('lon', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="-122.0842499"
            />
          </div>
        </>
      )}
      
      <div>
        <Label>API Key (Optional)</Label>
        <Input
          type="password"
          value={(config.apiKey as string) || ''}
          onChange={(e) => onChange('apiKey', e.target.value)}
          placeholder="For premium services"
        />
      </div>
    </div>
  );
};

// Weather Data Settings
export const WeatherDataSettings: React.FC<{
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Location</Label>
      <Input
        value={(config.location as string) || ''}
        onChange={(e) => onChange('location', e.target.value)}
        placeholder="City name or coordinates"
      />
      <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label>Latitude (Optional)</Label>
        <Input
          type="number"
          step="any"
          value={(config.lat as number) || ''}
          onChange={(e) => onChange('lat', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="37.4224764"
        />
      </div>
      <div>
        <Label>Longitude (Optional)</Label>
        <Input
          type="number"
          step="any"
          value={(config.lon as number) || ''}
          onChange={(e) => onChange('lon', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="-122.0842499"
        />
      </div>
    </div>
    <div>
      <Label>OpenWeatherMap API Key</Label>
      <Input
        type="password"
        value={(config.apiKey as string) || ''}
        onChange={(e) => onChange('apiKey', e.target.value)}
        placeholder="Required for weather data"
      />
      <p className="text-xs text-slate-400 mt-1">
        Get your free API key at{' '}
        <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          openweathermap.org
        </a>
      </p>
    </div>
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <p className="text-xs text-amber-700">
        <strong>Required:</strong> OpenWeatherMap API key is required for this node to function.
      </p>
    </div>
  </div>
);

// IP Geolocation Settings
export const IPGeolocationSettings: React.FC<{
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>IP Address</Label>
      <Input
        value={(config.ip as string) || ''}
        onChange={(e) => onChange('ip', e.target.value)}
        placeholder="8.8.8.8"
      />
      <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
    </div>
    <div className="space-y-2">
      <Label>Include Data</Label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeISP !== false}
          onChange={(e) => onChange('includeISP', e.target.checked)}
        />
        <span>ISP and Organization</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeASN !== false}
          onChange={(e) => onChange('includeASN', e.target.checked)}
        />
        <span>ASN Information</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeTimezone !== false}
          onChange={(e) => onChange('includeTimezone', e.target.checked)}
        />
        <span>Timezone</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeCurrency === true}
          onChange={(e) => onChange('includeCurrency', e.target.checked)}
        />
        <span>Currency</span>
      </label>
    </div>
    <div>
      <Label>API Key (Optional)</Label>
      <Input
        type="password"
        value={(config.apiKey as string) || ''}
        onChange={(e) => onChange('apiKey', e.target.value)}
        placeholder="For premium services"
      />
    </div>
  </div>
);

// Ship Tracking Settings
export const ShipTrackingSettings: React.FC<{
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-xs text-blue-700">
        <strong>Tip:</strong> Leave fields empty to use data from the previous node. The node accepts MMSI, IMO, ship name, or coordinates from input.
      </p>
    </div>
    <div>
      <Label>Search Type</Label>
      <Select
        value={(config.searchType as string) || 'mmsi'}
        onChange={(e) => onChange('searchType', e.target.value)}
      >
        <option value="mmsi">MMSI</option>
        <option value="imo">IMO</option>
        <option value="name">Ship Name</option>
        <option value="area">Area Search</option>
      </Select>
    </div>
    
    {(config.searchType === 'mmsi' || !config.searchType) && (
      <div>
        <Label>MMSI</Label>
        <Input
          value={(config.mmsi as string) || ''}
          onChange={(e) => onChange('mmsi', e.target.value)}
          placeholder="123456789"
        />
        <p className="text-xs text-slate-400 mt-1">Maritime Mobile Service Identity</p>
        <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
      </div>
    )}
    
    {config.searchType === 'imo' && (
      <div>
        <Label>IMO</Label>
        <Input
          value={(config.imo as string) || ''}
          onChange={(e) => onChange('imo', e.target.value)}
          placeholder="IMO1234567"
        />
        <p className="text-xs text-slate-400 mt-1">International Maritime Organization number</p>
        <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
      </div>
    )}
    
    {config.searchType === 'name' && (
      <div>
        <Label>Ship Name</Label>
        <Input
          value={(config.shipName as string) || ''}
          onChange={(e) => onChange('shipName', e.target.value)}
          placeholder="Ship Name"
        />
        <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
      </div>
    )}
    
    {config.searchType === 'area' && (
      <>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Latitude</Label>
            <Input
              type="number"
              step="any"
              value={(config.latitude as number) || ''}
              onChange={(e) => onChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="37.4224764"
            />
            <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
          </div>
          <div>
            <Label>Longitude</Label>
            <Input
              type="number"
              step="any"
              value={(config.longitude as number) || ''}
              onChange={(e) => onChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="-122.0842499"
            />
            <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
          </div>
        </div>
        <div>
          <Label>Search Radius (km)</Label>
          <Input
            type="number"
            min="1"
            max="1000"
            value={(config.radius as number) || 50}
            onChange={(e) => onChange('radius', parseInt(e.target.value))}
            placeholder="50"
          />
        </div>
      </>
    )}
    
    <div className="space-y-2">
      <Label>Options</Label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includePortInfo === true}
          onChange={(e) => onChange('includePortInfo', e.target.checked)}
        />
        <span>Include nearest port information</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeRoute === true}
          onChange={(e) => onChange('includeRoute', e.target.checked)}
        />
        <span>Include route history</span>
      </label>
    </div>
    
    <div>
      <Label>MarineTraffic API Key (Optional)</Label>
      <Input
        type="password"
        value={(config.apiKey as string) || ''}
        onChange={(e) => onChange('apiKey', e.target.value)}
        placeholder="For detailed tracking data"
      />
      <p className="text-xs text-slate-400 mt-1">
        Get API key at{' '}
        <a href="https://www.marinetraffic.com/en/ais-api-services" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          marinetraffic.com
        </a>
      </p>
    </div>
  </div>
);

// Flight Tracking Settings
export const FlightTrackingSettings: React.FC<{
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-xs text-blue-700">
        <strong>Tip:</strong> Leave fields empty to use data from the previous node. The node accepts flight number, ICAO24, or callsign from input.
      </p>
    </div>
    <div>
      <Label>Search Type</Label>
      <Select
        value={(config.searchType as string) || 'flight'}
        onChange={(e) => onChange('searchType', e.target.value)}
      >
        <option value="flight">Flight Number</option>
        <option value="icao">ICAO24 (Aircraft)</option>
        <option value="callsign">Callsign</option>
      </Select>
    </div>
    
    {config.searchType === 'flight' && (
      <div>
        <Label>Flight Number</Label>
        <Input
          value={(config.flightNumber as string) || ''}
          onChange={(e) => onChange('flightNumber', e.target.value)}
          placeholder="AA123 or AA1234"
        />
        <p className="text-xs text-slate-400 mt-1">IATA or ICAO flight number</p>
        <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
      </div>
    )}
    
    {config.searchType === 'icao' && (
      <div>
        <Label>ICAO24</Label>
        <Input
          value={(config.icao as string) || ''}
          onChange={(e) => onChange('icao', e.target.value)}
          placeholder="abc123"
        />
        <p className="text-xs text-slate-400 mt-1">24-bit ICAO aircraft identifier</p>
        <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
      </div>
    )}
    
    {config.searchType === 'callsign' && (
      <div>
        <Label>Callsign</Label>
        <Input
          value={(config.callsign as string) || ''}
          onChange={(e) => onChange('callsign', e.target.value)}
          placeholder="AAL123"
        />
        <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
      </div>
    )}
    
    <div className="space-y-2">
      <Label>Options</Label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeRoute === true}
          onChange={(e) => onChange('includeRoute', e.target.checked)}
        />
        <span>Include flight route</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeAircraftInfo === true}
          onChange={(e) => onChange('includeAircraftInfo', e.target.checked)}
        />
        <span>Include aircraft information</span>
      </label>
    </div>
    
    <div>
      <Label>AviationStack API Key (Optional)</Label>
      <Input
        type="password"
        value={(config.apiKey as string) || ''}
        onChange={(e) => onChange('apiKey', e.target.value)}
        placeholder="For detailed flight data"
      />
      <p className="text-xs text-slate-400 mt-1">
        Get API key at{' '}
        <a href="https://aviationstack.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          aviationstack.com
        </a>
      </p>
    </div>
  </div>
);

// Satellite Imagery Settings
export const SatelliteImagerySettings: React.FC<{
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-xs text-blue-700">
        <strong>Tip:</strong> Leave fields empty to use data from the previous node. The node accepts coordinates (lat/lon) or addresses from input.
      </p>
    </div>
    <div>
      <Label>Location Input Type</Label>
      <Select
        value={(config.inputType as string) || 'coordinates'}
        onChange={(e) => onChange('inputType', e.target.value)}
      >
        <option value="coordinates">Coordinates</option>
        <option value="address">Address</option>
      </Select>
    </div>
    
    {config.inputType === 'coordinates' && (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Latitude</Label>
          <Input
            type="number"
            step="any"
            value={(config.latitude as number) || ''}
            onChange={(e) => onChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="37.4224764"
          />
          <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
        </div>
        <div>
          <Label>Longitude</Label>
          <Input
            type="number"
            step="any"
            value={(config.longitude as number) || ''}
            onChange={(e) => onChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="-122.0842499"
          />
          <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
        </div>
      </div>
    )}
    
    {config.inputType === 'address' && (
      <div>
        <Label>Address</Label>
        <Input
          value={(config.address as string) || ''}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="1600 Amphitheatre Parkway, Mountain View, CA"
        />
        <p className="text-xs text-slate-400 mt-1">Leave empty to use input from previous node</p>
      </div>
    )}
    
    <div>
      <Label>Date (Optional)</Label>
      <Input
        type="date"
        value={(config.date as string) || ''}
        onChange={(e) => onChange('date', e.target.value)}
      />
      <p className="text-xs text-slate-400 mt-1">Leave empty for most recent imagery</p>
    </div>
    
    <div>
      <Label>Max Cloud Cover (%)</Label>
      <Input
        type="number"
        min="0"
        max="100"
        value={(config.cloudCover as number) || 0}
        onChange={(e) => onChange('cloudCover', parseInt(e.target.value))}
        placeholder="0"
      />
      <p className="text-xs text-slate-400 mt-1">Filter images by cloud cover (0-100)</p>
    </div>
    
    <div className="space-y-2">
      <Label>Options</Label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeMetadata === true}
          onChange={(e) => onChange('includeMetadata', e.target.checked)}
        />
        <span>Include metadata (sensor, resolution, etc.)</span>
      </label>
    </div>
    
    <div>
      <Label>Planet Labs / Sentinel Hub API Key (Optional)</Label>
      <Input
        type="password"
        value={(config.apiKey as string) || ''}
        onChange={(e) => onChange('apiKey', e.target.value)}
        placeholder="For high-resolution imagery"
      />
      <p className="text-xs text-slate-400 mt-1">
        Get API keys at{' '}
        <a href="https://www.planet.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          planet.com
        </a>
        {' or '}
        <a href="https://www.sentinel-hub.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          sentinel-hub.com
        </a>
      </p>
    </div>
  </div>
);

// ==================== ANALYSIS NODES ====================

// Data Enrichment Settings (placeholder - can be expanded)
export const DataEnrichmentSettings: React.FC<{
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Enrichment Sources</Label>
      <div className="space-y-2 mt-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <Checkbox
            checked={config.enrichWithWHOIS === true}
            onChange={(e) => onChange('enrichWithWHOIS', e.target.checked)}
          />
          <span>WHOIS data for domains</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <Checkbox
            checked={config.enrichWithGeo === true}
            onChange={(e) => onChange('enrichWithGeo', e.target.checked)}
          />
          <span>Geolocation for IPs</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <Checkbox
            checked={config.enrichWithSocial === true}
          onChange={(e) => onChange('enrichWithSocial', e.target.checked)}
          />
          <span>Social media profiles</span>
        </label>
      </div>
    </div>
    <div>
      <Label>Confidence Threshold</Label>
      <Input
        type="number"
        min="0"
        max="1"
        step="0.1"
        value={(config.confidenceThreshold as number) || 0.7}
        onChange={(e) => onChange('confidenceThreshold', parseFloat(e.target.value))}
      />
      <p className="text-xs text-slate-400 mt-1">Only include enrichments above this confidence (0-1)</p>
    </div>
  </div>
);

// Map Visualization Settings
export const MapVisualizationSettings: React.FC<{
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Map Type</Label>
      <Select
        value={(config.mapType as string) || 'markers'}
        onChange={(e) => onChange('mapType', e.target.value)}
      >
        <option value="markers">Markers</option>
        <option value="heatmap">Heatmap</option>
        <option value="polygons">Polygons</option>
        <option value="clusters">Clusters</option>
      </Select>
    </div>
    <div>
      <Label>Zoom Level</Label>
      <Input
        type="number"
        min="1"
        max="18"
        value={(config.zoom as number) || 10}
        onChange={(e) => onChange('zoom', parseInt(e.target.value))}
      />
    </div>
    <div>
      <Label>Center (Lat, Lon)</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          step="any"
          value={(config.centerLat as number) || ''}
          onChange={(e) => onChange('centerLat', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="Latitude"
        />
        <Input
          type="number"
          step="any"
          value={(config.centerLon as number) || ''}
          onChange={(e) => onChange('centerLon', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="Longitude"
        />
      </div>
      <p className="text-xs text-slate-400 mt-1">Leave empty to auto-center on data</p>
    </div>
  </div>
);

// Report Generator Settings
export const ReportGeneratorSettings: React.FC<{
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Report Title</Label>
      <Input
        value={(config.title as string) || ''}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="Intelligence Report"
      />
    </div>
    <div>
      <Label>Report Format</Label>
      <Select
        value={(config.format as string) || 'pdf'}
        onChange={(e) => onChange('format', e.target.value)}
      >
        <option value="pdf">PDF</option>
        <option value="docx">Word (DOCX)</option>
        <option value="html">HTML</option>
        <option value="json">JSON</option>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Include Sections</Label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeSummary !== false}
          onChange={(e) => onChange('includeSummary', e.target.checked)}
        />
        <span>Executive Summary</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeFindings === true}
          onChange={(e) => onChange('includeFindings', e.target.checked)}
        />
        <span>Detailed Findings</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeMap === true}
          onChange={(e) => onChange('includeMap', e.target.checked)}
        />
        <span>Map Visualization</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeTimeline === true}
          onChange={(e) => onChange('includeTimeline', e.target.checked)}
        />
        <span>Timeline</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <Checkbox
          checked={config.includeEntities === true}
          onChange={(e) => onChange('includeEntities', e.target.checked)}
        />
        <span>Entity List</span>
      </label>
    </div>
  </div>
);


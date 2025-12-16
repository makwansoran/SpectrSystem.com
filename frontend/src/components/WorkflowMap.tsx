/**
 * Workflow Map Component
 * Highly customizable map component for visualizing geographic data in workflows
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, ZoomIn, ZoomOut, Maximize2, Minimize2, Settings, MapPin } from 'lucide-react';

// Fix for default marker icons in React/Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapMarker {
  id: string;
  position: [number, number]; // [lat, lng]
  label?: string;
  description?: string;
  color?: string;
  icon?: string;
  data?: any;
}

export interface MapCircle {
  id: string;
  center: [number, number];
  radius: number; // in meters
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  data?: any;
}

export interface MapPolyline {
  id: string;
  positions: [number, number][];
  color?: string;
  weight?: number;
  data?: any;
}

export interface WorkflowMapConfig {
  // Map settings
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  scrollWheelZoom?: boolean;
  doubleClickZoom?: boolean;
  dragging?: boolean;
  touchZoom?: boolean;
  boxZoom?: boolean;
  keyboard?: boolean;
  
  // Tile layer
  tileProvider?: 'osm' | 'carto' | 'esri' | 'stamen' | 'custom';
  customTileUrl?: string;
  attribution?: string;
  
  // Visual elements
  markers?: MapMarker[];
  circles?: MapCircle[];
  polylines?: MapPolyline[];
  
  // UI controls
  showZoomControls?: boolean;
  showLayerControl?: boolean;
  showFullscreen?: boolean;
  showSettings?: boolean;
  height?: string | number;
  className?: string;
  
  // Callbacks
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onZoomChange?: (zoom: number) => void;
  onCenterChange?: (center: [number, number]) => void;
}

// Component to handle map events
const MapEventHandler: React.FC<{
  onMapClick?: (lat: number, lng: number) => void;
  onZoomChange?: (zoom: number) => void;
  onCenterChange?: (center: [number, number]) => void;
}> = ({ onMapClick, onZoomChange, onCenterChange }) => {
  const map = useMap();
  
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
    zoomend: () => {
      if (onZoomChange) {
        onZoomChange(map.getZoom());
      }
    },
    moveend: () => {
      if (onCenterChange) {
        const center = map.getCenter();
        onCenterChange([center.lat, center.lng]);
      }
    },
  });
  
  return null;
};

// Custom controls component
const MapControls: React.FC<{
  map: L.Map;
  showZoom?: boolean;
  showFullscreen?: boolean;
  showSettings?: boolean;
  onSettingsClick?: () => void;
}> = ({ map, showZoom = true, showFullscreen = true, showSettings = true, onSettingsClick }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handleZoomIn = () => {
    map.zoomIn();
  };
  
  const handleZoomOut = () => {
    map.zoomOut();
  };
  
  const handleFullscreen = () => {
    const container = map.getContainer().parentElement;
    if (!container) return;
    
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      {showZoom && (
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-50 transition-colors border-b border-slate-200"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-50 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      )}
      
      {showFullscreen && (
        <button
          onClick={handleFullscreen}
          className="p-2 bg-white rounded-lg shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-slate-700" />
          ) : (
            <Maximize2 className="w-4 h-4 text-slate-700" />
          )}
        </button>
      )}
      
      {showSettings && onSettingsClick && (
        <button
          onClick={onSettingsClick}
          className="p-2 bg-white rounded-lg shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          title="Map settings"
        >
          <Settings className="w-4 h-4 text-slate-700" />
        </button>
      )}
    </div>
  );
};

// Component to capture map instance
const MapInstanceCapture: React.FC<{
  onMapReady: (map: L.Map) => void;
}> = ({ onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  
  return null;
};

// Map component with controls
const MapWithControls: React.FC<{
  config: WorkflowMapConfig;
  onSettingsClick?: () => void;
}> = ({ config, onSettingsClick }) => {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  
  const getTileLayer = () => {
    switch (config.tileProvider) {
      case 'carto':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        };
      case 'esri':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
        };
      case 'stamen':
        return {
          url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png',
          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };
      case 'custom':
        return {
          url: config.customTileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: config.attribution || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };
      default: // 'osm'
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };
    }
  };
  
  const tileLayer = getTileLayer();
  
  const createCustomIcon = (marker: MapMarker) => {
    if (marker.color) {
      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${marker.color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
    }
    return DefaultIcon;
  };
  
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={config.center || [51.505, -0.09]}
        zoom={config.zoom || 13}
        minZoom={config.minZoom || 2}
        maxZoom={config.maxZoom || 18}
        scrollWheelZoom={config.scrollWheelZoom !== false}
        doubleClickZoom={config.doubleClickZoom !== false}
        dragging={config.dragging !== false}
        touchZoom={config.touchZoom !== false}
        boxZoom={config.boxZoom !== false}
        keyboard={config.keyboard !== false}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <MapInstanceCapture onMapReady={setMapInstance} />
        
        <TileLayer
          url={tileLayer.url}
          attribution={tileLayer.attribution}
        />
        
        <MapEventHandler
          onMapClick={config.onMapClick}
          onZoomChange={config.onZoomChange}
          onCenterChange={config.onCenterChange}
        />
        
        {/* Markers */}
        {config.markers?.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={createCustomIcon(marker)}
            eventHandlers={{
              click: () => {
                if (config.onMarkerClick) {
                  config.onMarkerClick(marker);
                }
              },
            }}
          >
            {(marker.label || marker.description) && (
              <Popup>
                <div className="p-2">
                  {marker.label && <h3 className="font-semibold text-sm mb-1">{marker.label}</h3>}
                  {marker.description && <p className="text-xs text-slate-600">{marker.description}</p>}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
        
        {/* Circles */}
        {config.circles?.map((circle) => (
          <Circle
            key={circle.id}
            center={circle.center}
            radius={circle.radius}
            pathOptions={{
              color: circle.color || '#3388ff',
              fillColor: circle.fillColor || circle.color || '#3388ff',
              fillOpacity: circle.fillOpacity || 0.2,
            }}
          />
        ))}
        
        {/* Polylines */}
        {config.polylines?.map((polyline) => (
          <Polyline
            key={polyline.id}
            positions={polyline.positions}
            pathOptions={{
              color: polyline.color || '#3388ff',
              weight: polyline.weight || 3,
            }}
          />
        ))}
      </MapContainer>
      
      {mapInstance && (
        <MapControls
          map={mapInstance}
          showZoom={config.showZoomControls !== false}
          showFullscreen={config.showFullscreen !== false}
          showSettings={config.showSettings !== false}
          onSettingsClick={onSettingsClick}
        />
      )}
    </div>
  );
};

// Main WorkflowMap component
export const WorkflowMapComponent: React.FC<{
  config?: WorkflowMapConfig;
  className?: string;
}> = ({ config = {}, className = '' }) => {
  const [showSettings, setShowSettings] = useState(false);
  
  const defaultConfig: WorkflowMapConfig = {
    center: [51.505, -0.09],
    zoom: 13,
    tileProvider: 'osm',
    showZoomControls: true,
    showFullscreen: true,
    showSettings: true,
    height: '600px',
    ...config,
  };
  
  const height = defaultConfig.height || '600px';
  
  return (
    <div className={`relative bg-slate-100 rounded-lg overflow-hidden border border-slate-200 ${className}`} style={{ height: typeof height === 'number' ? `${height}px` : height }}>
      <MapWithControls
        config={defaultConfig}
        onSettingsClick={() => setShowSettings(true)}
      />
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/50 z-[2000] flex items-center justify-center" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Map Settings</h3>
            <p className="text-sm text-slate-600 mb-4">Map customization options will be available here.</p>
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowMapComponent;


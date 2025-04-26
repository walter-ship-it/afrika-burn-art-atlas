
import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';

export interface MapState {
  lat: number;
  lng: number;
  zoom: number;
}

// Define zones as a constant to maintain a single source of truth
const ZONES = [
  { coords: [724, 1034], radius: 200 },
  { coords: [800, 1000], radius: 150 },
];

export const useMapState = () => {
  const [mapError, setMapError] = useState<string | null>(null);
  const zoneLayerRef = useRef<L.LayerGroup | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const lastToggleTimeRef = useRef<number>(0);
  const zoneLayerIdRef = useRef<string>(`zone-layer-${Date.now()}`);

  const loadSavedMapState = (): MapState => {
    try {
      const savedState = localStorage.getItem('map-state');
      if (savedState) {
        return JSON.parse(savedState) as MapState;
      }
    } catch (e) {
      console.error('Failed to parse saved map state:', e);
    }
    
    return {
      lat: 724,
      lng: 1034,
      zoom: -2
    };
  };

  const saveMapState = (state: MapState) => {
    localStorage.setItem('map-state', JSON.stringify(state));
  };

  const createZoneLayer = (map: L.Map) => {
    console.log('[DEBUG] Creating zone layer with ID:', zoneLayerIdRef.current);
    
    // Store the map reference
    mapRef.current = map;
    
    // Clean up existing layer if it exists
    if (zoneLayerRef.current) {
      console.log('[DEBUG] Removing existing zone layer before creating new one');
      if (mapRef.current.hasLayer(zoneLayerRef.current)) {
        mapRef.current.removeLayer(zoneLayerRef.current);
      }
      zoneLayerRef.current.clearLayers();
      zoneLayerRef.current = null;
    }
    
    // Create new layer group
    zoneLayerRef.current = L.layerGroup([], { id: zoneLayerIdRef.current });
    
    // Add zone circles
    ZONES.forEach((zone, index) => {
      console.log(`[DEBUG] Adding zone circle ${index + 1}:`, zone);
      L.circle(zone.coords, {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.2,
        radius: zone.radius
      }).addTo(zoneLayerRef.current!);
    });

    console.log('[DEBUG] Zone layer created and circles added');
    
    // Return the layer but don't add it to the map yet
    return zoneLayerRef.current;
  };

  const toggleZoneVisibility = (show: boolean) => {
    const now = Date.now();
    // Prevent rapid toggles (debounce)
    if (now - lastToggleTimeRef.current < 300) {
      console.log('[DEBUG] Skipping toggle - too soon since last toggle');
      return;
    }
    lastToggleTimeRef.current = now;
    
    console.log(`[DEBUG] Toggling zone visibility: ${show} at ${now}`);
    
    if (!zoneLayerRef.current || !mapRef.current) {
      console.warn('[DEBUG] Zone layer or map reference is null');
      return;
    }
    
    const isLayerCurrentlyOnMap = mapRef.current.hasLayer(zoneLayerRef.current);
    
    console.log(`[DEBUG] Is zone layer currently on map: ${isLayerCurrentlyOnMap}`);
    
    // Check for duplicate layers with similar properties (a common Leaflet issue)
    let duplicateLayersFound = 0;
    mapRef.current.eachLayer((layer) => {
      if (layer !== zoneLayerRef.current && layer instanceof L.LayerGroup) {
        duplicateLayersFound++;
        console.log('[DEBUG] Found potential duplicate layer:', layer);
        mapRef.current!.removeLayer(layer);
      }
    });
    
    if (duplicateLayersFound > 0) {
      console.warn(`[DEBUG] Removed ${duplicateLayersFound} duplicate layer groups`);
    }
    
    if (show) {
      if (!isLayerCurrentlyOnMap && zoneLayerRef.current) {
        console.log('[DEBUG] Adding zone layer to map');
        mapRef.current.addLayer(zoneLayerRef.current);
      }
    } else {
      if (isLayerCurrentlyOnMap && zoneLayerRef.current) {
        console.log('[DEBUG] Removing zone layer from map');
        mapRef.current.removeLayer(zoneLayerRef.current);
      }
    }
  };

  const cleanupZoneLayer = () => {
    console.log('[DEBUG] Cleaning up zone layer');
    if (zoneLayerRef.current && mapRef.current) {
      if (mapRef.current.hasLayer(zoneLayerRef.current)) {
        console.log('[DEBUG] Removing zone layer during cleanup');
        mapRef.current.removeLayer(zoneLayerRef.current);
      }
      zoneLayerRef.current.clearLayers();
      zoneLayerRef.current = null;
    }
    mapRef.current = null;
  };

  return {
    mapError,
    setMapError,
    loadSavedMapState,
    saveMapState,
    createZoneLayer,
    toggleZoneVisibility,
    cleanupZoneLayer
  };
};

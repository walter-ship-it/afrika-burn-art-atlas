import { useState, useRef } from 'react';
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
  const hasActiveLayers = useRef<boolean>(false);

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
    
    mapRef.current = map;
    
    // Clean up existing layer if it exists
    if (zoneLayerRef.current) {
      console.log('[DEBUG] Removing existing zone layer');
      cleanupZoneLayer();
    }
    
    if (hasActiveLayers.current) {
      console.log('[DEBUG] Active layers detected, skipping creation');
      return null;
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

    hasActiveLayers.current = true;
    console.log('[DEBUG] Zone layer created with active layers:', hasActiveLayers.current);
    
    return zoneLayerRef.current;
  };

  const toggleZoneVisibility = (show: boolean) => {
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 300) {
      console.log('[DEBUG] Debouncing toggle');
      return;
    }
    lastToggleTimeRef.current = now;
    
    console.log(`[DEBUG] Toggling zone visibility: ${show}, Has active layers:`, hasActiveLayers.current);
    
    if (!zoneLayerRef.current || !mapRef.current) {
      console.warn('[DEBUG] Zone layer or map reference is null');
      return;
    }
    
    const isLayerCurrentlyOnMap = mapRef.current.hasLayer(zoneLayerRef.current);
    console.log(`[DEBUG] Layer currently on map: ${isLayerCurrentlyOnMap}`);
    
    if (show && !isLayerCurrentlyOnMap) {
      console.log('[DEBUG] Adding zone layer to map');
      mapRef.current.addLayer(zoneLayerRef.current);
    } else if (!show && isLayerCurrentlyOnMap) {
      console.log('[DEBUG] Removing zone layer from map');
      mapRef.current.removeLayer(zoneLayerRef.current);
    }
  };

  const cleanupZoneLayer = () => {
    console.log('[DEBUG] Cleaning up zone layer');
    if (zoneLayerRef.current && mapRef.current) {
      if (mapRef.current.hasLayer(zoneLayerRef.current)) {
        console.log('[DEBUG] Removing zone layer from map');
        mapRef.current.removeLayer(zoneLayerRef.current);
      }
      zoneLayerRef.current.clearLayers();
      zoneLayerRef.current = null;
    }
    hasActiveLayers.current = false;
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

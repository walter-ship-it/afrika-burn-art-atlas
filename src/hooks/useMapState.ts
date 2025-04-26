
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
    // Clean up existing layer if it exists
    if (zoneLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(zoneLayerRef.current);
      zoneLayerRef.current.clearLayers();
    }

    // Store the map reference
    mapRef.current = map;
    
    // Create new layer group
    zoneLayerRef.current = L.layerGroup();
    
    // Add zone circles
    ZONES.forEach(zone => {
      L.circle(zone.coords, {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.2,
        radius: zone.radius
      }).addTo(zoneLayerRef.current!);
    });

    return zoneLayerRef.current;
  };

  const toggleZoneVisibility = (show: boolean) => {
    if (!zoneLayerRef.current || !mapRef.current) return;
    
    if (show) {
      if (!mapRef.current.hasLayer(zoneLayerRef.current)) {
        mapRef.current.addLayer(zoneLayerRef.current);
      }
    } else {
      if (mapRef.current.hasLayer(zoneLayerRef.current)) {
        mapRef.current.removeLayer(zoneLayerRef.current);
      }
    }
  };

  const cleanupZoneLayer = () => {
    if (zoneLayerRef.current && mapRef.current) {
      if (mapRef.current.hasLayer(zoneLayerRef.current)) {
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


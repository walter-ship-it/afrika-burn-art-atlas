
import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';

export interface MapState {
  lat: number;
  lng: number;
  zoom: number;
}

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
    // Store the map reference
    mapRef.current = map;
    
    // Create the layer group if it doesn't exist
    if (!zoneLayerRef.current) {
      zoneLayerRef.current = L.layerGroup();
    }
    
    return zoneLayerRef.current;
  };

  const toggleZoneVisibility = (show: boolean) => {
    if (!zoneLayerRef.current || !mapRef.current) return;
    
    if (show) {
      // Only add if it's not already on the map
      if (!mapRef.current.hasLayer(zoneLayerRef.current)) {
        mapRef.current.addLayer(zoneLayerRef.current);
      }
    } else {
      // Only remove if it's currently on the map
      if (mapRef.current.hasLayer(zoneLayerRef.current)) {
        mapRef.current.removeLayer(zoneLayerRef.current);
      }
    }
  };

  // Clean up function to be used when component unmounts
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

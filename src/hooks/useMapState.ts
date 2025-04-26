import { useState, useRef } from 'react';
import L from 'leaflet';

export interface MapState {
  lat: number;
  lng: number;
  zoom: number;
}

export const useMapState = () => {
  const [mapError, setMapError] = useState<string | null>(null);
  const zoneLayerRef = useRef<L.LayerGroup | null>(null);

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

  const createZoneLayer = () => {
    const layer = L.layerGroup();
    zoneLayerRef.current = layer;
    return layer;
  };

  const toggleZoneVisibility = (show: boolean) => {
    if (!zoneLayerRef.current) return;
    
    const map = zoneLayerRef.current.getMap();
    if (!map) return;

    if (show) {
      map.addLayer(zoneLayerRef.current);
    } else {
      map.removeLayer(zoneLayerRef.current);
    }
  };

  return {
    mapError,
    setMapError,
    loadSavedMapState,
    saveMapState,
    createZoneLayer,
    toggleZoneVisibility
  };
};


import { useState } from 'react';

export interface MapState {
  lat: number;
  lng: number;
  zoom: number;
}

export const useMapState = () => {
  const [mapError, setMapError] = useState<string | null>(null);

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

  return {
    mapError,
    setMapError,
    loadSavedMapState,
    saveMapState
  };
};

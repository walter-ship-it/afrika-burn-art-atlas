
import { RefObject } from 'react';
import L from 'leaflet';
import { MapState } from './useMapState';

export const useMapInteractions = (
  leafletMap: RefObject<L.Map | null>,
  saveMapState: (state: MapState) => void
) => {
  const setupMapInteractions = () => {
    if (!leafletMap.current) return;

    leafletMap.current.on('moveend', () => {
      if (!leafletMap.current) return;
      
      const center = leafletMap.current.getCenter();
      const zoom = leafletMap.current.getZoom();
      
      saveMapState({
        lat: center.lat,
        lng: center.lng,
        zoom: zoom,
      });
    });
  };

  return { setupMapInteractions };
};

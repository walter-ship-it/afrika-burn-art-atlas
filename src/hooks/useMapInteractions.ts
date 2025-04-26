
import { RefObject } from 'react';
import L from 'leaflet';
import { MapState } from './useMapState';

export const useMapInteractions = (
  leafletMap: RefObject<L.Map | null>,
  saveMapState: (state: MapState) => void
) => {
  const setupMapInteractions = () => {
    if (!leafletMap.current) {
      console.log('[MapInteractions] Map reference not available');
      return;
    }

    console.log('[MapInteractions] Setting up map interaction handlers');

    leafletMap.current.on('moveend', () => {
      if (!leafletMap.current) {
        console.log('[MapInteractions] Map reference lost during moveend');
        return;
      }
      
      const center = leafletMap.current.getCenter();
      const zoom = leafletMap.current.getZoom();
      
      console.log('[MapInteractions] Saving map state:', { lat: center.lat, lng: center.lng, zoom });
      
      saveMapState({
        lat: center.lat,
        lng: center.lng,
        zoom: zoom,
      });
    });

    console.log('[MapInteractions] Map interaction handlers set up successfully');
  };

  return { setupMapInteractions };
};

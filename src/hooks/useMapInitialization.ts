import { useEffect, useCallback } from 'react';
import L from 'leaflet';
import { MapState } from './useMapState';

export const useMapInitialization = (
  mapRef: React.RefObject<HTMLDivElement>,
  leafletMap: React.MutableRefObject<L.Map | null>,
  setMapError: (error: string | null) => void,
  initialState: MapState
) => {
  const tryFallbackImage = useCallback((map: L.Map) => {
    const fallbackImagePath = '/lovable-uploads/88cf2c86-ed43-4d55-a4d0-4cf74740daea.png';
    const bounds = [[0, 0], [1448, 2068]];
    
    console.log('Trying fallback image:', fallbackImagePath);
    const fallbackImg = new Image();
    
    fallbackImg.onload = () => {
      if (!map) return;
      console.log('Fallback image loaded successfully!');
      setMapError(null);
      L.imageOverlay(fallbackImagePath, bounds).addTo(map);
    };
    
    fallbackImg.onerror = () => {
      console.error('Failed to load fallback image!');
      setMapError('Map image not found - please ensure the image is available');
    };
    
    fallbackImg.src = fallbackImagePath;
  }, [setMapError]);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) {
      console.log('[DEBUG] Map already initialized or ref not ready');
      return;
    }
    
    console.log('[DEBUG] Initializing map...');
    
    try {
      const map = L.map(mapRef.current, {
        crs: L.CRS.Simple,
        preferCanvas: true,
        fadeAnimation: false,
        minZoom: -4,
        maxZoom: 2,
        inertia: true,
        zoomControl: true,
      });
      
      map.eachLayer((layer) => {
        console.log('[DEBUG] Removing existing layer:', layer);
        map.removeLayer(layer);
      });
      
      leafletMap.current = map;
      const bounds = [[0, 0], [1448, 2068]];
      const primaryImagePath = '/img/map.png';
      
      console.log('[DEBUG] Loading primary image');
      const testImg = new Image();
      
      testImg.onload = () => {
        if (!map) return;
        console.log('[DEBUG] Primary image loaded');
        L.imageOverlay(primaryImagePath, bounds).addTo(map);
      };
      
      testImg.onerror = () => {
        console.error('[DEBUG] Primary image load failed');
        tryFallbackImage(map);
      };
      
      testImg.src = primaryImagePath;
      
      map.setView([initialState.lat, initialState.lng], initialState.zoom);
      map.fitBounds(bounds);
      
      return () => {
        console.log('[DEBUG] Cleaning up map initialization');
        if (map && map.remove) {
          map.eachLayer(layer => {
            console.log('[DEBUG] Removing layer during cleanup:', layer);
            map.removeLayer(layer);
          });
          map.remove();
          leafletMap.current = null;
        }
      };
    } catch (e) {
      console.error('[DEBUG] Map initialization error:', e);
      setMapError('Failed to initialize map');
    }
  }, [mapRef, initialState, tryFallbackImage]);
};


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
    // Skip if map container is no longer in DOM
    if (!map._container || !document.body.contains(map._container)) {
      console.log('[Debug] Map container no longer in DOM, skipping fallback');
      return;
    }
    
    const fallbackImagePath = '/lovable-uploads/88cf2c86-ed43-4d55-a4d0-4cf74740daea.png';
    const bounds = [[0, 0], [1448, 2068]];
    
    console.log('[Debug] Trying fallback image:', fallbackImagePath);
    const fallbackImg = new Image();
    
    fallbackImg.onload = () => {
      // Double check map is still available before adding layer
      if (!map || !map._container || !document.body.contains(map._container)) {
        console.log('[Debug] Map no longer available, skipping fallback image overlay');
        return;
      }
      
      console.log('[Debug] Fallback image loaded successfully!');
      setMapError(null);
      L.imageOverlay(fallbackImagePath, bounds).addTo(map);
    };
    
    fallbackImg.onerror = () => {
      console.error('[Debug] Failed to load fallback image!');
      setMapError('Map image not found - please ensure the image is available');
    };
    
    fallbackImg.src = fallbackImagePath;
  }, [setMapError]);

  useEffect(() => {
    // Initialization guard - only run once
    const initializationId = Date.now();
    console.log(`[Debug] Map initialization attempt ${initializationId}`);
    
    // Guard against multiple initializations or missing ref
    if (!mapRef.current) {
      console.log('[Debug] Map ref not ready, skipping initialization');
      return;
    }
    
    if (leafletMap.current) {
      console.log('[Debug] Map already initialized, skipping duplicate initialization');
      return;
    }
    
    // Ensure DOM is ready before initializing map
    if (!document.body.contains(mapRef.current)) {
      console.log('[Debug] DOM element not in document yet, skipping initialization');
      return;
    }
    
    console.log(`[Debug] Initializing map with element ${mapRef.current.id || 'unnamed'}...`);
    
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
      
      // Store reference immediately to avoid race conditions
      leafletMap.current = map;
      
      console.log('[Debug] Map created successfully, now setting up layers');
      
      // Proper safety check before manipulating layers
      if (map._container && document.body.contains(map._container)) {
        map.eachLayer((layer) => {
          console.log('[Debug] Removing existing layer:', layer);
          map.removeLayer(layer);
        });
        
        const bounds = [[0, 0], [1448, 2068]];
        const primaryImagePath = '/img/map.png';
        
        console.log('[Debug] Loading primary image');
        const testImg = new Image();
        
        testImg.onload = () => {
          // Double-check map is still valid when image loads
          if (!map || !map._container || !document.body.contains(map._container)) {
            console.log('[Debug] Map container no longer available, skipping primary image');
            return;
          }
          
          console.log('[Debug] Primary image loaded');
          L.imageOverlay(primaryImagePath, bounds).addTo(map);
        };
        
        testImg.onerror = () => {
          console.error('[Debug] Primary image load failed');
          // Double-check map is still valid before trying fallback
          if (map && map._container && document.body.contains(map._container)) {
            tryFallbackImage(map);
          }
        };
        
        testImg.src = primaryImagePath;
        
        // Set initial view and bounds after ensuring map is valid
        if (map._container && document.body.contains(map._container)) {
          map.setView([initialState.lat, initialState.lng], initialState.zoom);
          map.fitBounds(bounds);
        }
      }
      
      return () => {
        console.log(`[Debug] Cleanup for map initialization ${initializationId}`);
        if (!map) return;
        
        // Only perform cleanup if container still exists in DOM
        if (map._container && document.body.contains(map._container)) {
          map.eachLayer(layer => {
            console.log('[Debug] Removing layer during cleanup');
            map.removeLayer(layer);
          });
          
          // Careful removal of map only if it's still attached
          map.remove();
          console.log('[Debug] Map removed successfully');
        } else {
          console.log('[Debug] Map container already detached, skipping cleanup');
        }
      };
    } catch (e) {
      console.error('[Debug] Map initialization error:', e);
      setMapError('Failed to initialize map');
    }
  }, [mapRef, initialState, tryFallbackImage, setMapError]);
};

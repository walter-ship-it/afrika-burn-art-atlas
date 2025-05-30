
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
    if (!map || !map._container || !document.body.contains(map._container)) {
      console.log('[Debug] Map container no longer in DOM, skipping fallback');
      return;
    }
    
    const fallbackImagePath = '/lovable-uploads/88cf2c86-ed43-4d55-a4d0-4cf74740daea.png';
    const bounds = [[0, 0], [1448, 2068]];
    
    console.log('[Debug] Trying fallback image:', fallbackImagePath);
    const fallbackImg = new Image();
    
    fallbackImg.onload = () => {
      if (!map || !map._container || !document.body.contains(map._container)) {
        console.log('[Debug] Map no longer available, skipping fallback image overlay');
        return;
      }
      
      try {
        console.log('[Debug] Fallback image loaded successfully!');
        setMapError(null);
        if (map && map.getContainer() && document.body.contains(map.getContainer())) {
          L.imageOverlay(fallbackImagePath, bounds).addTo(map);
        }
      } catch (e) {
        console.error('[Debug] Error adding fallback image overlay:', e);
      }
    };
    
    fallbackImg.onerror = () => {
      console.error('[Debug] Failed to load fallback image!');
      setMapError('Map image not found - please ensure the image is available');
    };
    
    fallbackImg.src = fallbackImagePath;
  }, [setMapError]);

  useEffect(() => {
    const initializationId = Date.now();
    console.log(`[Debug] Map initialization attempt ${initializationId}`);
    
    if (!mapRef.current) {
      console.log('[Debug] Map ref not ready, skipping initialization');
      return;
    }
    
    if (leafletMap.current) {
      console.log('[Debug] Map already initialized, skipping duplicate initialization');
      return;
    }
    
    if (!document.body.contains(mapRef.current)) {
      console.log('[Debug] DOM element not in document yet, skipping initialization');
      return;
    }
    
    console.log(`[Debug] Initializing map with element ${mapRef.current.id || 'unnamed'}...`);
    
    try {
      let map: L.Map | null = null;
      
      try {
        map = L.map(mapRef.current, {
          crs: L.CRS.Simple,
          preferCanvas: true,
          fadeAnimation: false,
          minZoom: -4,
          maxZoom: 2,
          inertia: true,
          zoomControl: true,
        });
      } catch (mapError) {
        console.error('[Debug] Error creating map instance:', mapError);
        setMapError('Failed to create map instance');
        return;
      }
      
      leafletMap.current = map;
      
      console.log('[Debug] Map created successfully, now setting up layers');
      
      if (map && map._container && document.body.contains(map._container)) {
        map.eachLayer((layer) => {
          console.log('[Debug] Removing existing layer:', layer);
          map.removeLayer(layer);
        });
        
        const bounds = [[0, 0], [1448, 2068]];
        const primaryImagePath = '/img/map.png';
        
        console.log('[Debug] Loading primary image from:', primaryImagePath);
        const testImg = new Image();
        
        testImg.onload = () => {
          console.log('[Debug] Primary image successfully loaded');
          if (!map || !map._container || !document.body.contains(map._container)) {
            console.log('[Debug] Map container no longer available, skipping primary image');
            return;
          }
          
          try {
            if (map && map.getContainer() && document.body.contains(map.getContainer())) {
              L.imageOverlay(primaryImagePath, bounds).addTo(map);
              setMapError(null);
              console.log('[Debug] Primary image overlay added successfully');
            }
          } catch (overlayError) {
            console.error('[Debug] Error adding primary image overlay:', overlayError);
            if (map && map._container && document.body.contains(map._container)) {
              tryFallbackImage(map);
            }
          }
        };
        
        testImg.onerror = (error) => {
          console.error('[Debug] Primary image load failed:', error);
          console.log('[Debug] Image attempted path:', primaryImagePath);
          if (map && map._container && document.body.contains(map._container)) {
            tryFallbackImage(map);
          }
        };
        
        testImg.src = primaryImagePath;
        
        if (map && map._container && document.body.contains(map._container)) {
          try {
            map.setView([initialState.lat, initialState.lng], initialState.zoom);
            map.fitBounds(bounds);
          } catch (viewError) {
            console.error('[Debug] Error setting initial view:', viewError);
          }
        }
      }
      
      return () => {
        console.log(`[Debug] Cleanup for map initialization ${initializationId}`);
        if (!map) return;
        
        try {
          if (map._container && document.body.contains(map._container)) {
            console.log('[Debug] Removing layers during cleanup');
            map.eachLayer(layer => {
              try {
                map.removeLayer(layer);
              } catch (e) {
                console.error('[Debug] Error removing layer during cleanup:', e);
              }
            });
            
            map.remove();
            console.log('[Debug] Map removed successfully');
          } else {
            console.log('[Debug] Map container already detached, skipping cleanup');
          }
        } catch (cleanupError) {
          console.error('[Debug] Error during map cleanup:', cleanupError);
        }
        
        leafletMap.current = null;
      };
    } catch (e) {
      console.error('[Debug] Map initialization error:', e);
      setMapError('Failed to initialize map');
    }
  }, [mapRef, initialState, tryFallbackImage, setMapError]);
};


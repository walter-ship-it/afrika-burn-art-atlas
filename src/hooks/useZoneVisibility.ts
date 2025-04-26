
import { useEffect, useRef } from 'react';
import L from 'leaflet';

export const useZoneVisibility = (
  leafletMap: React.RefObject<L.Map | null>,
  showOnlyFavorites: boolean,
  toggleZoneVisibility: (show: boolean) => void
) => {
  // Track initialized state to prevent double-toggling
  const initializedRef = useRef<boolean>(false);
  const lastToggleTime = useRef<number>(0);
  
  useEffect(() => {
    // Debounce rapid changes
    const now = Date.now();
    if (now - lastToggleTime.current < 300) {
      console.log('[Zones] Debouncing visibility toggle');
      return;
    }
    lastToggleTime.current = now;
    
    // Skip if map is not available
    if (!leafletMap.current) {
      console.log('[Zones] Map not available yet, skipping visibility toggle');
      return;
    }
    
    // Safely check if map container is still in DOM
    try {
      // Skip if map container is no longer in DOM
      if (!leafletMap.current._container || !document.body.contains(leafletMap.current._container)) {
        console.log('[Zones] Map container no longer available, skipping visibility toggle');
        return;
      }
      
      // Skip if map is being destroyed or has invalid panes
      if (!leafletMap.current._panes || !leafletMap.current._mapPane) {
        console.log('[Zones] Map panes not available, map may be in process of being removed');
        return;
      }

      // Only toggle once the map is ready
      if (!initializedRef.current) {
        initializedRef.current = true;
        console.log('[Zones] Initial visibility setup');
      }
      
      // Check if not already cleaned up
      console.log('[Zones] Toggling zone visibility based on favorites state:', showOnlyFavorites);
      
      // Catch any errors during toggle
      try {
        toggleZoneVisibility(showOnlyFavorites);
      } catch (e) {
        console.error('[Zones] Error during visibility toggle:', e);
      }
    } catch (e) {
      console.error('[Zones] Error checking map state:', e);
    }
  }, [showOnlyFavorites, toggleZoneVisibility, leafletMap]);
};

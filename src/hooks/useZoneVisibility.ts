
import { useEffect, useRef } from 'react';
import L from 'leaflet';

export const useZoneVisibility = (
  leafletMap: React.RefObject<L.Map | null>,
  showOnlyFavorites: boolean,
  toggleZoneVisibility: (show: boolean) => void
) => {
  // Track initialized state to prevent double-toggling
  const initializedRef = useRef<boolean>(false);

  useEffect(() => {
    // Skip if map is not available
    if (!leafletMap.current) {
      console.log('[Zones] Map not available yet, skipping visibility toggle');
      return;
    }
    
    // Skip if map container is no longer in DOM
    if (!leafletMap.current._container) {
      console.log('[Zones] Map container no longer available, skipping visibility toggle');
      return;
    }

    // Only toggle once the map is ready
    if (!initializedRef.current) {
      initializedRef.current = true;
      console.log('[Zones] Initial visibility setup');
    }
    
    console.log('[Zones] Toggling zone visibility based on favorites state:', showOnlyFavorites);
    toggleZoneVisibility(showOnlyFavorites);
  }, [showOnlyFavorites, toggleZoneVisibility, leafletMap]);
};


import { useEffect } from 'react';
import L from 'leaflet';

export const useZoneVisibility = (
  leafletMap: React.RefObject<L.Map | null>,
  showOnlyFavorites: boolean,
  toggleZoneVisibility: (show: boolean) => void
) => {
  useEffect(() => {
    if (!leafletMap.current) {
      console.log('[Zones] Map not available yet, skipping visibility toggle');
      return;
    }
    console.log('[Zones] Toggling zone visibility based on favorites state:', showOnlyFavorites);
    toggleZoneVisibility(showOnlyFavorites);
  }, [showOnlyFavorites, toggleZoneVisibility]);
};

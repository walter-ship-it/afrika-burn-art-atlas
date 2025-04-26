
import { useEffect } from 'react';
import L from 'leaflet';

export const useZoneVisibility = (
  leafletMap: React.RefObject<L.Map | null>,
  showOnlyFavorites: boolean,
  toggleZoneVisibility: (show: boolean) => void
) => {
  useEffect(() => {
    if (!leafletMap.current) return;
    console.log('[DEBUG] Handling favorites toggle:', showOnlyFavorites);
    toggleZoneVisibility(showOnlyFavorites);
  }, [showOnlyFavorites]);
};

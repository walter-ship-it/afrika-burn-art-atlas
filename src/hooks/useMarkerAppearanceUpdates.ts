
import { useEffect } from 'react';
import L from 'leaflet';
import { Artwork } from './useArtworks';

export const useMarkerAppearanceUpdates = (
  markersRef: React.RefObject<L.MarkerClusterGroup | null>,
  leafletMap: React.RefObject<L.Map | null>,
  artworks: Artwork[],
  showOnlyFavorites: boolean,
  updateMarkerAppearance: (
    markersRef: React.MutableRefObject<L.MarkerClusterGroup | null>,
    leafletMap: React.MutableRefObject<L.Map | null>,
    artworks: Artwork[],
    showOnlyFavorites: boolean
  ) => void
) => {
  useEffect(() => {
    console.log('[MarkerAppearance] Updating markers visibility, showOnlyFavorites:', showOnlyFavorites);
    
    if (!markersRef.current) {
      console.log('[MarkerAppearance] No markers cluster available');
      return;
    }
    
    // Safe map state check
    try {
      if (leafletMap.current) {
        if (!leafletMap.current._container || !document.body.contains(leafletMap.current._container)) {
          console.log('[MarkerAppearance] Map container not in DOM, skipping updates');
          return;
        }
        
        if (!leafletMap.current._panes || !leafletMap.current._mapPane) {
          console.log('[MarkerAppearance] Map panes not available, map may be in process of being removed');
          return;
        }
      }
    } catch (e) {
      console.error('[MarkerAppearance] Error checking map state:', e);
      return;
    }
    
    try {
      updateMarkerAppearance(markersRef as any, leafletMap as any, artworks, showOnlyFavorites);
      console.log('[MarkerAppearance] Marker visibility updated successfully');
    } catch (e) {
      console.error('[MarkerAppearance] Error updating marker appearance:', e);
    }
  }, [showOnlyFavorites]);
};

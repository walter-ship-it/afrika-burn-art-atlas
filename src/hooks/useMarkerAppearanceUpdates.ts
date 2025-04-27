
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
    console.log('[MarkerAppearance] Updating markers, showOnlyFavorites:', showOnlyFavorites);
    
    if (!markersRef.current || !leafletMap.current) {
      console.log('[MarkerAppearance] No markers cluster or map available');
      return;
    }
    
    try {
      updateMarkerAppearance(markersRef as any, leafletMap as any, artworks, showOnlyFavorites);
      console.log('[MarkerAppearance] Marker visibility updated successfully');
    } catch (e) {
      console.error('[MarkerAppearance] Error updating marker appearance:', e);
    }
  }, [showOnlyFavorites, artworks]);
};

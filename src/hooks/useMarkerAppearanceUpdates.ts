
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
    if (markersRef.current) {
      updateMarkerAppearance(markersRef as any, leafletMap as any, artworks, showOnlyFavorites);
    }
  }, [artworks, showOnlyFavorites]);
};

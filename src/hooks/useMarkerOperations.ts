
import { useEffect } from 'react';
import L from 'leaflet';
import { Artwork } from './useArtworks';
import { handleTargetMarker } from '../components/map/TargetMarker';
import { getMarkerId } from '../utils/getMarkerId';

export const useMarkerOperations = (
  leafletMap: React.RefObject<L.Map | null>,
  markersRef: React.RefObject<L.MarkerClusterGroup | null>,
  artworks: Artwork[],
  targetId: string | null,
  createMarker: (artwork: Artwork, isFavorite: boolean) => L.Marker,
  createMarkerClusterGroup: () => L.MarkerClusterGroup,
  isFavorite: (id: string) => boolean,
  toggleFavorite: (id: string) => void,
  setupFavoriteListeners: (toggleCallback: (id: string) => void) => void,
) => {
  useEffect(() => {
    console.log('[MarkerOps] Starting marker operations, artworks:', artworks.length);
    
    if (!artworks.length) {
      console.log('[MarkerOps] No artworks available');
      return;
    }

    if (!leafletMap.current) {
      console.log('[MarkerOps] Map not ready');
      return;
    }

    let markers: L.MarkerClusterGroup;
    
    try {
      // Create or clear markers cluster
      if (!markersRef.current) {
        console.log('[MarkerOps] Creating new marker cluster');
        markers = createMarkerClusterGroup();
        (markersRef as any).current = markers;
      } else {
        console.log('[MarkerOps] Using existing marker cluster');
        markers = markersRef.current;
      }

      // Clear existing layers before adding new ones
      markers.clearLayers();
      
      // Create markers for each artwork
      artworks.forEach(artwork => {
        const markerId = getMarkerId(artwork);
        const isFav = isFavorite(markerId);
        const marker = createMarker(artwork, isFav);
        
        marker.options.id = markerId;
        (marker as any).markerId = markerId;
        
        markers.addLayer(marker);
        
        // Handle target marker if needed
        if (targetId && markerId === targetId && leafletMap.current) {
          handleTargetMarker({
            marker,
            artwork,
            leafletMap: leafletMap.current
          });
        }

        console.log(`[MarkerOps] Created marker for ${markerId}, isFavorite: ${isFav}`);
      });

      // Add markers to map if not already added
      if (!leafletMap.current.hasLayer(markers)) {
        console.log('[MarkerOps] Adding marker cluster to map');
        leafletMap.current.addLayer(markers);
      }

      // Setup popup content updates
      setupFavoriteListeners(toggleFavorite);
      
    } catch (e) {
      console.error('[MarkerOps] Error in marker operations:', e);
    }
  }, [artworks, targetId, leafletMap.current, isFavorite]);
};

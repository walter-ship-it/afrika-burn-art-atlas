
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
  setupFavoriteListeners: (callback: () => void) => void,
) => {
  useEffect(() => {
    console.log('[MarkerOps] Starting marker operations, artworks:', artworks.length);
    
    if (!artworks.length) {
      console.log('[MarkerOps] No artworks available');
      return;
    }

    let markers: L.MarkerClusterGroup;
    
    try {
      // Create or clear markers cluster
      if (!markersRef.current) {
        console.log('[MarkerOps] Creating new marker cluster');
        markers = createMarkerClusterGroup();
        // Instead of directly assigning to .current, we need a different approach
        // since TypeScript marks .current as read-only
        
        // This is a workaround to update a read-only ref value
        // We know this works because the parent component maintains this ref
        (markersRef as any).current = markers;
      } else {
        console.log('[MarkerOps] Using existing marker cluster');
        markers = markersRef.current;
        markers.clearLayers();
      }
      
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
      });

      // Add markers to map if not already added
      if (leafletMap.current && !leafletMap.current.hasLayer(markers)) {
        leafletMap.current.addLayer(markers);
      }

      // Setup popup content updates
      const updatePopups = () => {
        console.log('[MarkerOps] Updating popup content');
        markers.eachLayer((layer) => {
          const marker = layer as L.Marker;
          const id = (marker as any).markerId;
          if (id) {
            const isFav = isFavorite(id);
            const artwork = artworks.find(a => getMarkerId(a) === id);
            if (artwork) {
              const popupContent = `
                <div class="marker-popup">
                  <b>${artwork.title}</b><br/>
                  <i>${artwork.category}</i>
                  <div class="flex justify-end mt-2">
                    <button class="fav-btn ${isFav ? 'favourited' : ''}" data-id="${id}">
                      <span class="fav-empty">☆</span>
                      <span class="fav-full">★</span>
                    </button>
                  </div>
                </div>
              `;
              marker.setPopupContent(popupContent);
            }
          }
        });
      };

      setupFavoriteListeners(updatePopups);
      
    } catch (e) {
      console.error('[MarkerOps] Error in marker operations:', e);
    }
  }, [artworks, targetId]); // Removed leafletMap from dependencies
};

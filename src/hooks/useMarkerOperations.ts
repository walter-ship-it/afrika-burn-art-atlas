
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
    // Skip if no artworks
    if (!artworks.length) {
      console.log('[Markers] No artworks to display, skipping marker operations');
      return;
    }

    // Create a new markers cluster if none exists
    let markers: L.MarkerClusterGroup;
    
    try {
      if (!markersRef.current) {
        console.log('[Markers] Creating new marker cluster group');
        markers = createMarkerClusterGroup();
        (markersRef as any).current = markers;
      } else {
        console.log('[Markers] Using existing marker cluster group');
        markers = markersRef.current;
        markers.clearLayers();
      }
      
      console.log('[Markers] Adding artwork markers to cluster');
      artworks.forEach(artwork => {
        try {
          const markerId = getMarkerId(artwork);
          const isFav = isFavorite(markerId);
          const marker = createMarker(artwork, isFav);
          
          marker.options.id = markerId;
          (marker as any).markerId = markerId;
          
          if (targetId && markerId === targetId) {
            if (leafletMap.current && leafletMap.current._container && 
                document.body.contains(leafletMap.current._container)) {
              handleTargetMarker({
                marker,
                artwork,
                leafletMap: leafletMap.current
              });
            }
          }
          
          markers.addLayer(marker);
        } catch (e) {
          console.error('[Markers] Error creating marker:', e);
        }
      });
      
      // Add markers to map if map is ready
      if (leafletMap.current && leafletMap.current._container && 
          document.body.contains(leafletMap.current._container)) {
        try {
          if (!leafletMap.current.hasLayer(markers)) {
            leafletMap.current.addLayer(markers);
          }
        } catch (e) {
          console.error('[Markers] Error adding markers to map:', e);
        }
      }

      const updatePopups = () => {
        console.log('[Markers] Updating popup content');
        markers.eachLayer((layer) => {
          try {
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
          } catch (e) {
            console.error('[Markers] Error updating popup:', e);
          }
        });
      };

      setupFavoriteListeners(updatePopups);
      
    } catch (e) {
      console.error('[Markers] Error in marker operations:', e);
    }
    
    // No cleanup needed as markers are managed by useMarkerAppearanceUpdates
  }, [artworks, targetId]);
};

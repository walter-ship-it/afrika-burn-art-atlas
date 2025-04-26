
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
    // Safely check if we have a valid map and artworks
    if (!artworks.length) {
      console.log('[Markers] No artworks to display, skipping marker operations');
      return;
    }
    
    if (!leafletMap.current) {
      console.log('[Markers] Map not available yet, skipping marker operations');
      return;
    }
    
    // Safe check for map validity before proceeding
    try {
      if (!leafletMap.current._container || !document.body.contains(leafletMap.current._container)) {
        console.log('[Markers] Map container not in DOM, skipping marker operations');
        return;
      }
      
      if (!leafletMap.current._panes || !leafletMap.current._mapPane) {
        console.log('[Markers] Map panes not available, map may be in process of being removed');
        return;
      }
    } catch (e) {
      console.error('[Markers] Error checking map state:', e);
      return;
    }
    
    console.log('[Markers] Creating and adding markers to map');
    
    // Create a new markers cluster if none exists
    let markers: L.MarkerClusterGroup;
    
    try {
      if (!markersRef.current) {
        markers = createMarkerClusterGroup();
        // Use non-null assertion because we just created it
        (markersRef as any).current = markers;
      } else {
        markers = markersRef.current;
        markers.clearLayers();
      }
      
      artworks.forEach(artwork => {
        try {
          const markerId = getMarkerId(artwork);
          const isFav = isFavorite(markerId);
          const marker = createMarker(artwork, isFav);
          
          marker.options.id = markerId;
          (marker as any).markerId = markerId;
          
          if (targetId && markerId === targetId) {
            setTimeout(() => {
              if (leafletMap.current && document.body.contains(leafletMap.current._container)) {
                handleTargetMarker({
                  marker,
                  artwork,
                  leafletMap: leafletMap.current
                });
              }
            }, 100);
          }
          
          markers.addLayer(marker);
        } catch (e) {
          console.error('[Markers] Error creating marker:', e);
        }
      });
      
      // Add to map if not already added - safely check map state first
      if (leafletMap.current && 
          leafletMap.current._container && 
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
        console.log('[Favs] re-rendering popup content for all markers');
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
            console.error('[Markers] Error updating popup content:', e);
          }
        });
      };

      // Only attach event if map is still valid
      if (leafletMap.current && 
          leafletMap.current._container && 
          document.body.contains(leafletMap.current._container)) {
        
        try {
          leafletMap.current.on('popupopen', (e) => {
            try {
              const btn = e.popup.getElement()?.querySelector('.fav-btn');
              if (btn) {
                const id = btn.getAttribute('data-id');
                if (id) {
                  const newBtn = btn.cloneNode(true);
                  btn.parentNode?.replaceChild(newBtn, btn);
                  
                  newBtn.addEventListener('click', () => {
                    console.log('[Favs] popup click toggle:', id);
                    toggleFavorite(id);
                  });
                }
              }
            } catch (e) {
              console.error('[Markers] Error handling popup open:', e);
            }
          });
        } catch (e) {
          console.error('[Markers] Error setting up popup open handler:', e);
        }
      }

      updatePopups();
      setupFavoriteListeners(updatePopups);
    } catch (e) {
      console.error('[Markers] Error in marker operations:', e);
    }
    
    return () => {
      // Cleanup only if we need to remove
      try {
        if (leafletMap.current && markersRef.current) {
          try {
            // Check if map is still valid
            if (leafletMap.current._container && 
                document.body.contains(leafletMap.current._container) && 
                leafletMap.current.hasLayer(markersRef.current)) {
              
              leafletMap.current.removeLayer(markersRef.current);
            }
          } catch (e) {
            console.error('[Markers] Error removing markers during cleanup:', e);
          }
        }
      } catch (e) {
        console.error('[Markers] Error in marker cleanup:', e);
      }
    };
  }, [artworks, targetId, leafletMap.current]);
};

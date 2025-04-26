
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
    if (!leafletMap.current || !artworks.length) return;
    
    if (markersRef.current) {
      leafletMap.current.removeLayer(markersRef.current);
      markersRef.current = null;
    }
    
    const markers = createMarkerClusterGroup();
    markersRef.current = markers;
    
    artworks.forEach(artwork => {
      const markerId = getMarkerId(artwork);
      const isFav = isFavorite(markerId);
      const marker = createMarker(artwork, isFav);
      
      marker.options.id = markerId;
      (marker as any).markerId = markerId;
      
      if (targetId && markerId === targetId) {
        setTimeout(() => {
          if (leafletMap.current) {
            handleTargetMarker({
              marker,
              artwork,
              leafletMap: leafletMap.current
            });
          }
        }, 100);
      }
      
      markers.addLayer(marker);
    });
    
    leafletMap.current.addLayer(markers);
    
    const updatePopups = () => {
      console.log('[Favs] re-rendering popup content for all markers');
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

    leafletMap.current.on('popupopen', (e) => {
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
    });

    updatePopups();
    setupFavoriteListeners(updatePopups);
    
    return () => {
      if (leafletMap.current && markersRef.current) {
        leafletMap.current.removeLayer(markersRef.current);
        markersRef.current = null;
      }
    };
  }, [artworks, targetId, leafletMap.current]);
};

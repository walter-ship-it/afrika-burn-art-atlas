
import { useRef } from 'react';
import L from 'leaflet';
import { Artwork } from './useArtworks';
import { createMarkerIcon } from '../utils/markerIcons';
import { getMarkerId } from '../utils/getMarkerId';

export const useMarkerUpdates = () => {
  const listenerRef = useRef<((e: MouseEvent) => void) | null>(null);

  const setupFavoriteListeners = (toggleFavorite: (id: string) => void) => {
    if (listenerRef.current) {
      document.removeEventListener('click', listenerRef.current);
    }

    const listener = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.fav-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const btn = target.closest('.fav-btn') as HTMLElement;
        const id = btn.dataset.id;
        
        if (id) {
          btn.classList.toggle('favourited');
          toggleFavorite(id);
        }
      }
    };

    document.addEventListener('click', listener);
    listenerRef.current = listener;
  };

  const updateMarkerAppearance = (
    markersRef: React.MutableRefObject<L.MarkerClusterGroup | null>,
    leafletMap: React.MutableRefObject<L.Map | null>,
    artworks: Artwork[],
    showOnlyFavorites: boolean,
    isFavorite: (id: string) => boolean
  ) => {
    if (!markersRef.current) {
      console.log('[MarkerUpdates] No marker cluster available');
      return;
    }
    
    console.log('[MarkerUpdates] Updating markers visibility, showOnlyFavorites:', showOnlyFavorites);
    
    markersRef.current.eachLayer((layer) => {
      const marker = layer as L.Marker;
      const markerId = (marker as any).markerId;
      
      if (!markerId) {
        console.log('[MarkerUpdates] Marker without ID found');
        return;
      }
      
      const isFav = isFavorite(markerId);
      // Store current favorite status on marker for faster access
      (marker as any).isFavorite = isFav;
      
      // Update marker icon based on favorite status
      const artwork = artworks.find(a => getMarkerId(a) === markerId);
      if (artwork) {
        marker.setIcon(createMarkerIcon(artwork.category.toLowerCase(), isFav));
      }
      
      // Update visibility based on filter
      if (showOnlyFavorites && !isFav) {
        // Hide non-favorite markers
        marker.setOpacity(0);
        const element = marker.getElement();
        if (element) {
          element.style.display = 'none';
        }
      } else {
        // Show marker
        marker.setOpacity(1);
        const element = marker.getElement();
        if (element) {
          element.style.display = '';
        }
      }
      
      // Update popup content to reflect favorite status
      if (artwork) {
        const popupContent = `
          <div class="marker-popup">
            <b>${artwork.title}</b><br/>
            <i>${artwork.category}</i>
            <div class="flex justify-end mt-2">
              <button class="fav-btn ${isFav ? 'favourited' : ''}" data-id="${markerId}">
                <span class="fav-empty">☆</span>
                <span class="fav-full">★</span>
              </button>
            </div>
          </div>
        `;
        marker.setPopupContent(popupContent);
      }
    });
  };

  return { setupFavoriteListeners, updateMarkerAppearance };
};

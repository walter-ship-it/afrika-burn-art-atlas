
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Artwork } from './useArtworks';
import { getMarkerId } from '../utils/getMarkerId';
import { createMarkerIcon } from '../utils/markerIcons';
import { useFavorites } from './useFavorites';

export const useMarkerUpdates = () => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const listenerRef = useRef<((e: MouseEvent) => void) | null>(null);

  const setupFavoriteListeners = (updateCallback: () => void) => {
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
          toggleFavorite(id);
          btn.classList.toggle('favourited');
          updateCallback();
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
    showOnlyFavorites: boolean
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
      
      const artwork = artworks.find(a => getMarkerId(a) === markerId);
      if (!artwork) {
        console.log('[MarkerUpdates] No artwork found for marker:', markerId);
        return;
      }
      
      const isFav = isFavorite(markerId);
      const shouldShow = !showOnlyFavorites || isFav;
      
      console.log(`[MarkerUpdates] Marker ${markerId} - isFav: ${isFav}, shouldShow: ${shouldShow}`);
      
      // Update marker icon
      marker.setIcon(createMarkerIcon(artwork.category.toLowerCase(), isFav));
      
      // Update visibility using opacity
      marker.setOpacity(shouldShow ? 1 : 0);
      const element = marker.getElement();
      if (element) {
        element.style.display = shouldShow ? '' : 'none';
      }
    });
  };

  return { setupFavoriteListeners, updateMarkerAppearance };
};

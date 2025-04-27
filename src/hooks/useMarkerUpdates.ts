
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Artwork } from './useArtworks';
import { getMarkerId } from '../utils/getMarkerId';
import { createMarkerIcon } from '../utils/markerIcons';

export const useMarkerUpdates = () => {
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
      const isFav = (marker as any).isFavorite || false;
      
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
    });
  };

  return { setupFavoriteListeners, updateMarkerAppearance };
};

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
    // Remove existing listener if any
    if (listenerRef.current) {
      document.removeEventListener('click', listenerRef.current);
    }

    // Create new listener
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

    // Return cleanup function
    return () => {
      if (listenerRef.current) {
        document.removeEventListener('click', listenerRef.current);
      }
    };
  };

  const updateMarkerAppearance = (
    markersRef: React.MutableRefObject<L.MarkerClusterGroup | null>,
    leafletMap: React.MutableRefObject<L.Map | null>,
    artworks: Artwork[],
    showOnlyFavorites: boolean
  ) => {
    if (!markersRef.current || !leafletMap.current) return;
    
    // We'll keep the cluster group on the map at all times and handle visibility at the marker level
    // This avoids issues with marker management and improves performance

    // Iterate through all markers and update their visibility
    markersRef.current.eachLayer((layer) => {
      const marker = layer as L.Marker;
      const markerId = (marker as any).markerId;
      if (!markerId) return;
      
      const isFav = isFavorite(markerId);
      const shouldShow = !showOnlyFavorites || isFav;
      
      // Update marker icon to reflect favorite status
      const artwork = artworks.find(a => getMarkerId(a) === markerId);
      if (artwork) {
        marker.setIcon(createMarkerIcon(artwork.category.toLowerCase(), isFav));
      }

      // Update marker visibility
      if (shouldShow) {
        marker.setOpacity(1);
        if (marker.getElement()) {
          marker.getElement()!.style.display = '';
        }
      } else {
        marker.setOpacity(0);
        if (marker.getElement()) {
          marker.getElement()!.style.display = 'none';
        }
      }
    });
  };

  return { setupFavoriteListeners, updateMarkerAppearance };
};

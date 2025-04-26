
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
    
    // Handle cluster group visibility
    if (showOnlyFavorites) {
      leafletMap.current.removeLayer(markersRef.current);
    } else {
      leafletMap.current.addLayer(markersRef.current);
    }
    
    markersRef.current.eachLayer((layer) => {
      const marker = layer as L.Marker;
      const markerId = (marker as any).markerId;
      if (!markerId) return;
      
      const shouldShow = !showOnlyFavorites || isFavorite(markerId);
      
      if (!shouldShow) {
        markersRef.current?.removeLayer(marker);
      } else if (!markersRef.current?.hasLayer(marker)) {
        markersRef.current?.addLayer(marker);
      }
      
      const artwork = artworks.find(a => getMarkerId(a) === markerId);
      if (artwork) {
        const isFav = isFavorite(markerId);
        marker.setIcon(createMarkerIcon(artwork.category.toLowerCase(), isFav));
      }
    });
  };

  return { setupFavoriteListeners, updateMarkerAppearance };
};

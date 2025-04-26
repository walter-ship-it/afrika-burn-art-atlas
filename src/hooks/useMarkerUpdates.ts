
import { useRef } from 'react';
import L from 'leaflet';
import { Artwork } from './useArtworks';
import { getMarkerId } from '../utils/getMarkerId';
import { createMarkerIcon } from '../utils/markerIcons';
import { useFavorites } from './useFavorites';

export const useMarkerUpdates = () => {
  const { isFavorite, toggleFavorite } = useFavorites();

  const setupFavoriteListeners = (updateCallback: () => void) => {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.fav-btn')) {
        e.preventDefault();
        const btn = target.closest('.fav-btn') as HTMLElement;
        const id = btn.dataset.id;
        
        if (id) {
          toggleFavorite(id);
          btn.classList.toggle('favourited');
          updateCallback();
        }
      }
    });
  };

  const updateMarkerAppearance = (
    markersRef: React.MutableRefObject<L.MarkerClusterGroup | null>,
    leafletMap: React.MutableRefObject<L.Map | null>,
    artworks: Artwork[],
    showOnlyFavorites: boolean
  ) => {
    if (!markersRef.current || !leafletMap.current) return;
    
    markersRef.current.eachLayer((layer) => {
      const marker = layer as L.Marker;
      const markerId = (marker as any).markerId;
      if (!markerId) return;
      
      const shouldShow = !showOnlyFavorites || isFavorite(markerId);
      marker.setOpacity(shouldShow ? 1 : 0.2);
      
      if (leafletMap.current) {
        const artwork = artworks.find(a => getMarkerId(a) === markerId);
        if (artwork) {
          const isFav = isFavorite(markerId);
          marker.setIcon(createMarkerIcon(artwork.category.toLowerCase(), isFav));
        }
      }
    });
  };

  return { setupFavoriteListeners, updateMarkerAppearance };
};

import { useRef } from 'react';
import L from 'leaflet';
import { Artwork } from '../hooks/useArtworks';
import { createMarkerIcon } from '../utils/markerIcons';
import { getMarkerId } from '../utils/getMarkerId';

export const useMarkers = () => {
  const markerSize = useRef(window.innerWidth < 360 ? 28 : 20);

  const createMarkerClusterGroup = () => L.markerClusterGroup({
    maxClusterRadius: 40,
    spiderfyOnMaxZoom: true,
    disableClusteringAtZoom: 1,
    showCoverageOnHover: false,
    removeOutsideVisibleBounds: true,
    animate: true,
  });

  const createMarker = (artwork: Artwork, isFavorite: boolean = false) => {
    const lat = 1448 - artwork.y;
    const lng = artwork.x;
    const markerId = getMarkerId(artwork);
    
    const marker = L.marker([lat, lng], { 
      icon: createMarkerIcon(artwork.category.toLowerCase(), isFavorite),
    });
    
    const popupContent = `
      <div class="marker-popup">
        <b>${artwork.title}</b><br/>
        <i>${artwork.category}</i>
        <div class="flex justify-end mt-2">
          <button class="fav-btn ${isFavorite ? 'favourited' : ''}" data-id="${markerId}">
            <span class="fav-empty">☆</span>
            <span class="fav-full">★</span>
          </button>
        </div>
      </div>
    `;
    
    marker.bindPopup(popupContent, {
      className: 'marker-popup-container',
    });
    
    marker.bindTooltip(artwork.title, { 
      direction: 'top', 
      opacity: 0.9,
      offset: [0, -10],
    });
    
    (marker as any).markerId = markerId;
    
    return marker;
  };

  const updateMarkerVisibility = (
    marker: L.Marker,
    showOnlyFavorites: boolean,
    markerGroup: L.MarkerClusterGroup
  ) => {
    const isFavorite = (marker as any).isFavorite;
    const shouldShow = !showOnlyFavorites || isFavorite;
    
    if (!shouldShow) {
      markerGroup.removeLayer(marker);
      if (marker.getElement()) {
        marker.getElement().style.display = 'none';
      }
      marker.setOpacity(0);
    } else {
      if (!markerGroup.hasLayer(marker)) {
        markerGroup.addLayer(marker);
      }
      if (marker.getElement()) {
        marker.getElement().style.display = '';
      }
      marker.setOpacity(1);
    }
  };

  return {
    markerSize,
    createMarkerClusterGroup,
    createMarker,
    updateMarkerVisibility
  };
};

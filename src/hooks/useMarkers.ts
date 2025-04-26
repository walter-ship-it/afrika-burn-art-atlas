
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
  });

  const createMarker = (artwork: Artwork, isFavorite: boolean = false) => {
    const lat = 1448 - artwork.y;
    const lng = artwork.x;
    const markerId = getMarkerId(artwork);
    
    const marker = L.marker([lat, lng], { 
      icon: createMarkerIcon(artwork.category.toLowerCase(), isFavorite),
    });
    
    const popupContent = `
      <b>${artwork.title}</b><br/>
      <i>${artwork.category}</i>
      <div class="flex justify-end mt-2">
        <button class="fav-btn ${isFavorite ? 'favourited' : ''}" data-id="${markerId}">
          <span class="fav-empty">☆</span>
          <span class="fav-full">★</span>
        </button>
      </div>
    `;
    
    marker.bindPopup(popupContent)
    .bindTooltip(artwork.title, { 
      direction: 'top', 
      opacity: 0.9,
      offset: [0, -10],
    });
    
    // Store the marker ID for later reference
    (marker as any).markerId = markerId;
    
    return marker;
  };

  return {
    markerSize,
    createMarkerClusterGroup,
    createMarker
  };
};

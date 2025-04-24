
import { useRef } from 'react';
import L from 'leaflet';
import { Artwork } from '../hooks/useArtworks';

export const useMarkers = () => {
  const markerSize = useRef(window.innerWidth < 360 ? 28 : 20);

  const createMarkerIcon = () => L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: #059669; 
      opacity: 0.7;
      width: ${markerSize.current}px; 
      height: ${markerSize.current}px; 
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const createMarkerClusterGroup = () => L.markerClusterGroup({
    maxClusterRadius: 40,
    spiderfyOnMaxZoom: true,
    disableClusteringAtZoom: 1,
    showCoverageOnHover: false,
  });

  const createMarker = (artwork: Artwork) => {
    const lat = 1448 - artwork.y;
    const lng = artwork.x;
    
    return L.marker([lat, lng], { icon: createMarkerIcon() })
      .bindPopup(`<b>${artwork.title}</b><br/><i>${artwork.category}</i>`)
      .bindTooltip(artwork.title, { 
        direction: 'top', 
        opacity: 0.9,
        offset: [0, -10],
      });
  };

  return {
    markerSize,
    createMarkerClusterGroup,
    createMarker
  };
};


import { useEffect } from 'react';
import L from 'leaflet';
import { Artwork } from '../../hooks/useArtworks';

interface TargetMarkerProps {
  marker: L.Marker;
  artwork: Artwork;
  leafletMap: L.Map;
}

export const handleTargetMarker = (props: TargetMarkerProps) => {
  const { marker, leafletMap } = props;

  // Center the map on the marker with animation, using zoom level -2
  leafletMap.setView(marker.getLatLng(), -2, { animate: true });
  
  // Find any cluster containing our marker and unspiderify it
  const parentCluster = (marker as any).__parent;
  if (parentCluster && typeof parentCluster.unspiderfy === 'function') {
    parentCluster.unspiderfy();
  }
  
  // Open the popup after a longer delay to ensure animations complete
  setTimeout(() => {
    marker.openPopup();
  }, 800);
  
  // Add pulsing effect
  const el = marker.getElement();
  if (el) {
    // Remove any existing pulse class
    el.classList.remove('pulse');
    // Force a reflow
    void el.offsetWidth;
    // Add the pulse class again
    el.classList.add('pulse');
    // Remove the pulse class after animation
    setTimeout(() => el.classList.remove('pulse'), 3000);
  }
};


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
  
  // Open the popup after a short delay to ensure it's visible after zoom
  setTimeout(() => {
    marker.openPopup();
  }, 500);
  
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

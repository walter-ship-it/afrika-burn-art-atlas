
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

  // Center the map on the marker with animation
  leafletMap.setView(marker.getLatLng(), 0, { animate: true });
  
  // Open the popup
  marker.openPopup();
  
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

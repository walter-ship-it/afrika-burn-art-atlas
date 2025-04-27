
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

  // First, check if map is valid
  if (!leafletMap || !marker) {
    console.error('[TargetMarker] Invalid map or marker reference');
    return;
  }

  // Center the map on the marker with animation, using zoom level -2
  leafletMap.setView(marker.getLatLng(), -2, { animate: true });
  
  // Add pulsing effect first
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

  // Safely try to unspiderify after a short delay to make sure map is ready
  setTimeout(() => {
    try {
      // Check if marker still exists and has a parent
      const parentCluster = (marker as any).__parent;
      if (parentCluster && typeof parentCluster.unspiderfy === 'function' && 
          leafletMap && document.body.contains(leafletMap.getContainer())) {
        // Only unspiderify if the map is still valid
        parentCluster.unspiderfy();
      }
    } catch (e) {
      console.error('[TargetMarker] Error during unspiderify:', e);
    }
    
    // Open popup after the unspiderify attempt, regardless of success
    if (marker && leafletMap && document.body.contains(leafletMap.getContainer())) {
      marker.openPopup();
    }
  }, 300);
};

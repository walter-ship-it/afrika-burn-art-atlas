
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

  leafletMap.setView(marker.getLatLng(), 0, { animate: true });
  marker.openPopup();
  
  const el = marker.getElement();
  if (el) {
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 3000);
  }
};

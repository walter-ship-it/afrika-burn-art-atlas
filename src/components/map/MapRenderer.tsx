
import React, { useRef } from 'react';
import L from 'leaflet';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { MapState } from '@/hooks/useMapState';

interface MapRendererProps {
  setMapError: (error: string | null) => void;
  initialState: MapState;
  onMapReady: (map: L.Map) => void;
}

const MapRenderer = ({ setMapError, initialState, onMapReady }: MapRendererProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  
  // Initialize map with proper error handling
  useMapInitialization(mapRef, leafletMap, setMapError, initialState);

  // Notify parent when map is ready
  React.useEffect(() => {
    if (leafletMap.current) {
      onMapReady(leafletMap.current);
    }
  }, [leafletMap.current]);

  return (
    <div
      ref={mapRef}
      className="w-full h-screen"
      aria-label="AfrikaBurn Art Map"
      role="application"
      id="map-container"
    />
  );
};

export default MapRenderer;


import { useEffect } from 'react';
import L from 'leaflet';
import { MapState } from './useMapState';

export const useMapInitialization = (
  mapRef: React.RefObject<HTMLDivElement>,
  leafletMap: React.MutableRefObject<L.Map | null>,
  setMapError: (error: string | null) => void,
  initialState: MapState
) => {
  useEffect(() => {
    if (!mapRef.current) return;
    
    console.log('Initializing map...');
    
    if (!leafletMap.current) {
      try {
        leafletMap.current = L.map(mapRef.current, {
          crs: L.CRS.Simple,
          preferCanvas: true,
          fadeAnimation: false,
          minZoom: -4,
          maxZoom: 2,
          inertia: true,
          zoomControl: true,
        });
        
        const bounds = [[0, 0], [1448, 2068]];
        
        const testImg = new Image();
        testImg.onload = () => {
          console.log('Map image loaded successfully!');
          const overlay = L.imageOverlay('/img/map.png', bounds).addTo(leafletMap.current!);
          overlay.on('load', () => console.log('Image overlay loaded'));
          overlay.on('error', (e) => {
            console.error('Image overlay error:', e);
            setMapError('Failed to load map image');
          });
        };
        testImg.onerror = () => {
          console.error('Failed to load map image!');
          setMapError('Map image not found');
          const overlay = L.imageOverlay('/lovable-uploads/88cf2c86-ed43-4d55-a4d0-4cf74740daea.png', bounds).addTo(leafletMap.current!);
          console.log('Trying fallback image...');
        };
        testImg.src = '/img/map.png';
        
        leafletMap.current.setView([initialState.lat, initialState.lng], initialState.zoom);
        leafletMap.current.fitBounds(bounds);
      } catch (e) {
        console.error('Error initializing map:', e);
        setMapError('Failed to initialize map');
      }
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);
};

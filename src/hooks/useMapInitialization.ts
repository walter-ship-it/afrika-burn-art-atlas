
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
        
        // Primary image path
        const primaryImagePath = '/img/map.png';
        // Fallback image path (using the Lovable uploads)
        const fallbackImagePath = '/lovable-uploads/88cf2c86-ed43-4d55-a4d0-4cf74740daea.png';
        
        // Try to load the primary image first
        const testImg = new Image();
        testImg.onload = () => {
          console.log('Map image loaded successfully from:', primaryImagePath);
          const overlay = L.imageOverlay(primaryImagePath, bounds).addTo(leafletMap.current!);
          overlay.on('load', () => console.log('Image overlay loaded'));
          overlay.on('error', (e) => {
            console.error('Image overlay error:', e);
            tryFallbackImage();
          });
        };
        testImg.onerror = () => {
          console.error('Failed to load primary map image from:', primaryImagePath);
          tryFallbackImage();
        };
        testImg.src = primaryImagePath;
        
        // Function to try loading the fallback image
        const tryFallbackImage = () => {
          console.log('Trying fallback image:', fallbackImagePath);
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            console.log('Fallback image loaded successfully!');
            setMapError(null);
            const overlay = L.imageOverlay(fallbackImagePath, bounds).addTo(leafletMap.current!);
          };
          fallbackImg.onerror = () => {
            console.error('Failed to load fallback image!');
            setMapError('Map image not found - please ensure the image is available at either path');
          };
          fallbackImg.src = fallbackImagePath;
        };
        
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

import { useRef, useEffect } from 'react';
import L from 'leaflet';
// @ts-ignore
window.L = L;
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import { useArtworks } from '../hooks/useArtworks';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useMapState } from '../hooks/useMapState';
import { useMarkers } from '../hooks/useMarkers';
import { useMapInitialization } from '../hooks/useMapInitialization';
import InstallBanner from './InstallBanner';
import LoadingIndicator from './LoadingIndicator';
import MapStyles from './MapStyles';

// Fix Leaflet's default icon paths
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});

const ArtMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const { artworks, setArtworks, isLoading, setIsLoading, getArtworks } = useArtworks();
  const { installState, promptInstall, dismissIOSHint } = useInstallPrompt();
  const { mapError, setMapError, loadSavedMapState, saveMapState } = useMapState();
  const { markerSize, createMarkerClusterGroup, createMarker } = useMarkers();

  // Initialize map
  useMapInitialization(mapRef, leafletMap, setMapError, loadSavedMapState());

  // Load artworks
  useEffect(() => {
    const loadArtworks = async () => {
      setIsLoading(true);
      try {
        const data = await getArtworks();
        console.log(`Loaded ${data.length} artworks`);
        setArtworks(data);
      } catch (error) {
        console.error('Failed to load artworks:', error);
        setMapError('Failed to load artwork data');
      } finally {
        setIsLoading(false);
      }
    };

    loadArtworks();
  }, []);

  // Update markers when artworks data changes
  useEffect(() => {
    if (!leafletMap.current || artworks.length === 0) return;
    
    console.log('Updating markers with', artworks.length, 'artworks');
    
    leafletMap.current.eachLayer(layer => {
      if (layer instanceof L.MarkerClusterGroup) {
        leafletMap.current!.removeLayer(layer);
      }
    });
    
    const markers = createMarkerClusterGroup();
    
    artworks.forEach(artwork => {
      const marker = createMarker(artwork);
      marker.options.alt = artwork.title;
      markers.addLayer(marker);
    });
    
    leafletMap.current.addLayer(markers);
  }, [artworks]);

  // Save map state on move
  useEffect(() => {
    if (!leafletMap.current) return;

    leafletMap.current.on('moveend', () => {
      if (!leafletMap.current) return;
      
      const center = leafletMap.current.getCenter();
      const zoom = leafletMap.current.getZoom();
      
      saveMapState({
        lat: center.lat,
        lng: center.lng,
        zoom: zoom,
      });
    });
  }, []);

  // Handle window resize for marker size adjustment
  useEffect(() => {
    const handleResize = () => {
      const newSize = window.innerWidth < 360 ? 28 : 20;
      if (newSize !== markerSize.current) {
        markerSize.current = newSize;
        setArtworks(prev => [...prev]);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="w-full h-screen"
        aria-label="AfrikaBurn Art Map"
        role="application"
      />
      {isLoading && <LoadingIndicator />}
      {mapError && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-[1001]">
          <p className="font-bold">Error</p>
          <p>{mapError}</p>
        </div>
      )}
      <InstallBanner
        installState={installState}
        promptInstall={promptInstall}
        dismissIOSHint={dismissIOSHint}
      />
      <MapStyles />
    </div>
  );
};

export default ArtMap;

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
import { useArtworkLoading } from '../hooks/useArtworkLoading';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useMapState } from '../hooks/useMapState';
import { useMarkers } from '../hooks/useMarkers';
import { useMapInitialization } from '../hooks/useMapInitialization';
import { useFavorites } from '../hooks/useFavorites';
import { useMapInteractions } from '../hooks/useMapInteractions';
import { useMarkerUpdates } from '../hooks/useMarkerUpdates';
import { handleTargetMarker } from './map/TargetMarker';
import MapControls from './map/MapControls';
import MapStatus from './map/MapStatus';
import MapStyles from './MapStyles';
import { getMarkerId } from '../utils/getMarkerId';

L.Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});

const ArtMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const zoneLayerCreatedRef = useRef<boolean>(false);
  
  const { artworks, isLoading, mapError, setMapError } = useArtworkLoading();
  const { installState, promptInstall, dismissIOSHint } = useInstallPrompt();
  const { loadSavedMapState, saveMapState, createZoneLayer, toggleZoneVisibility, cleanupZoneLayer } = useMapState();
  const { createMarkerClusterGroup, createMarker } = useMarkers();
  const { favorites, showOnlyFavorites, setShowOnlyFavorites, isFavorite } = useFavorites();
  const { setupMapInteractions } = useMapInteractions(leafletMap, saveMapState);
  const { setupFavoriteListeners, updateMarkerAppearance } = useMarkerUpdates();

  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('markerId');

  // Initialize map with saved state
  const initialState = loadSavedMapState();
  useMapInitialization(mapRef, leafletMap, setMapError, initialState);
  
  // Set up map interactions and create initial zone layer
  useEffect(() => {
    if (!leafletMap.current) return;
    
    setupMapInteractions();
    
    console.log('[DEBUG] Initial zone layer setup');
    const zoneLayer = createZoneLayer(leafletMap.current);
    if (zoneLayer) {
      toggleZoneVisibility(showOnlyFavorites);
    }
    
    return () => {
      console.log('[DEBUG] Cleaning up map and zones');
      cleanupZoneLayer();
      
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [leafletMap.current]);

  // Handle favorites toggle
  useEffect(() => {
    if (!leafletMap.current) return;
    console.log('[DEBUG] Handling favorites toggle:', showOnlyFavorites);
    toggleZoneVisibility(showOnlyFavorites);
  }, [showOnlyFavorites]);

  // Create and update markers
  useEffect(() => {
    if (!leafletMap.current || !artworks.length) return;
    
    if (markersRef.current) {
      leafletMap.current.removeLayer(markersRef.current);
      markersRef.current = null;
    }
    
    const markers = createMarkerClusterGroup();
    markersRef.current = markers;
    
    artworks.forEach(artwork => {
      const markerId = getMarkerId(artwork);
      const isFav = isFavorite(markerId);
      const marker = createMarker(artwork, isFav);
      
      marker.options.id = markerId;
      (marker as any).markerId = markerId;
      
      if (targetId && markerId === targetId) {
        setTimeout(() => {
          if (leafletMap.current) {
            handleTargetMarker({
              marker,
              artwork,
              leafletMap: leafletMap.current
            });
          }
        }, 100);
      }
      
      markers.addLayer(marker);
    });
    
    leafletMap.current.addLayer(markers);
    
    setupFavoriteListeners(() => {
      updateMarkerAppearance(markersRef, leafletMap, artworks, showOnlyFavorites);
      toggleZoneVisibility(showOnlyFavorites);
    });
    
    return () => {
      if (leafletMap.current && markersRef.current) {
        leafletMap.current.removeLayer(markersRef.current);
        markersRef.current = null;
      }
    };
  }, [artworks, targetId, leafletMap.current]);

  // Update markers when favorites change
  useEffect(() => {
    if (markersRef.current) {
      updateMarkerAppearance(markersRef, leafletMap, artworks, showOnlyFavorites);
    }
  }, [favorites, showOnlyFavorites, artworks]);

  return (
    <div className="relative w-full h-full z-10">
      <div
        ref={mapRef}
        className="w-full h-screen"
        aria-label="AfrikaBurn Art Map"
        role="application"
      />
      <MapStatus isLoading={isLoading} error={mapError} />
      <MapControls
        installState={installState}
        promptInstall={promptInstall}
        dismissIOSHint={dismissIOSHint}
        showOnlyFavorites={showOnlyFavorites}
        setShowOnlyFavorites={setShowOnlyFavorites}
      />
      <MapStyles />
    </div>
  );
};

export default ArtMap;

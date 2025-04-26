
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
  
  const { artworks, isLoading, mapError, setMapError } = useArtworkLoading();
  const { installState, promptInstall, dismissIOSHint } = useInstallPrompt();
  const { loadSavedMapState, saveMapState } = useMapState();
  const { createMarkerClusterGroup, createMarker } = useMarkers();
  const { favorites, showOnlyFavorites, setShowOnlyFavorites, isFavorite } = useFavorites();
  const { setupMapInteractions } = useMapInteractions(leafletMap, saveMapState);
  const { setupFavoriteListeners, updateMarkerAppearance } = useMarkerUpdates();

  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('markerId');

  useMapInitialization(mapRef, leafletMap, setMapError, loadSavedMapState());

  useEffect(() => {
    if (!leafletMap.current || artworks.length === 0) return;
    
    leafletMap.current.eachLayer(layer => {
      if (layer instanceof L.MarkerClusterGroup) {
        leafletMap.current!.removeLayer(layer);
      }
    });
    
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
    setupFavoriteListeners(() => updateMarkerAppearance(markersRef, leafletMap, artworks, showOnlyFavorites));
  }, [artworks, targetId]);

  useEffect(() => {
    if (markersRef.current) {
      updateMarkerAppearance(markersRef, leafletMap, artworks, showOnlyFavorites);
    }
  }, [favorites, showOnlyFavorites]);

  useEffect(() => {
    setupMapInteractions();
  }, []);

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

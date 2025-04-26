
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
import MapControls from './map/MapControls';
import MapStatus from './map/MapStatus';
import MapStyles from './MapStyles';
import { useMarkerOperations } from '../hooks/useMarkerOperations';
import { useZoneVisibility } from '../hooks/useZoneVisibility';
import { useMarkerAppearanceUpdates } from '../hooks/useMarkerAppearanceUpdates';
import { useMarkerUpdates } from '../hooks/useMarkerUpdates';

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
  const { loadSavedMapState, saveMapState, createZoneLayer, toggleZoneVisibility, cleanupZoneLayer } = useMapState();
  const { createMarkerClusterGroup, createMarker } = useMarkers();
  const { favorites, showOnlyFavorites, setShowOnlyFavorites, isFavorite, toggleFavorite } = useFavorites();
  const { setupMapInteractions } = useMapInteractions(leafletMap, saveMapState);
  const { setupFavoriteListeners, updateMarkerAppearance } = useMarkerUpdates();

  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('markerId');

  const initialState = loadSavedMapState();
  useMapInitialization(mapRef, leafletMap, setMapError, initialState);

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

  useZoneVisibility(leafletMap, showOnlyFavorites, toggleZoneVisibility);
  
  useMarkerOperations(
    leafletMap,
    markersRef,
    artworks,
    targetId,
    createMarker,
    createMarkerClusterGroup,
    isFavorite,
    toggleFavorite,
    setupFavoriteListeners
  );

  useMarkerAppearanceUpdates(
    markersRef,
    leafletMap,
    artworks,
    showOnlyFavorites,
    updateMarkerAppearance
  );

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

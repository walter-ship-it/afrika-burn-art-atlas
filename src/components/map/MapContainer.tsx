import React, { useRef } from 'react';
import L from 'leaflet';
import { useArtworkLoading } from '@/hooks/useArtworkLoading';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useMapState } from '@/hooks/useMapState';
import { useFavorites } from '@/context/FavoritesContext';
import { useMapInteractions } from '@/hooks/useMapInteractions';
import { useZoneVisibility } from '@/hooks/useZoneVisibility';
import { useMarkerOperations } from '@/hooks/useMarkerOperations';
import { useMarkerAppearanceUpdates } from '@/hooks/useMarkerAppearanceUpdates';
import { useMarkerUpdates } from '@/hooks/useMarkerUpdates';
import { useMarkers } from '@/hooks/useMarkers';
import MapRenderer from './MapRenderer';
import MapControls from './MapControls';
import MapStatus from './MapStatus';
import { useTargetMarker } from '@/hooks/useTargetMarker';

const MapContainer = () => {
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const isCleanedUp = useRef<boolean>(false);

  const { artworks, isLoading, mapError, setMapError } = useArtworkLoading();
  const { installState, promptInstall, dismissIOSHint } = useInstallPrompt();
  const { loadSavedMapState, saveMapState, createZoneLayer, toggleZoneVisibility, cleanupZoneLayer } = useMapState();
  const { createMarkerClusterGroup, createMarker } = useMarkers();
  const { favorites, showOnlyFavorites, setShowOnlyFavorites, isFavorite, toggleFavorite } = useFavorites();
  const { setupMapInteractions } = useMapInteractions(leafletMap, saveMapState);

  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('markerId');
  
  useTargetMarker(markersRef, leafletMap, targetId, artworks);

  // Set up map interactions when map is ready
  const handleMapReady = (map: L.Map) => {
    leafletMap.current = map;
    setupMapInteractions();
    createZoneLayer(map);
  };

  // Handle zone visibility
  useZoneVisibility(leafletMap, showOnlyFavorites, toggleZoneVisibility);
  
  const { setupFavoriteListeners, updateMarkerAppearance } = useMarkerUpdates();
  
  // Handle marker operations
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
    isFavorite,
    updateMarkerAppearance
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (isCleanedUp.current) return;
      cleanupZoneLayer();
      isCleanedUp.current = true;
    };
  }, []);

  return (
    <div className="relative w-full h-full z-10">
      <MapRenderer
        setMapError={setMapError}
        initialState={loadSavedMapState()}
        onMapReady={handleMapReady}
      />
      <MapStatus isLoading={isLoading} error={mapError} />
      <MapControls
        installState={installState}
        promptInstall={promptInstall}
        dismissIOSHint={dismissIOSHint}
        showOnlyFavorites={showOnlyFavorites}
        setShowOnlyFavorites={setShowOnlyFavorites}
      />
    </div>
  );
};

export default MapContainer;

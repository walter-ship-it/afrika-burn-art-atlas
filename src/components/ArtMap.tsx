
import React, { useRef, useEffect } from 'react';
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
  const { loadSavedMapState, saveMapState, createZoneLayer, toggleZoneVisibility, cleanupZoneLayer } = useMapState();
  const { createMarkerClusterGroup, createMarker } = useMarkers();
  const { favorites, showOnlyFavorites, setShowOnlyFavorites, isFavorite, toggleFavorite } = useFavorites();
  const { setupMapInteractions } = useMapInteractions(leafletMap, saveMapState);

  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('markerId');

  const initialState = loadSavedMapState();
  
  // Initialize map and set up zone layer in one place
  useMapInitialization(mapRef, leafletMap, setMapError, initialState);

  // Set up map interactions once when map is ready
  useEffect(() => {
    if (!leafletMap.current) return;
    setupMapInteractions();
    
    // Create zone layer once during initialization
    console.log('[DEBUG] Initial zone layer setup');
    createZoneLayer(leafletMap.current);
    
    return () => {
      console.log('[DEBUG] Cleaning up map and zones');
      cleanupZoneLayer();
      if (leafletMap.current) {
        leafletMap.current.remove();
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  // Handle visibility toggling via the dedicated hook
  useZoneVisibility(leafletMap, showOnlyFavorites, toggleZoneVisibility);
  
  const { setupFavoriteListeners, updateMarkerAppearance } = useMarkerUpdates();
  
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

  const renderPopupContent = (id: string, isFav: boolean) => `
    <div class="marker-popup">
      <b>${artworks.find(a => getMarkerId(a) === id)?.title}</b><br/>
      <i>${artworks.find(a => getMarkerId(a) === id)?.category}</i>
      <div class="flex justify-end mt-2">
        <button class="fav-btn ${isFav ? 'favourited' : ''}" data-id="${id}">
          <span class="fav-empty">☆</span>
          <span class="fav-full">★</span>
        </button>
      </div>
    </div>
  `;

  // Update popup content when favorites change
  useEffect(() => {
    if (!markersRef.current) return;
    console.log('[Favs] re-rendering popup content for all markers');
    
    markersRef.current.eachLayer((layer) => {
      const marker = layer as L.Marker;
      const id = marker.options.id as string;
      marker.setPopupContent(renderPopupContent(id, favorites.has(id)));
    });
  }, [favorites, artworks]);

  // Re-bind click handlers on popup open to ensure they use the latest favorite state
  useEffect(() => {
    if (!leafletMap.current) return;

    leafletMap.current.on('popupopen', (e) => {
      const btn = e.popup.getElement()?.querySelector('.fav-btn');
      if (btn) {
        const id = btn.getAttribute('data-id');
        if (id) {
          const newBtn = btn.cloneNode(true);
          btn.parentNode?.replaceChild(newBtn, btn);
          
          newBtn.addEventListener('click', () => {
            console.log('[Favs] popup click:', id);
            toggleFavorite(id);
          });
        }
      }
    });
  }, [toggleFavorite]);

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

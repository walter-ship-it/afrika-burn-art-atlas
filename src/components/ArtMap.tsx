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

  useEffect(() => {
    if (!leafletMap.current) return;
    console.log('[DEBUG] Handling favorites toggle:', showOnlyFavorites);
    toggleZoneVisibility(showOnlyFavorites);
  }, [showOnlyFavorites]);

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
    
    const updatePopups = () => {
      console.log('[Favs] re-rendering popup content for all markers');
      markers.eachLayer((layer) => {
        const marker = layer as L.Marker;
        const id = (marker as any).markerId;
        if (id) {
          const isFav = isFavorite(id);
          const artwork = artworks.find(a => getMarkerId(a) === id);
          if (artwork) {
            const popupContent = `
              <div class="marker-popup">
                <b>${artwork.title}</b><br/>
                <i>${artwork.category}</i>
                <div class="flex justify-end mt-2">
                  <button class="fav-btn ${isFav ? 'favourited' : ''}" data-id="${id}">
                    <span class="fav-empty">☆</span>
                    <span class="fav-full">★</span>
                  </button>
                </div>
              </div>
            `;
            marker.setPopupContent(popupContent);
          }
        }
      });
    };

    leafletMap.current.on('popupopen', (e) => {
      const btn = e.popup.getElement()?.querySelector('.fav-btn');
      if (btn) {
        const id = btn.getAttribute('data-id');
        if (id) {
          const newBtn = btn.cloneNode(true);
          btn.parentNode?.replaceChild(newBtn, btn);
          
          newBtn.addEventListener('click', () => {
            console.log('[Favs] popup click toggle:', id);
            toggleFavorite(id);
          });
        }
      }
    });

    updatePopups();
    setupFavoriteListeners(updatePopups);
    
    return () => {
      if (leafletMap.current && markersRef.current) {
        leafletMap.current.removeLayer(markersRef.current);
        markersRef.current = null;
      }
    };
  }, [artworks, targetId, leafletMap.current]);

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

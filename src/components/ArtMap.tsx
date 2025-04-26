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
import { useFavorites } from '../hooks/useFavorites';
import { useMapInteractions } from '../hooks/useMapInteractions';
import MapControls from './map/MapControls';
import MapStatus from './map/MapStatus';
import MapStyles from './MapStyles';
import { getMarkerId } from '../utils/getMarkerId';
import { createMarkerIcon } from '../utils/markerIcons';

// Fix Leaflet's default icon paths
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});

const ArtMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const { artworks, setArtworks, isLoading, setIsLoading, getArtworks } = useArtworks();
  const { installState, promptInstall, dismissIOSHint } = useInstallPrompt();
  const { mapError, setMapError, loadSavedMapState, saveMapState } = useMapState();
  const { markerSize, createMarkerClusterGroup, createMarker } = useMarkers();
  const { favorites, showOnlyFavorites, setShowOnlyFavorites, toggleFavorite, isFavorite } = useFavorites();
  const { setupMapInteractions } = useMapInteractions(leafletMap, saveMapState);

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

  // Handle favorite toggling on popup click
  const setupFavoriteListeners = () => {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.fav-btn')) {
        e.preventDefault();
        const btn = target.closest('.fav-btn') as HTMLElement;
        const id = btn.dataset.id;
        
        if (id) {
          toggleFavorite(id);
          btn.classList.toggle('favourited');
          
          // Update marker appearance
          updateMarkerAppearance();
        }
      }
    });
  };

  // Update all markers based on favorite status
  const updateMarkerAppearance = () => {
    if (!markersRef.current || !leafletMap.current) return;
    
    markersRef.current.eachLayer((layer) => {
      const marker = layer as L.Marker;
      const markerId = (marker as any).markerId;
      if (!markerId) return;
      
      const shouldShow = !showOnlyFavorites || isFavorite(markerId);
      marker.setOpacity(shouldShow ? 1 : 0.2);
      
      // Recreate marker with updated favorite status
      if (leafletMap.current) {
        const artwork = artworks.find(a => getMarkerId(a) === markerId);
        if (artwork) {
          const isFav = isFavorite(markerId);
          marker.setIcon(createMarkerIcon(artwork.category.toLowerCase(), isFav));
        }
      }
    });
  };

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
    markersRef.current = markers;
    
    artworks.forEach(artwork => {
      const markerId = getMarkerId(artwork);
      const isFav = isFavorite(markerId);
      const marker = createMarker(artwork, isFav);
      markers.addLayer(marker);
      updateMarkerVisibility(marker, showOnlyFavorites, markers);
    });
    
    leafletMap.current.addLayer(markers);
    
    // Setup favorite button click handlers
    setupFavoriteListeners();
  }, [artworks]);

  // Update marker visibility when favorites or filter changes
  useEffect(() => {
    if (!markersRef.current) return;
    
    markersRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        updateMarkerVisibility(layer, showOnlyFavorites, markersRef.current!);
      }
    });
  }, [favorites, showOnlyFavorites]);

  // Setup map interactions
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

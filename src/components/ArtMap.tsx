
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
import { getMarkerId } from '../utils/getMarkerId';
import InstallBanner from './InstallBanner';
import LoadingIndicator from './LoadingIndicator';
import MapStyles from './MapStyles';
import Legend from './Legend';
import FavoritesFilter from './FavoritesFilter';

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
          const lat = 1448 - artwork.y;
          const lng = artwork.x;
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
      marker.options.alt = artwork.title;
      markers.addLayer(marker);
    });
    
    leafletMap.current.addLayer(markers);
    
    // Setup favorite button click handlers
    setupFavoriteListeners();
  }, [artworks]);

  // Update markers when favorites or filter changes
  useEffect(() => {
    if (artworks.length > 0) {
      updateMarkerAppearance();
    }
  }, [favorites, showOnlyFavorites]);

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
    <div className="relative w-full h-full z-10">
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
      <FavoritesFilter 
        showOnlyFavorites={showOnlyFavorites}
        onChange={setShowOnlyFavorites}
      />
      <Legend />
      <MapStyles />
    </div>
  );
};

export default ArtMap;

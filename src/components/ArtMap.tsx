
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
  const { loadSavedMapState, saveMapState, createZoneLayer, toggleZoneVisibility, cleanupZoneLayer } = useMapState();
  const { createMarkerClusterGroup, createMarker } = useMarkers();
  const { favorites, showOnlyFavorites, setShowOnlyFavorites, isFavorite } = useFavorites();
  const { setupMapInteractions } = useMapInteractions(leafletMap, saveMapState);
  const { setupFavoriteListeners, updateMarkerAppearance } = useMarkerUpdates();

  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('markerId');

  useMapInitialization(mapRef, leafletMap, setMapError, loadSavedMapState());
  
  // Initialize zone layer once when the map is ready
  useEffect(() => {
    if (!leafletMap.current) return;
    
    // Create zone layer and define zones
    const zoneLayer = createZoneLayer(leafletMap.current);
    
    const zones = [
      { coords: [724, 1034], radius: 200 },
      { coords: [800, 1000], radius: 150 },
      // Add more zones as needed
    ];

    // Add zone circles to the layer
    zones.forEach(z => {
      L.circle(z.coords, { 
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.2,
        radius: z.radius 
      }).addTo(zoneLayer);
    });
    
    // Initially add the zone layer to the map
    leafletMap.current.addLayer(zoneLayer);
    
    // Clean up on unmount
    return () => {
      cleanupZoneLayer();
    };
  }, [createZoneLayer, cleanupZoneLayer]);

  // Handle markers when artworks data changes
  useEffect(() => {
    if (!leafletMap.current || artworks.length === 0) return;
    
    // Remove any existing marker cluster group
    leafletMap.current.eachLayer(layer => {
      if (layer instanceof L.MarkerClusterGroup) {
        leafletMap.current!.removeLayer(layer);
      }
    });
    
    // Create a new marker cluster group
    const markers = createMarkerClusterGroup();
    markersRef.current = markers;
    
    // Create markers for each artwork
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
    
    // Add the marker cluster group to the map
    leafletMap.current.addLayer(markers);
    
    // Set up favorite listeners to update markers when favorites change
    setupFavoriteListeners(() => {
      updateMarkerAppearance(markersRef, leafletMap, artworks, showOnlyFavorites);
      toggleZoneVisibility(!showOnlyFavorites);
    });
    
    // Clean up on unmount
    return () => {
      if (leafletMap.current && markersRef.current) {
        leafletMap.current.removeLayer(markersRef.current);
        markersRef.current = null;
      }
    };
  }, [artworks, targetId]);

  // Update marker and zone visibility when favorites or filter changes
  useEffect(() => {
    if (markersRef.current) {
      updateMarkerAppearance(markersRef, leafletMap, artworks, showOnlyFavorites);
      toggleZoneVisibility(!showOnlyFavorites);
    }
  }, [favorites, showOnlyFavorites, artworks]);

  // This useEffect is now handled by useMapInitialization
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

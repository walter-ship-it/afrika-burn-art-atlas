
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import { useArtworks } from '../hooks/useArtworks';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import InstallBanner from './InstallBanner';
import LoadingIndicator from './LoadingIndicator';
import MapStyles from './MapStyles';

// Fix Leaflet's default icon paths
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});

interface MapState {
  lat: number;
  lng: number;
  zoom: number;
}

const ArtMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerSize = useRef(window.innerWidth < 360 ? 28 : 20);
  const { artworks, setArtworks, isLoading, setIsLoading, getArtworks } = useArtworks();
  const { installState, promptInstall, dismissIOSHint } = useInstallPrompt();

  // Initialize map and load data
  useEffect(() => {
    if (!mapRef.current) return;
    
    const loadArtworks = async () => {
      setIsLoading(true);
      const data = await getArtworks();
      setArtworks(data);
      setIsLoading(false);
    };
    
    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        crs: L.CRS.Simple,
        preferCanvas: true,
        fadeAnimation: false,
        minZoom: -4,
        maxZoom: 2,
        inertia: true,
        zoomControl: true,
      });
      
      const bounds = [[0, 0], [1448, 2068]];
      L.imageOverlay('/img/map.png', bounds).addTo(leafletMap.current);
      
      let initialState: MapState = {
        lat: 724,
        lng: 1034,
        zoom: -2
      };
      
      try {
        const savedState = localStorage.getItem('map-state');
        if (savedState) {
          initialState = JSON.parse(savedState) as MapState;
        }
      } catch (e) {
        console.error('Failed to parse saved map state:', e);
      }
      
      leafletMap.current.setView([initialState.lat, initialState.lng], initialState.zoom);
      leafletMap.current.fitBounds(bounds);
      
      leafletMap.current.on('moveend', () => {
        if (!leafletMap.current) return;
        
        const center = leafletMap.current.getCenter();
        const zoom = leafletMap.current.getZoom();
        
        const state: MapState = {
          lat: center.lat,
          lng: center.lng,
          zoom: zoom,
        };
        
        localStorage.setItem('map-state', JSON.stringify(state));
      });
    }

    loadArtworks();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update markers when artworks data changes
  useEffect(() => {
    if (!leafletMap.current || artworks.length === 0) return;
    
    leafletMap.current.eachLayer(layer => {
      if (layer instanceof L.MarkerClusterGroup) {
        leafletMap.current!.removeLayer(layer);
      }
    });
    
    const markers = L.markerClusterGroup({
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 1,
      showCoverageOnHover: false,
    });
    
    const markerIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: #059669; 
        opacity: 0.7;
        width: ${markerSize.current}px; 
        height: ${markerSize.current}px; 
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    
    artworks.forEach(artwork => {
      const lat = 1448 - artwork.y;
      const lng = artwork.x;
      
      const marker = L.marker([lat, lng], { icon: markerIcon })
        .bindPopup(`<b>${artwork.title}</b><br/><i>${artwork.category}</i>`)
        .bindTooltip(artwork.title, { 
          direction: 'top', 
          opacity: 0.9,
          offset: [0, -10],
        });
      
      marker.options.alt = artwork.title;
      
      markers.addLayer(marker);
    });
    
    leafletMap.current.addLayer(markers);
  }, [artworks]);

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


import { useEffect, useRef, useState } from 'react';
import { get, set } from 'idb-keyval';
import { parse } from 'csv-parse/browser/esm/sync';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Need to import Leaflet this way for proper SSR/CSR compatibility
import L from 'leaflet';

// Fix Leaflet default icon paths
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Define the artwork type
interface Artwork {
  id: string;
  title: string;
  x: number;
  y: number;
  category: string;
}

// Saved map state
interface MapState {
  lat: number;
  lng: number;
  zoom: number;
}

// Install banner states
type InstallState = 'can-install' | 'ios-hint' | 'installed' | 'not-available';

// Fix Leaflet's default icon paths
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});

const ArtMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [installState, setInstallState] = useState<InstallState>('not-available');
  const installPromptRef = useRef<any>(null);
  const markerSize = useRef(window.innerWidth < 360 ? 28 : 20);

  // Fetch artworks from CSV and cache in IndexedDB
  const getArtworks = async (): Promise<Artwork[]> => {
    const CSV_URL = 'https://raw.githubusercontent.com/walter-ship-it/learning/main/keys.csv';
    const CACHE_KEY = 'afrikaburn-artworks';
    
    try {
      // Try to get cached data first
      const cachedData = await get(CACHE_KEY);
      
      // If online, try to fetch fresh data
      if (navigator.onLine) {
        try {
          const response = await fetch(CSV_URL);
          const csvText = await response.text();
          
          // Parse CSV
          const records = parse(csvText, {
            columns: true,
            skip_empty_lines: true,
            cast: (value, context) => {
              // Convert numeric columns
              if (context.column === 'x' || context.column === 'y') {
                return Number(value);
              }
              return value;
            }
          });
          
          // Update cache
          await set(CACHE_KEY, records);
          console.log('Updated artworks cache from network');
          return records as Artwork[];
        } catch (fetchError) {
          console.error('Error fetching fresh data:', fetchError);
          // If fetch fails but we have cached data, use that
          if (cachedData) return cachedData as Artwork[];
          throw fetchError; // Re-throw if no cached data
        }
      } else {
        // Offline mode - use cached data
        if (cachedData) {
          console.log('Using cached artworks (offline)');
          return cachedData as Artwork[];
        }
        throw new Error('Offline and no cached data available');
      }
    } catch (error) {
      console.error('Error getting artworks:', error);
      return []; // Return empty array as fallback
    }
  };

  // Initialize install prompt hook
  const useInstallPrompt = () => {
    useEffect(() => {
      // Skip if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setInstallState('installed');
        return;
      }
      
      // Handle beforeinstallprompt for Chrome, Edge, etc.
      const beforeInstallHandler = (e: Event) => {
        e.preventDefault();
        installPromptRef.current = e;
        setInstallState('can-install');
      };
      
      // Handle appinstalled event
      const appInstalledHandler = () => {
        setInstallState('installed');
        installPromptRef.current = null;
      };
      
      // Check if it's iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
        setInstallState('ios-hint');
      }
      
      window.addEventListener('beforeinstallprompt', beforeInstallHandler);
      window.addEventListener('appinstalled', appInstalledHandler);
      
      return () => {
        window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
        window.removeEventListener('appinstalled', appInstalledHandler);
      };
    }, []);

    const promptInstall = async () => {
      if (installState === 'can-install' && installPromptRef.current) {
        try {
          await installPromptRef.current.prompt();
          const choiceResult = await installPromptRef.current.userChoice;
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setInstallState('installed');
          }
          installPromptRef.current = null;
        } catch (err) {
          console.error('Error prompting install:', err);
        }
      }
    };

    const dismissIOSHint = () => {
      if (installState === 'ios-hint') {
        setInstallState('not-available');
        localStorage.setItem('ios-install-dismissed', 'true');
      }
    };

    // Check if iOS hint was previously dismissed
    useEffect(() => {
      if (installState === 'ios-hint' && localStorage.getItem('ios-install-dismissed') === 'true') {
        setInstallState('not-available');
      }
    }, [installState]);

    return { installState, promptInstall, dismissIOSHint };
  };

  const { promptInstall, dismissIOSHint } = useInstallPrompt();

  // Initialize map and load data
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Fetch artworks
    const loadArtworks = async () => {
      setIsLoading(true);
      const data = await getArtworks();
      setArtworks(data);
      setIsLoading(false);
    };
    
    // Initialize Leaflet map if it doesn't exist
    if (!leafletMap.current) {
      // Create map with custom options
      leafletMap.current = L.map(mapRef.current, {
        crs: L.CRS.Simple,
        preferCanvas: true,
        fadeAnimation: false,
        minZoom: -4,
        maxZoom: 2,
        inertia: true,
        zoomControl: true,
      });
      
      // Add map image as overlay
      const bounds = [[0, 0], [1448, 2068]];
      L.imageOverlay('/img/map.png', bounds).addTo(leafletMap.current);
      
      // Try to restore previous map state
      let initialState: MapState = {
        lat: 724, // center of height
        lng: 1034, // center of width
        zoom: -2
      };
      
      try {
        const savedState = localStorage.getItem('map-state');
        if (savedState) {
          const parsed = JSON.parse(savedState) as MapState;
          initialState = parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved map state:', e);
      }
      
      // Set view to initial position
      leafletMap.current.setView([initialState.lat, initialState.lng], initialState.zoom);
      leafletMap.current.fitBounds(bounds);
      
      // Save map state on move
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
    
    // Remove existing markers layer if present
    leafletMap.current.eachLayer(layer => {
      if (layer instanceof L.MarkerClusterGroup) {
        leafletMap.current!.removeLayer(layer);
      }
    });
    
    // Create marker cluster group
    const markers = L.markerClusterGroup({
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 1,
      showCoverageOnHover: false,
    });
    
    // Create custom marker icon
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
      iconSize: [24, 24], // For hit area
      iconAnchor: [12, 12],
    });
    
    // Add markers for each artwork
    artworks.forEach(artwork => {
      // Invert Y coordinate from Figma's system
      const lat = 1448 - artwork.y;
      const lng = artwork.x;
      
      // Create marker with popup
      const marker = L.marker([lat, lng], { icon: markerIcon })
        .bindPopup(`<b>${artwork.title}</b><br/><i>${artwork.category}</i>`)
        .bindTooltip(artwork.title, { 
          direction: 'top', 
          opacity: 0.9,
          offset: [0, -10],
        });
      
      // Add ARIA label for accessibility
      marker.options.alt = artwork.title;
      
      markers.addLayer(marker);
    });
    
    // Add markers to map
    leafletMap.current.addLayer(markers);
  }, [artworks]);

  // Handle window resize for marker size adjustment
  useEffect(() => {
    const handleResize = () => {
      const newSize = window.innerWidth < 360 ? 28 : 20;
      if (newSize !== markerSize.current) {
        markerSize.current = newSize;
        // Force re-render of markers
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
      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full h-screen"
        aria-label="AfrikaBurn Art Map"
        role="application"
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-4 rounded-lg shadow-md z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading artworks...</span>
          </div>
        </div>
      )}
      
      {/* Install banner */}
      {installState === 'can-install' && (
        <div className="absolute top-0 left-0 right-0 bg-emerald-700 text-white p-3 flex justify-between items-center z-[1001]">
          <div className="font-medium">Download offline – no signal at AfrikaBurn</div>
          <div className="flex gap-2">
            <button 
              onClick={promptInstall}
              className="px-3 py-1 bg-white text-emerald-800 rounded-md font-medium"
            >
              Install
            </button>
          </div>
        </div>
      )}
      
      {/* iOS install hint */}
      {installState === 'ios-hint' && (
        <div className="absolute top-0 left-0 right-0 bg-emerald-700 text-white p-3 flex justify-between items-center z-[1001]">
          <div className="font-medium">Download offline – no signal at AfrikaBurn</div>
          <div className="flex gap-2">
            <button 
              onClick={() => alert("Tap Share icon → Add to Home Screen")}
              className="px-3 py-1 bg-white text-emerald-800 rounded-md font-medium"
            >
              How to Install
            </button>
            <button 
              onClick={dismissIOSHint}
              className="px-2 py-1 text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Custom marker style */}
      <style jsx>{`
        /* Ensure Leaflet container takes full height */
        :global(.leaflet-container) {
          height: 100%;
          width: 100%;
        }
        
        /* Style cluster markers */
        :global(.marker-cluster-small),
        :global(.marker-cluster-medium),
        :global(.marker-cluster-large) {
          background-color: rgba(5, 150, 105, 0.4) !important;
        }
        
        :global(.marker-cluster-small div),
        :global(.marker-cluster-medium div),
        :global(.marker-cluster-large div) {
          background-color: rgba(5, 150, 105, 0.7) !important;
          color: white !important;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default ArtMap;


import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';

export interface MapState {
  lat: number;
  lng: number;
  zoom: number;
}

const ZONES = [
  { coords: [724, 1034], radius: 200 },
  { coords: [800, 1000], radius: 150 },
];

export const useMapState = () => {
  const [mapError, setMapError] = useState<string | null>(null);
  const zoneLayerRef = useRef<L.LayerGroup | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const lastToggleTimeRef = useRef<number>(0);
  const zoneLayerIdRef = useRef<string>(`zone-layer-${Date.now()}`);
  const zoneCirclesRef = useRef<L.Circle[]>([]);
  const isZoneLayerInitializedRef = useRef<boolean>(false);

  const loadSavedMapState = () => {
    try {
      const savedState = localStorage.getItem('map-state');
      if (savedState) {
        return JSON.parse(savedState) as MapState;
      }
    } catch (e) {
      console.error('[Debug] Failed to parse saved map state:', e);
    }
    
    return {
      lat: 724,
      lng: 1034,
      zoom: -2
    };
  };

  const saveMapState = (state: MapState) => {
    localStorage.setItem('map-state', JSON.stringify(state));
  };

  const createZoneLayer = (map: L.Map) => {
    // Skip if map is not valid
    if (!map) {
      console.log('[Zones] ❌ Map is null, skipping zone layer creation');
      return null;
    }

    // Skip if map container is not in DOM
    try {
      if (!map._container || !document.body.contains(map._container)) {
        console.log('[Zones] ⚠️ Map container not in DOM, skipping zone layer creation');
        return null;
      }
      
      // Skip if map is being removed or invalid
      if (!map._panes || !map._mapPane) {
        console.log('[Zones] ⚠️ Map panes not available, map may be in process of being removed');
        return null;
      }
    } catch (e) {
      console.error('[Zones] Error checking map state:', e);
      return null;
    }
    
    // Enforce singleton pattern
    if (zoneLayerRef.current) {
      console.log('[Zones] ❗ Zone layer already exists with ID:', zoneLayerIdRef.current);
      return zoneLayerRef.current;
    }
    
    if (isZoneLayerInitializedRef.current) {
      console.log('[Zones] ❗ Zone layer was previously initialized, preventing recreation');
      return null;
    }
    
    isZoneLayerInitializedRef.current = true;
    console.log('[Zones] ✅ Creating new zone layer with ID:', zoneLayerIdRef.current);
    
    try {
      // Create new layer group with unique ID
      const layerGroup = L.layerGroup([], { id: zoneLayerIdRef.current });
      zoneLayerRef.current = layerGroup;
      
      // Store map reference
      mapRef.current = map;
      
      // Clear previous circles if any
      zoneCirclesRef.current = [];
      
      // Add zone circles
      ZONES.forEach((zone, index) => {
        console.log(`[Zones] Adding zone circle ${index + 1}:`, zone);
        try {
          const circle = L.circle(zone.coords, {
            color: 'green',
            fillColor: 'green',
            fillOpacity: 0.2,
            radius: zone.radius
          });
          
          zoneCirclesRef.current.push(circle);
          
          // Only add to layer if both are valid
          if (layerGroup && circle) {
            circle.addTo(layerGroup);
          }
        } catch (e) {
          console.error(`[Zones] Failed to create circle ${index + 1}:`, e);
        }
      });

      console.log('[Zones] Layer created successfully with', 
        zoneLayerRef.current ? Object.keys(zoneLayerRef.current._layers).length : 0, 'circles');
      
      return zoneLayerRef.current;
    } catch (e) {
      console.error('[Zones] Error creating zone layer:', e);
      isZoneLayerInitializedRef.current = false; // Reset flag to allow retry
      return null;
    }
  };

  const toggleZoneVisibility = (showOnlyFavorites: boolean) => {
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 300) {
      console.log('[Zones] 🔄 Debouncing toggle');
      return;
    }
    lastToggleTimeRef.current = now;
    
    if (!zoneLayerRef.current || !mapRef.current) {
      console.warn('[Zones] ❌ Zone layer or map reference is null');
      return;
    }
    
    // Safely check if map is still valid
    try {
      // Skip if map container not available
      if (!mapRef.current._container || !document.body.contains(mapRef.current._container)) {
        console.warn('[Zones] ❌ Map container no longer exists');
        return;
      }
      
      // Skip if map is being destroyed or invalid
      if (!mapRef.current._panes || !mapRef.current._mapPane) {
        console.log('[Zones] ⚠️ Map panes not available, map may be in process of being removed');
        return;
      }
    } catch (e) {
      console.error('[Zones] Error checking map state:', e);
      return;
    }

    console.log('[Zones] toggleZoneVisibility called – showOnly:', showOnlyFavorites);
    const layer = zoneLayerRef.current;
    const map = mapRef.current;
    
    try {
      const present = map.hasLayer(layer);
      console.log('[Zones] before toggle – layer present on map?:', present);

      // Simple logic: hide when showing favorites, show when not showing favorites
      if (showOnlyFavorites) {
        if (present) {
          console.log('[Zones] ➖ removing zoneLayer');
          try {
            map.removeLayer(layer);
          } catch (e) {
            console.error('[Zones] Error removing layer:', e);
          }
        } else {
          console.log('[Zones] ℹ️ not present, skip remove');
        }
      } else {
        if (!present) {
          console.log('[Zones] ➕ adding zoneLayer');
          try {
            map.addLayer(layer);
          } catch (e) {
            console.error('[Zones] Error adding layer:', e);
            // If adding fails, recreate the layer
            if (map && map._container && document.body.contains(map._container)) {
              isZoneLayerInitializedRef.current = false;
              zoneLayerRef.current = null;
              createZoneLayer(map);
            }
          }
        } else {
          console.log('[Zones] ℹ️ already present, skip add');
        }
      }
      
      console.log('[Zones] after toggle – hasLayer?:', map.hasLayer(layer));
    } catch (e) {
      console.error('[Zones] Error toggling zone visibility:', e);
    }
  };

  const cleanupZoneLayer = () => {
    console.log('[Zones] 🧹 Cleaning up zone layer');
    
    try {
      // First check if the map exists and has a container
      if (mapRef.current) {
        try {
          // Check if map is still valid with a container in the DOM
          if (mapRef.current._container && document.body.contains(mapRef.current._container)) {
            // Then check if layer exists on map
            if (zoneLayerRef.current) {
              console.log('[Zones] Checking if layer exists on map:', mapRef.current.hasLayer(zoneLayerRef.current));
              try {
                if (mapRef.current.hasLayer(zoneLayerRef.current)) {
                  console.log('[Zones] Removing zone layer from map');
                  mapRef.current.removeLayer(zoneLayerRef.current);
                }
              } catch (e) {
                console.error('[Zones] Error removing layer from map:', e);
              }
            }
          } else {
            console.log('[Zones] Map container already removed, skipping layer removal');
          }
        } catch (e) {
          console.error('[Zones] Error checking map state during cleanup:', e);
        }
      } else {
        console.log('[Zones] Map reference missing, skipping layer cleanup');
      }
      
      // Clear circles references
      zoneCirclesRef.current = [];
      
      // Reset zone layer creation flag
      isZoneLayerInitializedRef.current = false;
      
    } catch (e) {
      console.error('[Zones] Error during cleanup:', e);
    }
    
    // Always clean up the reference
    zoneLayerRef.current = null;
    mapRef.current = null;
  };

  return {
    mapError,
    setMapError,
    loadSavedMapState,
    saveMapState,
    createZoneLayer,
    toggleZoneVisibility,
    cleanupZoneLayer
  };
};

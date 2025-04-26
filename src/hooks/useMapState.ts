
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

  const loadSavedMapState = () => {
    try {
      const savedState = localStorage.getItem('map-state');
      if (savedState) {
        return JSON.parse(savedState) as MapState;
      }
    } catch (e) {
      console.error('Failed to parse saved map state:', e);
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
    // Enforce singleton pattern
    if (zoneLayerRef.current) {
      console.log('[Zones] ❗ Zone layer already exists, reusing existing one with ID:', zoneLayerIdRef.current);
      return zoneLayerRef.current;
    }
    
    // Safety check to ensure map is ready
    if (!map._container) {
      console.log('[Zones] ⚠️ Map container not ready, skipping zone layer creation');
      return null;
    }
    
    console.log('[Zones] ✅ Creating new zone layer with ID:', zoneLayerIdRef.current);
    
    try {
      // Create new layer group with unique ID
      zoneLayerRef.current = L.layerGroup([], { id: zoneLayerIdRef.current });
      
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
          circle.addTo(zoneLayerRef.current!);
        } catch (e) {
          console.error(`[Zones] Failed to create circle ${index + 1}:`, e);
        }
      });

      console.log('[Zones] Layer created successfully with', Object.keys(zoneLayerRef.current._layers).length, 'circles');
      
      // Add the layer to the map here, just once
      if (map._container) {
        map.addLayer(zoneLayerRef.current);
        console.log('[Zones] Layer added to map');
      } else {
        console.log('[Zones] ⚠️ Map container not available, layer not added');
        return null;
      }
      
      return zoneLayerRef.current;
    } catch (e) {
      console.error('[Zones] Error creating zone layer:', e);
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
    
    // Skip if map container not available
    if (!mapRef.current._container) {
      console.warn('[Zones] ❌ Map container no longer exists');
      return;
    }

    console.log('[Zones] toggleZoneVisibility called – showOnly:', showOnlyFavorites);
    const layer = zoneLayerRef.current;
    const map = mapRef.current;
    const present = map.hasLayer(layer);
    console.log('[Zones] before toggle – hasLayer?:', present);

    try {
      // Simple logic: hide when showing favorites, show when not showing favorites
      if (showOnlyFavorites) {
        if (present) {
          console.log('[Zones] ➖ removing zoneLayer');
          map.removeLayer(layer);
        } else {
          console.log('[Zones] ℹ️ not present, skip remove');
        }
      } else {
        if (!present) {
          console.log('[Zones] ➕ adding zoneLayer');
          map.addLayer(layer);
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
      if (mapRef.current && mapRef.current._container) {
        // Then check if layer exists on map
        if (zoneLayerRef.current) {
          console.log('[Zones] Checking if layer exists on map:', mapRef.current.hasLayer(zoneLayerRef.current));
          if (mapRef.current.hasLayer(zoneLayerRef.current)) {
            console.log('[Zones] Removing zone layer from map');
            mapRef.current.removeLayer(zoneLayerRef.current);
          }
          
          // Clear all circles individually first
          zoneCirclesRef.current.forEach(circle => {
            if (zoneLayerRef.current) {
              zoneLayerRef.current.removeLayer(circle);
            }
          });
          
          // Then clear the layer
          if (zoneLayerRef.current) {
            zoneLayerRef.current.clearLayers();
          }
        }
      } else {
        console.log('[Zones] Map reference missing or container already removed, skipping layer cleanup');
      }
    } catch (e) {
      console.error('[Zones] Error during cleanup:', e);
    }
    
    // Reset references regardless of errors
    zoneCirclesRef.current = [];
    zoneLayerRef.current = null;
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

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
    console.log('[Zones] Creating zone layer with ID:', zoneLayerIdRef.current);
    
    if (zoneLayerRef.current) {
      console.log('[Zones] ⚠️ Existing zone layer found, cleaning up first');
      cleanupZoneLayer();
    }
    
    zoneLayerRef.current = L.layerGroup([], { id: zoneLayerIdRef.current });
    
    // Add zone circles
    ZONES.forEach((zone, index) => {
      console.log(`[Zones] Adding zone circle ${index + 1}:`, zone);
      L.circle(zone.coords, {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.2,
        radius: zone.radius
      }).addTo(zoneLayerRef.current!);
    });

    mapRef.current = map;
    console.log('[Zones] Zone layer created successfully');
    
    return zoneLayerRef.current;
  };

  useEffect(() => {
    console.log('[Zones] ⚙️ initializing zoneLayer');
    if (!zoneLayerRef.current && mapRef.current) {
      zoneLayerRef.current = createZoneLayer(mapRef.current);
      mapRef.current.addLayer(zoneLayerRef.current);
      console.log('[Zones] created zoneLayer:', zoneLayerRef.current);
    }
  }, []); // Empty deps array for single initialization

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

    console.log('[Zones] toggleZoneVisibility called – showOnly:', showOnlyFavorites);
    const layer = zoneLayerRef.current;
    const map = mapRef.current;
    const present = map.hasLayer(layer);
    console.log('[Zones] before toggle – hasLayer?:', present);

    if (!showOnlyFavorites) {
      if (!present) {
        console.log('[Zones] ➕ adding zoneLayer');
        map.addLayer(layer);
      } else {
        console.log('[Zones] ℹ️ already present, skip add');
      }
    } else {
      if (present) {
        console.log('[Zones] ➖ removing zoneLayer');
        map.removeLayer(layer);
      } else {
        console.log('[Zones] ℹ️ not present, skip remove');
      }
    }
    
    console.log('[Zones] after toggle – hasLayer?:', map.hasLayer(layer));
  };

  const cleanupZoneLayer = () => {
    console.log('[Zones] 🧹 Cleaning up zone layer');
    if (zoneLayerRef.current && mapRef.current) {
      if (mapRef.current.hasLayer(zoneLayerRef.current)) {
        console.log('[Zones] Removing zone layer from map');
        mapRef.current.removeLayer(zoneLayerRef.current);
      }
      zoneLayerRef.current.clearLayers();
      zoneLayerRef.current = null;
    }
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

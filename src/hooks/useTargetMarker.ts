
import { useEffect } from 'react';
import L from 'leaflet';
import { toast } from 'sonner';
import { handleTargetMarker } from '../components/map/TargetMarker';
import { Artwork } from './useArtworks';
import { getMarkerId } from '../utils/getMarkerId';

export const useTargetMarker = (
  markersRef: React.RefObject<L.MarkerClusterGroup | null>,
  leafletMap: React.RefObject<L.Map | null>,
  targetId: string | null,
  artworks: Artwork[]
) => {
  useEffect(() => {
    if (!targetId || !markersRef.current || !leafletMap.current) return;

    console.log('[TargetMarker] Attempting to find and highlight marker:', targetId);
    
    // Find the artwork corresponding to the target ID
    const artwork = artworks.find(art => getMarkerId(art) === targetId);
    if (!artwork) {
      console.log('[TargetMarker] Artwork not found for ID:', targetId);
      toast.error('Could not find the selected artwork on the map');
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;
    const attemptInterval = 500;

    const findAndHighlightMarker = () => {
      let markerFound = false;
      
      markersRef.current?.eachLayer((layer) => {
        const marker = layer as L.Marker;
        if ((marker as any).markerId === targetId) {
          console.log('[TargetMarker] Found target marker, highlighting...');
          handleTargetMarker({ marker, artwork, leafletMap: leafletMap.current! });
          markerFound = true;
        }
      });

      if (!markerFound && attempts < maxAttempts) {
        attempts++;
        console.log(`[TargetMarker] Marker not found, attempt ${attempts}/${maxAttempts}`);
        setTimeout(findAndHighlightMarker, attemptInterval);
      } else if (!markerFound) {
        console.log('[TargetMarker] Failed to find marker after all attempts');
        toast.error('Could not highlight the selected artwork on the map');
      }
    };

    findAndHighlightMarker();
  }, [targetId, markersRef.current, leafletMap.current]);
};

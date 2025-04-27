
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
    if (!targetId || !artworks.length) return;

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
      // Check if references are valid before proceeding
      if (!markersRef.current || !leafletMap.current) {
        console.log('[TargetMarker] Map or markers not ready, waiting...');
        
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(findAndHighlightMarker, attemptInterval);
        } else {
          console.log('[TargetMarker] Map initialization timed out');
          toast.error('Map is not ready, please try again');
        }
        return;
      }
      
      // Verify map is valid and in DOM
      try {
        if (!leafletMap.current.getContainer() || !document.body.contains(leafletMap.current.getContainer())) {
          console.log('[TargetMarker] Map container not in DOM');
          return;
        }
      } catch (e) {
        console.error('[TargetMarker] Error checking map container:', e);
        return;
      }
      
      try {
        let markerFound = false;
        
        markersRef.current.eachLayer((layer) => {
          if (!leafletMap.current) return;
          
          const marker = layer as L.Marker;
          if ((marker as any).markerId === targetId) {
            console.log('[TargetMarker] Found target marker, highlighting...');
            
            try {
              handleTargetMarker({
                marker,
                artwork,
                leafletMap: leafletMap.current
              });
              markerFound = true;
            } catch (e) {
              console.error('[TargetMarker] Error highlighting marker:', e);
            }
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
      } catch (e) {
        console.error('[TargetMarker] Error processing markers:', e);
      }
    };

    // Start with a small delay to ensure map is initialized
    setTimeout(findAndHighlightMarker, 300);
    
    // Cleanup function
    return () => {
      console.log('[TargetMarker] Cleanup');
      // Nothing specific to clean up here
    };
  }, [targetId, markersRef.current, leafletMap.current, artworks]);
};

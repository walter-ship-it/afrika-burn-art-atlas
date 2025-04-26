
import { useState, useEffect } from 'react';
import { useArtworks } from './useArtworks';

export const useArtworkLoading = () => {
  const { artworks, setArtworks, isLoading, setIsLoading, getArtworks } = useArtworks();
  const [mapError, setMapError] = useState<string | null>(null);

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

  return { artworks, isLoading, mapError, setMapError };
};

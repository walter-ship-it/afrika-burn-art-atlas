
import { useState } from 'react';
import { get, set } from 'idb-keyval';
import { parse } from 'csv-parse/browser/esm/sync';

export interface Artwork {
  id: string;
  title: string;
  x: number;
  y: number;
  category: string;
}

export const useArtworks = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getArtworks = async (): Promise<Artwork[]> => {
    const CSV_URL = 'https://raw.githubusercontent.com/walter-ship-it/afrika-burn-art-atlas/main/keys.csv';
    const CACHE_KEY = 'afrikaburn-artworks';
    
    try {
      const cachedData = await get(CACHE_KEY);
      
      if (navigator.onLine) {
        try {
          const response = await fetch(CSV_URL);
          const csvText = await response.text();
          
          const records = parse(csvText, {
            columns: true,
            skip_empty_lines: true,
            cast: (value, context) => {
              if (context.column === 'x' || context.column === 'y') {
                return Number(value);
              }
              return value;
            }
          });
          
          await set(CACHE_KEY, records);
          console.log('Updated artworks cache from network');
          return records as Artwork[];
        } catch (fetchError) {
          console.error('Error fetching fresh data:', fetchError);
          if (cachedData) return cachedData as Artwork[];
          throw fetchError;
        }
      } else {
        if (cachedData) {
          console.log('Using cached artworks (offline)');
          return cachedData as Artwork[];
        }
        throw new Error('Offline and no cached data available');
      }
    } catch (error) {
      console.error('Error getting artworks:', error);
      return [];
    }
  };

  return { artworks, setArtworks, isLoading, setIsLoading, getArtworks };
};


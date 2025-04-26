import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/sonner';

const FAV_KEY = 'ab-favs';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [hasShownNotice, setHasShownNotice] = useState<boolean>(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const loadedFavorites = loadFavorites();
    setFavorites(loadedFavorites);
    
    const hasShown = localStorage.getItem('ab-fav-notice-shown');
    setHasShownNotice(!!hasShown);
  }, []);

  const loadFavorites = (): Set<string> => {
    try {
      return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
    } catch (e) {
      console.error('Failed to load favorites:', e);
      return new Set();
    }
  };

  const saveFavorites = useCallback((favSet: Set<string>) => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify([...favSet]));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        
        if (!hasShownNotice && next.size === 1) {
          toast("Favourites are saved in your browser only. Clearing site data will remove them.");
          localStorage.setItem('ab-fav-notice-shown', 'true');
          setHasShownNotice(true);
        }
      }
      
      saveFavorites(next);
      return next;
    });
  }, [hasShownNotice, saveFavorites]);

  const isFavorite = useCallback((id: string): boolean => {
    return favorites.has(id);
  }, [favorites]);

  return {
    favorites,
    showOnlyFavorites,
    setShowOnlyFavorites,
    toggleFavorite,
    isFavorite
  };
};

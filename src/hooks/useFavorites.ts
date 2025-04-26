
import { useEffect, useState } from 'react';
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
    
    // Check if we've shown the notice before
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

  const saveFavorites = (favSet: Set<string>) => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify([...favSet]));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
      
      // Show notice the first time a favorite is added
      if (!hasShownNotice && newFavorites.size === 1) {
        toast("Favourites are saved in your browser only. Clearing site data will remove them.");
        localStorage.setItem('ab-fav-notice-shown', 'true');
        setHasShownNotice(true);
      }
    }
    
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
    return newFavorites;
  };

  const isFavorite = (id: string): boolean => {
    return favorites.has(id);
  };

  return {
    favorites,
    showOnlyFavorites,
    setShowOnlyFavorites,
    toggleFavorite,
    isFavorite
  };
};

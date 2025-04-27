
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';

// Actions for our reducer
type Action =
  | { type: 'INIT'; payload: string[] }
  | { type: 'TOGGLE'; payload: string }
  | { type: 'SET_FILTER'; payload: boolean };

// Our state interface
interface FavoritesState {
  favorites: Set<string>;
  showOnlyFavorites: boolean;
}

// Reducer function to handle state updates
function favoritesReducer(state: FavoritesState, action: Action): FavoritesState {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        favorites: new Set(action.payload)
      };
    case 'TOGGLE': {
      const next = new Set(state.favorites);
      if (state.favorites.has(action.payload)) {
        next.delete(action.payload);
      } else {
        next.add(action.payload);
      }
      return {
        ...state,
        favorites: next
      };
    }
    case 'SET_FILTER':
      return {
        ...state,
        showOnlyFavorites: action.payload
      };
    default:
      return state;
  }
}

// Context shape
interface FavoritesContextType {
  favorites: Set<string>;
  showOnlyFavorites: boolean;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setShowOnlyFavorites: (show: boolean) => void;
}

// Create the context
const FavoritesContext = createContext<FavoritesContextType | null>(null);

// Constants
const FAV_KEY = 'ab-favs';
const NOTICE_KEY = 'ab-fav-notice-shown';

// Provider component
export const FavoritesProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, {
    favorites: new Set<string>(),
    showOnlyFavorites: false
  });

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const storedFavorites = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
      dispatch({ type: 'INIT', payload: storedFavorites });
      
      // Check if notice has been shown
      const hasShownNotice = localStorage.getItem(NOTICE_KEY);
      if (!hasShownNotice && storedFavorites.length > 0) {
        toast("Favourites are saved in your browser only. Clearing site data will remove them.");
        localStorage.setItem(NOTICE_KEY, 'true');
      }
    } catch (e) {
      console.error('Failed to load favorites:', e);
    }
  }, []);

  // Persist favorites whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify([...state.favorites]));
      
      // Show notice on first favorite
      if (state.favorites.size === 1 && !localStorage.getItem(NOTICE_KEY)) {
        toast("Favourites are saved in your browser only. Clearing site data will remove them.");
        localStorage.setItem(NOTICE_KEY, 'true');
      }
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  }, [state.favorites]);

  // Helper functions
  const toggleFavorite = (id: string) => {
    dispatch({ type: 'TOGGLE', payload: id });
  };

  const isFavorite = (id: string) => {
    return state.favorites.has(id);
  };

  const setShowOnlyFavorites = (show: boolean) => {
    dispatch({ type: 'SET_FILTER', payload: show });
  };

  const contextValue: FavoritesContextType = {
    favorites: state.favorites,
    showOnlyFavorites: state.showOnlyFavorites,
    toggleFavorite,
    isFavorite,
    setShowOnlyFavorites,
  };

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook to use the context
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === null) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

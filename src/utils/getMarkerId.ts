
import { Artwork } from "../hooks/useArtworks";

export const getMarkerId = (artwork: Artwork): string => {
  // Create a stable ID using both title and coordinates
  // Title is slugified (spaces replaced with underscores) to avoid issues with special characters
  return `${artwork.title.trim().replace(/\s+/g, '_')}_${artwork.x}_${artwork.y}`;
};

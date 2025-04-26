
import { Artwork } from "../hooks/useArtworks";

export const getMarkerId = (artwork: Artwork): string => {
  return `${artwork.title.trim()}_${artwork.x}_${artwork.y}`;
};

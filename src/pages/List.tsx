
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapIcon, Star } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useArtworks } from "@/hooks/useArtworks";
import { useEffect, useState } from "react";
import { categoryColors, Category } from "@/utils/colors";
import { getMarkerId } from "@/utils/getMarkerId";
import { ArtworkModal } from "@/components/ArtworkModal";
import { Artwork } from "@/hooks/useArtworks";
import { useFavorites } from "@/context/FavoritesContext";
import { cn } from "@/lib/utils";

const List = () => {
  const { artworks, isLoading, getArtworks, setArtworks, setIsLoading } = useArtworks();
  const { isFavorite, toggleFavorite, showOnlyFavorites, setShowOnlyFavorites } = useFavorites();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const data = await getArtworks();
      setArtworks(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleViewOnMap = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    const markerId = getMarkerId(artwork);
    navigate(`/?markerId=${encodeURIComponent(markerId)}`);
  };

  const displayedArtworks = showOnlyFavorites 
    ? artworks.filter(artwork => isFavorite(getMarkerId(artwork)))
    : artworks;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Camp & Art Directory</h1>
        <Button variant="outline" asChild>
          <Link to="/" className="flex items-center gap-2">
            <MapIcon className="w-4 h-4" />
            View Map
          </Link>
        </Button>
      </div>

      <div className="mb-4 flex items-center">
        <div className="form-control">
          <label className="flex items-center cursor-pointer gap-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={showOnlyFavorites}
              onChange={() => setShowOnlyFavorites(!showOnlyFavorites)}
            />
            <span className="label-text flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              Show only favorites
            </span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableCaption>A list of all camps and artworks.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedArtworks.map((item) => {
              const markerId = getMarkerId(item);
              const isFav = isFavorite(markerId);
              
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.title}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(markerId);
                        }} 
                        className="ml-2"
                      >
                        <Star className={cn(
                          "h-4 w-4", 
                          isFav ? "text-amber-500 fill-amber-500" : "text-gray-400"
                        )} />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                      style={{
                        backgroundColor: categoryColors[item.category as Category] + '20',
                        color: categoryColors[item.category as Category],
                      }}
                    >
                      {item.category.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <button 
                      onClick={() => handleViewOnMap(item)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View on map
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ArtworkModal 
        artwork={selectedArtwork}
        open={selectedArtwork !== null}
        onClose={() => setSelectedArtwork(null)}
      />
    </div>
  );
};

export default List;

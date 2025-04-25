
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useArtworks } from "@/hooks/useArtworks";
import { useEffect } from "react";
import { categoryColors, Category } from "@/utils/colors";

const List = () => {
  const { artworks, isLoading, getArtworks, setArtworks, setIsLoading } = useArtworks();

  useEffect(() => {
    const loadData = async () => {
      const data = await getArtworks();
      setArtworks(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableCaption>A list of all camps and artworks.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artworks.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.title}</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default List;

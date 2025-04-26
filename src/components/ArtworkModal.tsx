
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Artwork } from "@/hooks/useArtworks";
import { categoryColors, Category } from "@/utils/colors";

interface ArtworkModalProps {
  artwork: Artwork | null;
  open: boolean;
  onClose: () => void;
}

export function ArtworkModal({ artwork, open, onClose }: ArtworkModalProps) {
  if (!artwork) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{artwork.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
            style={{
              backgroundColor: categoryColors[artwork.category as Category] + '20',
              color: categoryColors[artwork.category as Category],
            }}
          >
            {artwork.category.replace('_', ' ')}
          </span>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Location: ({artwork.x}, {artwork.y})</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

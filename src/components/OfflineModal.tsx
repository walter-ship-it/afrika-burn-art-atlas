
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface OfflineModalProps {
  open: boolean;
  onClose: () => void;
}

const OfflineModal = ({ open, onClose }: OfflineModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4">Offline Access Guide</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-left">
          <section>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">🔌 Using the map offline</h2>
            <p className="mb-3">I tried making this map work perfectly offline — but Safari had other ideas. Despite all the caching magic, it only works offline if you follow these steps:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Open the app at least once while online</li>
              <li>Don't fully close the app (just switch away or hide it)</li>
              <li>It'll keep working, even in airplane mode</li>
            </ul>
            <p className="mt-3 text-destructive">If you fully close it and try to reopen offline, Safari throws an error.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">📲 How to install the app</h2>
            <p className="mb-3">Want a better experience with full-screen and easy access? You can add this app to your home screen like a native app:</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">On iPhone (Safari):</h3>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Tap the Share icon at the bottom of Safari</li>
                  <li>Scroll and tap "Add to Home Screen"</li>
                  <li>Tap Add</li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium mb-2">On Android (Chrome):</h3>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Tap the menu (⋮) icon</li>
                  <li>Select "Add to Home screen"</li>
                  <li>Tap Add</li>
                </ol>
              </div>
            </div>

            <p className="mt-4 text-muted-foreground">Once it's installed, just open it once while connected — then you're good to go, as long as you don't close it completely.</p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfflineModal;

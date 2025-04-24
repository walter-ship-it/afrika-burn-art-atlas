
import { useEffect } from "react";
import ArtMap from "../components/ArtMap";
import { registerServiceWorker } from "../registerSW";

const Index = () => {
  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ArtMap />
    </div>
  );
};

export default Index;

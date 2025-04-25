
import { useEffect } from "react";
import ArtMap from "../components/ArtMap";
import { registerSW } from "../registerSW";

const Index = () => {
  // Register service worker on mount
  useEffect(() => {
    registerSW();
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ArtMap />
    </div>
  );
};

export default Index;

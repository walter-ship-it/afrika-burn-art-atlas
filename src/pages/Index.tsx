
import ArtMap from "../components/ArtMap";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ListIcon } from "lucide-react";

const Index = () => {
  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <Button 
        variant="outline" 
        className="absolute top-4 right-4 z-50 bg-white"
        asChild
      >
        <Link to="/list" className="flex items-center gap-2">
          <ListIcon className="w-4 h-4" />
          View List
        </Link>
      </Button>
      <ArtMap />
    </div>
  );
};

export default Index;

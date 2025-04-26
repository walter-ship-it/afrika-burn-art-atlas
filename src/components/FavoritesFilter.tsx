
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface FavoritesFilterProps {
  showOnlyFavorites: boolean;
  onChange: (show: boolean) => void;
}

const FavoritesFilter: React.FC<FavoritesFilterProps> = ({
  showOnlyFavorites,
  onChange
}) => {
  return (
    <div className="favorites-filter">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="show-favorites" 
          checked={showOnlyFavorites} 
          onCheckedChange={(checked) => onChange(checked === true)}
        />
        <Label 
          htmlFor="show-favorites" 
          className="text-sm font-medium flex items-center gap-1 cursor-pointer"
        >
          <Star className="w-3 h-3 fill-current text-[#b03060]" /> 
          Show only favourites
        </Label>
      </div>
    </div>
  );
};

export default FavoritesFilter;

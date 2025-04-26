
import React from 'react';
import FavoritesFilter from '../FavoritesFilter';
import Legend from '../Legend';
import InstallBanner from '../InstallBanner';
import { InstallState } from '../../hooks/useInstallPrompt';

interface MapControlsProps {
  installState: InstallState;
  promptInstall: () => void;
  dismissIOSHint: () => void;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (show: boolean) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  installState,
  promptInstall,
  dismissIOSHint,
  showOnlyFavorites,
  setShowOnlyFavorites,
}) => {
  return (
    <>
      <InstallBanner
        installState={installState}
        promptInstall={promptInstall}
        dismissIOSHint={dismissIOSHint}
      />
      <FavoritesFilter 
        showOnlyFavorites={showOnlyFavorites}
        onChange={setShowOnlyFavorites}
      />
      <Legend />
    </>
  );
};

export default MapControls;

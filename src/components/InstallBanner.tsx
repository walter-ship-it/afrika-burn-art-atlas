
import { useState } from 'react';
import { InstallState } from '../hooks/useInstallPrompt';
import OfflineModal from './OfflineModal';

interface InstallBannerProps {
  installState: InstallState;
  promptInstall: () => void;
  dismissIOSHint: () => void;
}

const InstallBanner = ({ installState, promptInstall, dismissIOSHint }: InstallBannerProps) => {
  const [showModal, setShowModal] = useState(false);

  if (installState === 'installed') return null;

  const handleBannerClick = () => {
    setShowModal(true);
  };

  const bannerContent = (
    <div className="absolute top-0 left-0 right-0 bg-emerald-700 text-white p-3 flex justify-between items-center z-[1001] cursor-pointer" onClick={handleBannerClick}>
      <div className="font-medium">Want offline access? Tap here to learn how to install & use the map offline</div>
      {installState === 'ios-hint' && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            dismissIOSHint();
          }}
          className="px-2 py-1 text-white"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );

  return (
    <>
      {bannerContent}
      <OfflineModal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};

export default InstallBanner;

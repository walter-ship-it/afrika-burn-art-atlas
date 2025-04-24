
import React from 'react';
import { InstallState } from '../hooks/useInstallPrompt';

interface InstallBannerProps {
  installState: InstallState;
  promptInstall: () => void;
  dismissIOSHint: () => void;
}

const InstallBanner = ({ installState, promptInstall, dismissIOSHint }: InstallBannerProps) => {
  if (installState === 'can-install') {
    return (
      <div className="absolute top-0 left-0 right-0 bg-emerald-700 text-white p-3 flex justify-between items-center z-[1001]">
        <div className="font-medium">Download offline – no signal at AfrikaBurn</div>
        <div className="flex gap-2">
          <button 
            onClick={promptInstall}
            className="px-3 py-1 bg-white text-emerald-800 rounded-md font-medium"
          >
            Install
          </button>
        </div>
      </div>
    );
  }

  if (installState === 'ios-hint') {
    return (
      <div className="absolute top-0 left-0 right-0 bg-emerald-700 text-white p-3 flex justify-between items-center z-[1001]">
        <div className="font-medium">Download offline – no signal at AfrikaBurn</div>
        <div className="flex gap-2">
          <button 
            onClick={() => alert("Tap Share icon → Add to Home Screen")}
            className="px-3 py-1 bg-white text-emerald-800 rounded-md font-medium"
          >
            How to Install
          </button>
          <button 
            onClick={dismissIOSHint}
            className="px-2 py-1 text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallBanner;


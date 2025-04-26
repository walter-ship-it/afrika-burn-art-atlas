
import React from 'react';
import LoadingIndicator from '../LoadingIndicator';

interface MapStatusProps {
  isLoading: boolean;
  error: string | null;
}

const MapStatus: React.FC<MapStatusProps> = ({ isLoading, error }) => {
  if (!isLoading && !error) return null;

  return (
    <>
      {isLoading && <LoadingIndicator />}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-[1001]">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
    </>
  );
};

export default MapStatus;

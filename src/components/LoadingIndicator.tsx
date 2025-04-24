
import React from 'react';

const LoadingIndicator = () => (
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-4 rounded-lg shadow-md z-[1000]">
    <div className="flex items-center space-x-2">
      <div className="w-5 h-5 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Loading artworks...</span>
    </div>
  </div>
);

export default LoadingIndicator;


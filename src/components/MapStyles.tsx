
import React from 'react';

const MapStyles = () => (
  <style>
    {`
    /* Ensure Leaflet container takes full height */
    :global(.leaflet-container) {
      height: 100%;
      width: 100%;
    }
    
    /* Style cluster markers */
    :global(.marker-cluster-small),
    :global(.marker-cluster-medium),
    :global(.marker-cluster-large) {
      background-color: rgba(5, 150, 105, 0.4) !important;
    }
    
    :global(.marker-cluster-small div),
    :global(.marker-cluster-medium div),
    :global(.marker-cluster-large div) {
      background-color: rgba(5, 150, 105, 0.7) !important;
      color: white !important;
      font-weight: bold;
    }
    `}
  </style>
);

export default MapStyles;



import React from 'react';

const MapStyles = () => (
  <style jsx global>{`
    /* Ensure Leaflet container takes full height */
    .leaflet-container {
      height: 100% !important;
      width: 100% !important;
    }
    
    /* Style cluster markers */
    .marker-cluster-small,
    .marker-cluster-medium,
    .marker-cluster-large {
      background-color: rgba(5, 150, 105, 0.4) !important;
    }
    
    .marker-cluster-small div,
    .marker-cluster-medium div,
    .marker-cluster-large div {
      background-color: rgba(5, 150, 105, 0.7) !important;
      color: white !important;
      font-weight: bold !important;
    }
  `}</style>
);

export default MapStyles;

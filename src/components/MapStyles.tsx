
import React from 'react';

const MapStyles = () => (
  <style>
    {`
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
    
    /* Favorite button styles */
    .fav-btn {
      background: none;
      border: none;
      font-size: 22px;
      cursor: pointer;
      padding: 0;
      margin: 0;
    }
    
    .fav-empty {
      display: inline;
    }
    
    .fav-full {
      display: none;
      color: #b03060; /* maroon */
    }
    
    .favourited .fav-empty {
      display: none;
    }
    
    .favourited .fav-full {
      display: inline;
    }
    
    /* Favorites filter control */
    .favorites-filter {
      position: absolute;
      top: 70px;
      right: 10px;
      z-index: 1000;
      background: white;
      padding: 8px 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    `}
  </style>
);

export default MapStyles;


import L from 'leaflet';

type Category =
  | 'artwork'
  | 'theme_camp'
  | 'support_camp'
  | 'medics'
  | string;            // fall-back for unknowns

const colour: Record<Category, string> = {
  artwork:      '#ff8c00', // orange
  theme_camp:   '#1e90ff', // blue
  support_camp: '#2e8b57', // green
  medics:       '#b03060', // maroon / red
  default:      '#808080'  // grey
};

/** Return a Leaflet divIcon tinted by category */
export const createMarkerIcon = (cat: Category, isFavorite: boolean = false) => {
  const color = isFavorite 
    ? '#b03060' // maroon color for favorites
    : colour[cat] ?? colour.default;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width:18px;height:18px;border-radius:50%;
        background:${color};
        border:2px solid #fff;
        box-shadow:0 0 3px rgba(0,0,0,.4);
        ${isFavorite ? 'box-shadow: 0 0 0 3px #b03060, 0 0 3px rgba(0,0,0,.4);' : ''}
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

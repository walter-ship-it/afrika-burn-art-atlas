
import { categoryColors } from '@/utils/colors';

const Legend = () => {
  return (
    <div className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-lg shadow-lg z-20">
      <h3 className="text-sm font-semibold mb-2">Map Legend</h3>
      <div className="space-y-2">
        {Object.entries(categoryColors).map(([category, color]) => (
          category !== 'default' && category !== 'support_camp' && (
            <div key={category} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color, opacity: 0.7 }}
              />
              <span className="text-xs capitalize">
                {category.replace('_', ' ')}
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Legend;


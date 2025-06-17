
import React from 'react';
import { Sun, Droplet, Thermometer, Calendar } from 'lucide-react';

interface DetailedCareInstructionsProps {
  careInfo?: {
    light?: string;
    water?: string;
    temperature?: string;
    fertilize?: string;
  };
}

const DetailedCareInstructions: React.FC<DetailedCareInstructionsProps> = ({ careInfo }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-plant-dark-green mt-6 mb-3">Detailed Care Instructions</h3>
      
      <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
        <Sun className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Light Requirements</p>
          <p className="text-sm text-muted-foreground">{careInfo?.light || "This plant prefers bright, indirect light but can tolerate some direct morning sun. Keep away from hot afternoon sun which can scorch the leaves. During winter, move closer to a window to maximize light exposure."}</p>
        </div>
      </div>
      
      <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
        <Droplet className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Watering Schedule</p>
          <p className="text-sm text-muted-foreground">{careInfo?.water || "Water thoroughly when the top inch of soil is dry to the touch. Reduce watering in winter when growth slows. Ensure good drainage - this plant doesn't like wet feet. Consider using filtered or distilled water if your tap water is heavily chlorinated."}</p>
        </div>
      </div>
      
      <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
        <Thermometer className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Temperature & Humidity</p>
          <p className="text-sm text-muted-foreground">{careInfo?.temperature || "Thrives in temperatures between 65-80°F (18-27°C). Avoid cold drafts and sudden temperature changes. Prefers moderate to high humidity - consider using a humidifier or pebble tray with water in dry environments or during winter heating season."}</p>
        </div>
      </div>
      
      <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
        <Calendar className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Fertilizing</p>
          <p className="text-sm text-muted-foreground">{careInfo?.fertilize || "Feed with a balanced, water-soluble fertilizer diluted to half strength every 4-6 weeks during the growing season (spring through early fall). Don't fertilize in winter when growth naturally slows. Flush the soil occasionally with plain water to prevent salt buildup."}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailedCareInstructions;

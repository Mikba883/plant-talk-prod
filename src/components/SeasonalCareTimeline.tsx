
import React from 'react';
import { LeafyGreen, Sun, Leaf, SunMoon } from 'lucide-react';

const SeasonalCareTimeline: React.FC = () => {
  return (
    <div className="space-y-3 my-6">
      <h3 className="font-semibold text-lg text-plant-dark-green mb-3">Seasonal Care Timeline</h3>
      <div className="bg-muted/30 p-3 rounded-lg flex items-start gap-3">
        <LeafyGreen className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Spring</p>
          <p className="text-sm text-muted-foreground">Resume regular watering as growth picks up. Begin fertilizing schedule. Watch for new growth and repot if necessary. Ideal time for propagation.</p>
        </div>
      </div>
      <div className="bg-muted/30 p-3 rounded-lg flex items-start gap-3">
        <Sun className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Summer</p>
          <p className="text-sm text-muted-foreground">Increase watering frequency during hot periods. Protect from intense afternoon sun. Monitor humidity levels and mist if needed.</p>
        </div>
      </div>
      <div className="bg-muted/30 p-3 rounded-lg flex items-start gap-3">
        <Leaf className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Fall</p>
          <p className="text-sm text-muted-foreground">Gradually reduce watering as growth slows. Last fertilizer application before winter. Move away from cooling windows.</p>
        </div>
      </div>
      <div className="bg-muted/30 p-3 rounded-lg flex items-start gap-3">
        <SunMoon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Winter</p>
          <p className="text-sm text-muted-foreground">Minimal watering - only when soil is completely dry. No fertilizing. Protect from drafts and heating vents. Ensure adequate light.</p>
        </div>
      </div>
    </div>
  );
};

export default SeasonalCareTimeline;

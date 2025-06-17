
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GrowthStage {
  stage: string;
  description: string;
  time: string;
  color: string;
}

const GrowthStagesTimeline: React.FC = () => {
  const stages: GrowthStage[] = [
    {
      stage: "Seedling",
      description: "Delicate early growth, requires gentle care and consistent moisture",
      time: "1-3 weeks",
      color: "bg-plant-light-green"
    },
    {
      stage: "Vegetative",
      description: "Rapid leaf and stem growth, establish care routine for health",
      time: "1-2 months",
      color: "bg-plant-dark-green"
    },
    {
      stage: "Maturity",
      description: "Established plant with full foliage and resilience",
      time: "3-6 months",
      color: "bg-plant-leaf"
    },
    {
      stage: "Flowering",
      description: "Produces blooms, may need special care and fertilizers",
      time: "Seasonal",
      color: "bg-plant-accent"
    }
  ];

  return (
    <div className="mt-10 mb-8 relative">
      <h3 className="font-semibold text-lg text-plant-dark-green mb-5">Growth Timeline</h3>
      
      {/* Horizontal timeline with connecting line */}
      <div className="relative px-4">
        {/* Horizontal timeline line */}
        <div className="absolute top-9 left-0 right-0 h-1 bg-muted"></div>
        
        {/* Timeline items in horizontal layout */}
        <div className="flex justify-between">
          {stages.map((stage, index) => (
            <div key={index} className="flex flex-col items-center relative px-1" style={{width: `${100/stages.length}%`}}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white z-10",
                stage.color
              )}>
                {index + 1}
              </div>
              
              <Card className="mt-4 p-3 w-full bg-muted/20 border-none shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <h4 className="font-medium text-plant-dark-green text-sm">{stage.stage}</h4>
                  <span className="bg-muted/30 text-xs px-2 py-0.5 rounded-full mt-1 mb-1">
                    {stage.time}
                  </span>
                  <p className="text-xs text-muted-foreground">{stage.description}</p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GrowthStagesTimeline;

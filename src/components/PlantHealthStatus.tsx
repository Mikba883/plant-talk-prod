
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PlantHealthStatusProps {
  healthProbability?: number;
}

const PlantHealthStatus: React.FC<PlantHealthStatusProps> = ({ healthProbability }) => {
  // Function to get health status with label, color and emoji
  const getHealthStatus = (probability?: number) => {
    if (!probability) return { label: 'Unknown', color: 'bg-gray-500 text-white', emoji: '❓' };
    
    if (probability >= 0.95) return { label: 'Elite', color: 'bg-[#00cc66] text-white', emoji: '🌟' };
    if (probability >= 0.90) return { label: 'Healthy', color: 'bg-green-500 text-white', emoji: '✅' };
    if (probability >= 0.75) return { label: 'Good, monitor', color: 'bg-yellow-500 text-black', emoji: '⚠️' };
    if (probability >= 0.60) return { label: 'Slightly stressed', color: 'bg-yellow-400 text-black', emoji: '😐' };
    if (probability >= 0.40) return { label: 'Unhealthy', color: 'bg-orange-500 text-white', emoji: '🔶' };
    return { label: 'Critical', color: 'bg-red-500 text-white', emoji: '❗' };
  };

  const healthStatus = getHealthStatus(healthProbability);
  
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-lg text-plant-dark-green mb-2">How Am I Doing?</h3>
      <div className="flex flex-col">
        <Badge className={cn(
          "w-fit px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 rounded-md",
          healthStatus.color
        )}>
          {healthStatus.emoji} {healthStatus.label} {healthProbability ? `(${Math.round(healthProbability * 100)}%)` : ''}
        </Badge>
        <p className="text-sm mt-2 text-muted-foreground">
          My health status is: {healthStatus.label.toLowerCase()} 
          {healthProbability ? ` (${Math.round(healthProbability * 100)}%)` : ''}
        </p>
      </div>
    </div>
  );
};

export default PlantHealthStatus;

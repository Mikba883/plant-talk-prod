
import React from 'react';
import PlantCareChart from './PlantCareChart';

interface BlurrableChartProps {
  plantType: string;
  careInfo: {
    light: string;
    water: string;
    temperature?: string;
    fertilize?: string;
  };
  isPremium: boolean;
}

const BlurrableChart: React.FC<BlurrableChartProps> = ({ plantType, careInfo, isPremium }) => {
  // Create a properly typed careInfo object for PlantCareChart
  const chartCareInfo = {
    light: careInfo.light,
    water: careInfo.water,
    temperature: careInfo.temperature || "Average room temperature (65-75°F)",
    humidity: "Medium" // Default value since humidity might not be provided
  };

  return (
    <div className="mb-6 relative">
      <div className={`relative ${!isPremium ? 'overflow-hidden' : ''}`}>
        {/* Actual chart - rimuoviamo il titolo qui */}
        <PlantCareChart 
          plantType={plantType} 
          careInfo={chartCareInfo} 
        />
        
        {/* Blur overlay and upgrade prompt for non-premium users */}
        {!isPremium && (
          <div className="absolute inset-0 backdrop-blur-md bg-white/30 flex flex-col items-center justify-center">
            <div className="text-center p-4">
              <p className="font-medium text-sm mb-2">Unlock Premium to see how to keep me happy 🌿</p>
              <button 
                className="bg-plant-dark-green hover:bg-plant-dark-green/90 text-white px-4 py-1.5 rounded-full text-sm"
                onClick={() => window.location.href = '/pricing'}
              >
                Get Premium
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlurrableChart;

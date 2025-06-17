
import React from 'react';
import { getPlantEmoji } from '@/utils/plantHelpers';

interface PlantInfoTitleProps {
  plantName: string;
  commonName?: string;
  scientificName: string;
}

const PlantInfoTitle: React.FC<PlantInfoTitleProps> = ({ 
  plantName, 
  commonName, 
  scientificName 
}) => {
  // Usa commonName se disponibile, altrimenti usa plantName
  const displayName = commonName || plantName;
  const plantEmoji = getPlantEmoji(displayName);
  
  return (
    <div className="w-full max-w-md mb-4">
      <div className="bg-gradient-to-r from-plant-dark-green to-plant-light-green rounded-lg p-4 text-white text-center">
        <h1 className="text-xl font-bold">
          Hi! I'm your {displayName} {plantEmoji}
        </h1>
        {scientificName && 
         scientificName !== 'Unknown' && 
         scientificName !== 'Unknown Species' &&
         scientificName.trim() !== '' && 
         !scientificName.toLowerCase().includes('unavailable') && (
          <p className="text-sm opacity-80 italic">
            {scientificName}
          </p>
        )}
      </div>
    </div>
  );
};

export default PlantInfoTitle;

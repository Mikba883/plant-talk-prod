
import React from 'react';
import { CardHeader } from '@/components/ui/card';
import { getPlantEmoji } from '@/utils/plantHelpers';

interface PlantInfoHeaderProps {
  name: string;
  commonName?: string;
  scientificName?: string;
}

const PlantInfoHeader: React.FC<PlantInfoHeaderProps> = ({
  name,
  commonName,
  scientificName
}) => {
  // Usa commonName se disponibile, altrimenti usa name
  const displayName = commonName || name;
  const plantEmoji = getPlantEmoji(displayName);
  
  return (
    <CardHeader className="text-center border-b border-plant-dark-green/20 bg-gradient-to-r from-plant-dark-green to-plant-light-green rounded-t-2xl">
      <h1 className="text-2xl font-bold text-white">
        Hi! I'm your {displayName} {plantEmoji}
      </h1>
      {scientificName && 
       scientificName !== 'Unknown' && 
       scientificName !== 'Unknown Species' &&
       scientificName.trim() !== '' && 
       !scientificName.toLowerCase().includes('unavailable') && (
        <p className="text-sm text-white/80 italic">{scientificName}</p>
      )}
    </CardHeader>
  );
};

export default PlantInfoHeader;

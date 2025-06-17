
import React from 'react';

interface ResultHeaderProps {
  plantName: string;
  scientificName: string;
  plantEmoji: string;
}

const ResultHeader: React.FC<ResultHeaderProps> = ({ 
  plantName, 
  scientificName, 
  plantEmoji 
}) => {
  return (
    <h1 className="text-3xl font-bold text-plant-dark-green mb-6 text-center">
      Hi! I'm your<br />{plantName} {plantEmoji}
      <span className="block text-sm font-normal italic text-muted-foreground mt-1">
        {scientificName}
      </span>
    </h1>
  );
};

export default ResultHeader;

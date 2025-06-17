
import React from 'react';
import BlurrableChart from '@/components/BlurrableChart';
import DiseaseCarousel from '@/components/DiseaseCarousel';
import { SimplePlantData } from '@/hooks/useSimplePlantAPI';

interface PlantCareSectionProps {
  plantData: SimplePlantData;
  isPremium: boolean;
}

const PlantCareSection: React.FC<PlantCareSectionProps> = ({ plantData, isPremium }) => {
  // Filter diseases with probability > 0.5
  const relevantDiseases = plantData.diseases?.filter(disease => disease.probability > 0.5) || [];

  return (
    <>
      {/* Blurrable Chart - rimuoviamo il titolo duplicato */}
      <div className="mb-6">
        <BlurrableChart 
          plantType={plantData.name}
          careInfo={plantData.careInfo}
          isPremium={isPremium}
        />
      </div>
      
      {/* Disease Carousel */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg text-green-600 mb-3">What's Wrong With Me?</h3>
        {relevantDiseases.length > 0 ? (
          <DiseaseCarousel 
            diseases={relevantDiseases}
            isPremium={isPremium}
          />
        ) : (
          <div className="p-4 bg-plant-light-green/10 rounded-lg border border-plant-dark-green/20 shadow-sm">
            <p className="text-center py-4">
              No specific issues detected at this time 🌱
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default PlantCareSection;

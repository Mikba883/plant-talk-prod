
import React from 'react';
import { Droplet, Sun, ThermometerSun, CloudSun, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlantCareInstructionsProps {
  careInfo: {
    light: string;
    water: string;
    temperature: string;
    humidity?: string;
    propagation?: string;
    fertilize?: string;
  };
  plantData?: any;
}

const PlantCareInstructions: React.FC<PlantCareInstructionsProps> = ({ careInfo, plantData }) => {
  console.log('🌱 [PlantCareInstructions] CareInfo ricevuto:', careInfo);
  console.log('🌱 [PlantCareInstructions] PlantData ricevuto:', plantData);
  
  // ✅ MIGLIORATO: Estrazione intelligente dei dati di annaffiatura da Plant.ID API
  const extractWateringInfo = (waterText: string) => {
    console.log('💧 [PlantCareInstructions] Analyzing water text:', waterText);
    
    // Prima controlla pattern specifici dall'API Plant.ID
    const apiPatterns = [
      // Pattern: "Water every 7-10 days" o simili
      { regex: /every\s+(\d+)[-–—]?(\d+)?\s+days?/i, type: 'days' },
      // Pattern: "Water 2-3 times per week"
      { regex: /(\d+)[-–—]?(\d+)?\s*(?:times?)\s*(?:per|a)\s*(week|month)/i, type: 'frequency' },
      // Pattern: "Once per week" o "Once a month"
      { regex: /once\s*(?:per|a)\s*(week|month)/i, type: 'once' },
      // Pattern: "Water when soil is dry" o "When top inch is dry"
      { regex: /when.*(?:soil|top.*inch).*dry/i, type: 'condition' }
    ];
    
    for (const pattern of apiPatterns) {
      const match = waterText.match(pattern.regex);
      if (match) {
        console.log('💧 [PlantCareInstructions] Found API pattern:', pattern.type, match);
        
        if (pattern.type === 'days') {
          const min = match[1];
          const max = match[2] || min;
          return {
            frequency: min === max ? `${min} days` : `${min}-${max} days`,
            remaining: waterText.replace(match[0], '').trim()
          };
        } else if (pattern.type === 'frequency') {
          const min = match[1];
          const max = match[2] || min;
          const period = match[3];
          return {
            frequency: min === max ? `${min}× per ${period}` : `${min}-${max}× per ${period}`,
            remaining: waterText.replace(match[0], '').trim()
          };
        } else if (pattern.type === 'once') {
          const period = match[1];
          return {
            frequency: `1× per ${period}`,
            remaining: waterText.replace(match[0], '').trim()
          };
        } else if (pattern.type === 'condition') {
          return {
            frequency: 'When soil is dry',
            remaining: waterText
          };
        }
      }
    }
    
    // ✅ Fallback: usa il testo originale dell'API se non trova pattern specifici
    console.log('💧 [PlantCareInstructions] No specific pattern found, using API text as-is');
    return {
      frequency: 'As needed',
      remaining: waterText || "Monitor soil moisture and water when needed."
    };
  };
  
  // ✅ NON usa più getWateringFrequency hardcoded - priorità ai dati Plant.ID
  const wateringInfo = extractWateringInfo(careInfo.water);
  
  console.log('💧 [PlantCareInstructions] Final watering info:', wateringInfo);

  return (
    <div className="my-6">
      <h3 className="font-semibold text-lg text-plant-dark-green mb-3">What I Need</h3>
      <div className="space-y-3">
        {/* Light info - usa direttamente i dati Plant.ID */}
        <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
          <Sun className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Light</p>
            <p className="text-sm text-muted-foreground">{careInfo.light}</p>
          </div>
        </div>
        
        {/* Water info - usa direttamente i dati Plant.ID API */}
        <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
          <Droplet className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Water</p>
            <div className="flex items-center gap-1.5 my-1">
              <Badge className="bg-plant-dark-green text-white font-medium">
                Every {wateringInfo.frequency}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{wateringInfo.remaining || "Keep soil slightly moist but never soggy."}</p>
          </div>
        </div>
        
        {/* Temperature info - usa direttamente i dati Plant.ID */}
        <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
          <ThermometerSun className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Temperature</p>
            <p className="text-sm text-muted-foreground">{careInfo.temperature}</p>
          </div>
        </div>
        
        {/* Humidity info (if available) */}
        {careInfo.humidity && (
          <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
            <CloudSun className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Humidity</p>
              <p className="text-sm text-muted-foreground">{careInfo.humidity}</p>
            </div>
          </div>
        )}
        
        {/* Propagation info (if available) */}
        {careInfo.propagation && (
          <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
            <Leaf className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Propagation</p>
              <p className="text-sm text-muted-foreground">{careInfo.propagation}</p>
            </div>
          </div>
        )}
        
        {/* Fertilizer info (if available) */}
        {careInfo.fertilize && (
          <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
            <Leaf className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Fertilizer</p>
              <p className="text-sm text-muted-foreground">{careInfo.fertilize}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantCareInstructions;


import React, { useState, useEffect } from 'react';
import { getHealthStatus } from './HealthStatusBadge';
import { Heart } from 'lucide-react';

interface PlantHappinessIndicatorProps {
  healthProbability?: number;
  isPremium?: boolean;
}

const PlantHappinessIndicator: React.FC<PlantHappinessIndicatorProps> = ({ 
  healthProbability = 0.75, 
  isPremium = false 
}) => {
  const [calculating, setCalculating] = useState(true);
  const [percentage, setPercentage] = useState(0);
  const [showStatus, setShowStatus] = useState(false);
  
  console.log('💖 [PlantHappinessIndicator] Props ricevute:', { healthProbability, isPremium });
  console.log('💖 [PlantHappinessIndicator] healthProbability type:', typeof healthProbability);
  
  const healthStatus = getHealthStatus(healthProbability);

  // Animation effect for calculating
  useEffect(() => {
    setCalculating(true);
    setShowStatus(false);
    
    if (isPremium) {
      // For premium users, animate to actual percentage
      const targetPercentage = Math.round((healthProbability || 0) * 100);
      console.log('💖 [PlantHappinessIndicator] Target percentage for premium user:', targetPercentage);
      
      let currentPercentage = 0;
      
      const timer = setInterval(() => {
        currentPercentage += 1;
        if (currentPercentage >= targetPercentage) {
          currentPercentage = targetPercentage;
          clearInterval(timer);
          setTimeout(() => {
            setCalculating(false);
            // Mostra il giudizio solo dopo che l'animazione è completata
            setTimeout(() => setShowStatus(true), 200);
          }, 500);
        }
        setPercentage(currentPercentage);
      }, 30);
      
      return () => {
        clearInterval(timer);
      };
    } else {
      // For non-premium users, smooth loop from 0 to 100 and back to 0
      console.log('💖 [PlantHappinessIndicator] Non-premium user - infinite animation');
      let currentPercentage = 0;
      let isIncreasing = true;
      
      const timer = setInterval(() => {
        if (isIncreasing) {
          currentPercentage += 2;
          if (currentPercentage >= 100) {
            currentPercentage = 100;
            isIncreasing = false;
            // Wait a moment at 100% before starting to decrease
            setTimeout(() => {
              currentPercentage = 0;
              isIncreasing = true;
            }, 300);
          }
        }
        
        setPercentage(currentPercentage);
      }, 50);
      
      return () => {
        clearInterval(timer);
      };
    }
  }, [healthProbability, isPremium]);

  // Calculate hearts based on health percentage
  const totalHearts = 10;
  const fullHearts = Math.floor((percentage / 100) * totalHearts);
  const partialHeart = ((percentage / 100) * totalHearts) % 1;
  const emptyHearts = totalHearts - fullHearts - (partialHeart > 0 ? 1 : 0);

  // Generate color based on health percentage
  const getHeartColor = (healthValue: number) => {
    if (healthValue >= 0.9) return 'text-green-500';
    if (healthValue >= 0.75) return 'text-green-400';
    if (healthValue >= 0.6) return 'text-yellow-500';
    if (healthValue >= 0.4) return 'text-orange-500';
    return 'text-red-500';
  };

  const heartColor = getHeartColor(percentage / 100);
  
  return (
    <div className="p-4 bg-white rounded-lg border border-plant-dark-green/20 shadow-sm">
      {/* Hearts Display */}
      <div className="flex justify-center gap-1 mb-4 transition-opacity">
        {/* Full Hearts */}
        {Array.from({ length: fullHearts }).map((_, i) => (
          <Heart key={`full-${i}`} className={`h-6 w-6 ${heartColor} fill-current animate-pulse`} />
        ))}
        
        {/* Partial Heart (if applicable) */}
        {partialHeart > 0 && (
          <div className="relative h-6 w-6">
            {/* Empty heart as background */}
            <Heart className={`absolute inset-0 h-6 w-6 text-gray-300 fill-current`} />
            {/* Partially filled heart created with clip-path */}
            <div 
              className="absolute inset-0 overflow-hidden" 
              style={{ 
                clipPath: `inset(0 ${100 - (partialHeart * 100)}% 0 0)` 
              }}
            >
              <Heart className={`h-6 w-6 ${heartColor} fill-current animate-pulse`} />
            </div>
          </div>
        )}
        
        {/* Empty Hearts */}
        {Array.from({ length: emptyHearts }).map((_, i) => (
          <Heart key={`empty-${i}`} className="h-6 w-6 text-gray-300 fill-current" />
        ))}
      </div>
      
      {/* For premium users, show percentage and status only after animation completes */}
      {isPremium ? (
        <>
          {/* Percentage Display */}
          <div className="text-center mb-3">
            <span className={`text-xl font-bold ${calculating ? 'animate-pulse' : ''}`}>{percentage}%</span>
          </div>
          
          {/* Health Status Badge - shown only after animation completes */}
          {showStatus && (
            <div className="text-center">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium animate-fade-in ${
                getHeartColor(percentage / 100).replace('text-', 'bg-')}/20 ${getHeartColor(percentage / 100)}`}>
                {healthStatus.emoji} {healthStatus.label}
              </span>
            </div>
          )}
        </>
      ) : (
        /* Non-premium upgrade prompt */
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            🔒 Unlock Premium to see your plant's happiness score
          </p>
          <button 
            className="bg-plant-dark-green hover:bg-plant-dark-green/90 text-white px-3 py-1.5 rounded-full text-xs"
            onClick={() => window.location.href = '/pricing'}
          >
            Get Premium
          </button>
        </div>
      )}
    </div>
  );
};

export default PlantHappinessIndicator;

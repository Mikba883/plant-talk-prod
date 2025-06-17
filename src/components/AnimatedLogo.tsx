
import React from 'react';

interface AnimatedLogoProps {
  className?: string;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ className = "w-6 h-6" }) => {
  return (
    <div className={`relative ${className}`}>
      <img 
        src="/lovable-uploads/cc2253c1-2523-4e50-b66e-d2a735821572.png" 
        alt="PlantTalk Logo" 
        className="w-full h-full"
      />
    </div>
  );
};

export default AnimatedLogo;

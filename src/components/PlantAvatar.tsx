
import React from 'react';

interface PlantAvatarProps {
  isPremium?: boolean;
}

const PlantAvatar: React.FC<PlantAvatarProps> = ({ 
  isPremium = false
}) => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
      {/* Plant avatar placeholder - you can add avatar visualization here */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">🌱</span>
        </div>
      </div>
    </div>
  );
};

export default PlantAvatar;

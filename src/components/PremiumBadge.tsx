
import React from 'react';
import { Heart, Diamond } from 'lucide-react';

interface PremiumBadgeProps {
  isPremium: boolean;
  onClick?: () => void;
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({ isPremium, onClick }) => {
  const handleClick = () => {
    if (onClick && !isPremium) {
      onClick();
    }
  };

  return (
    <div 
      className={`${
        isPremium 
          ? "bg-gradient-to-r from-plant-dark-green to-plant-light-green text-white" 
          : "bg-muted hover:bg-muted/80 text-muted-foreground"
      } px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center cursor-pointer transition-colors`}
      onClick={handleClick}
    >
      {isPremium ? (
        <>
          <Heart className="h-4 w-4 mr-1.5" />
          Premium
        </>
      ) : (
        <>
          <Diamond className="h-4 w-4 mr-1.5" />
          Free Plan
        </>
      )}
    </div>
  );
};

export default PremiumBadge;

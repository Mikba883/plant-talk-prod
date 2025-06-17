
import React from 'react';
import { Lock } from 'lucide-react';

interface PremiumOverlayProps {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}

const PremiumOverlay: React.FC<PremiumOverlayProps> = ({ 
  title, 
  description, 
  className = '', 
  children 
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Content with blur effect */}
      <div className="relative overflow-hidden rounded-lg">
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center p-6">
          <div className="text-center">
            {/* MODIFICATO: Icona con sfondo trasparente */}
            <div className="mb-4 mx-auto w-16 h-16 bg-transparent border-2 border-plant-dark-green/30 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-plant-dark-green/70" />
            </div>
            
            <h3 className="font-semibold text-lg text-plant-dark-green mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {description}
            </p>
            <button 
              className="bg-plant-dark-green hover:bg-plant-dark-green/90 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
              onClick={() => window.location.href = '/pricing'}
            >
              Get Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumOverlay;

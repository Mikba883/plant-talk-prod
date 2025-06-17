
import React from 'react';
import AnimatedLogo from '@/components/AnimatedLogo';

const PlantTalkHeader = () => {
  return (
    <div className="text-center mb-6">
      <div className="flex items-center justify-center gap-3 mb-3">
        <AnimatedLogo className="w-12 h-12" />
        <h1 className="text-4xl font-bold text-plant-dark-green tracking-tight">PlantTalk</h1>
      </div>
      {/* Sottotitolo ottimizzato: grassetto, più piccolo, spacing ridotto */}
      <p className="text-sm font-bold text-plant-dark-green/80 mb-2 tracking-wide">
        Let Your Plants Speak
      </p>
      <p className="text-base text-muted-foreground px-4 leading-relaxed">
        The first smart plant care assistant where your plants talk to you.
      </p>
    </div>
  );
};

export default PlantTalkHeader;

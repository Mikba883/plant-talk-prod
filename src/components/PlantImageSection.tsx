
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useUnifiedTTS } from '@/hooks/useUnifiedTTS';
import AudioWaveVisualizer from '@/components/AudioWaveVisualizer';

interface PlantImageSectionProps {
  capturedImage: string | null;
  plantData: any;
  generateFullSpeechContent: (plantData: any, isPremium: boolean) => string;
  isPremium: boolean;
  isScanning: boolean;
  autoPlay?: boolean;
}

const PlantImageSection: React.FC<PlantImageSectionProps> = ({
  capturedImage,
  plantData,
  generateFullSpeechContent,
  isPremium,
  isScanning,
  autoPlay = false
}) => {
  const { speak, pause, resume, stop, isLoading: isTTSLoading, isPlaying, isPaused, analyser } = useUnifiedTTS();
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);
  const autoPlayTriggeredRef = useRef(false);

  // Auto-play welcome message SOLO se autoPlay è true E non è già stato fatto
  useEffect(() => {
    if (plantData && !isPremium && !hasPlayedWelcome && !isScanning && autoPlay && !autoPlayTriggeredRef.current) {
      console.log('🔊 [PlantImageSection] Auto-playing welcome message for free user - SINGLE TRIGGER');
      
      // Imposta immediatamente il flag per evitare doppie chiamate
      autoPlayTriggeredRef.current = true;
      
      // FERMA qualsiasi audio in corso prima di iniziare
      stop();
      
      // Breve delay per assicurarsi che lo stop sia completato
      setTimeout(() => {
        const welcomeText = generateFullSpeechContent(plantData, isPremium);
        speak(welcomeText, plantData.name);
        setHasPlayedWelcome(true);
      }, 200);
    }
  }, [plantData, isPremium, hasPlayedWelcome, isScanning, autoPlay, speak, generateFullSpeechContent, stop]);

  const handlePlayPause = () => {
    if (!plantData) return;

    console.log('🔊 [PlantImageSection] Button clicked - isPlaying:', isPlaying, 'isPaused:', isPaused);

    if (isPlaying) {
      console.log('🔊 [PlantImageSection] Pausing audio');
      pause();
    } else if (isPaused) {
      console.log('🔊 [PlantImageSection] Resuming paused audio');
      resume();
    } else {
      console.log('🔊 [PlantImageSection] Starting new audio - STOPPING any current audio first');
      
      // FERMA completamente qualsiasi audio in corso
      stop();
      
      // Breve delay per assicurarsi che lo stop sia completato
      setTimeout(() => {
        const speechText = generateFullSpeechContent(plantData, isPremium);
        speak(speechText, plantData.name);
      }, 200);
    }
  };

  if (!capturedImage) return null;

  return (
    <div className="mb-6">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted/30">
        <img src={capturedImage} alt="Your plant" className="w-full h-full object-cover" />
        
        {/* Onde sonore - mostrate solo quando sta suonando o caricando */}
        {(isPlaying || isTTSLoading) && (
          <AudioWaveVisualizer
            analyser={analyser}
            isPlaying={isPlaying}
            className="absolute inset-0 w-full h-full"
          />
        )}
        
        {/* Bottone Play/Pause */}
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={handlePlayPause}
            variant="secondary"
            size="sm"
            className={`shadow-md transition-all duration-200 ${
              isPremium 
                ? "bg-plant-dark-green/90 hover:bg-plant-dark-green text-white" 
                : "bg-gray-300/90 hover:bg-gray-400/90 text-gray-600"
            }`}
            disabled={isTTSLoading}
          >
            {isTTSLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlantImageSection;

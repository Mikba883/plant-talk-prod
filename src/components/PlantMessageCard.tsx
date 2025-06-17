
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { usePollyTTS } from '@/hooks/usePollyTTS';

interface PlantMessageCardProps {
  message: string;
  plantType?: string;
  healthStatus?: number;
  voiceType?: string;
  hideAudio?: boolean;
  hideText?: boolean;
}

const PlantMessageCard: React.FC<PlantMessageCardProps> = ({ 
  message, 
  plantType = 'generic', 
  healthStatus = 0.85,
  voiceType,
  hideAudio = false,
  hideText = false
}) => {
  const { speak, stop, isPlaying, isLoading } = usePollyTTS();
  
  // If both audio and text are hidden, don't render anything
  if (hideAudio && hideText) {
    return null;
  }
  
  const handleToggleAudio = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(message, plantType);
    }
  };
  
  return (
    <div className="bg-muted/30 rounded-lg p-4 my-4 relative">
      {!hideAudio && (
        <Button 
          onClick={handleToggleAudio}
          variant="ghost" 
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0"
          disabled={isLoading}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      )}
      
      {!hideText && (
        <p className="text-sm leading-relaxed pr-8">{message}</p>
      )}
    </div>
  );
};

export default PlantMessageCard;

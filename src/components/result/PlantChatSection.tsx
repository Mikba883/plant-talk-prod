
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import PlantChatInput from '@/components/PlantChatInput';
import { useUnifiedTTS } from '@/hooks/useUnifiedTTS';
import AudioWaveVisualizer from '@/components/AudioWaveVisualizer';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { detectTextLanguage } from '@/utils/languageDetection';

interface PlantChatSectionProps {
  isPremium: boolean;
  plantData: {
    name: string;
    healthProbability?: number;
  };
  onNavigateToPricing: () => void;
  capturedImage?: string | null;
}

const PlantChatSection: React.FC<PlantChatSectionProps> = ({ 
  isPremium, 
  plantData,
  onNavigateToPricing,
  capturedImage
}) => {
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { toast } = useToast();
  const { speak, pause, resume, stop, isLoading: isTTSLoading, isPlaying, isPaused, analyser } = useUnifiedTTS();
  
  // Get selected language from sessionStorage
  const getSelectedLanguage = () => {
    return sessionStorage.getItem('selectedLanguage') || 'en';
  };
  
  // Integration with automatic language detection and TTS
  const handleSendMessage = async (message: string) => {
    setIsProcessing(true);
    setChatResponse(null);
    
    const selectedLanguage = getSelectedLanguage();
    const isItalian = selectedLanguage === 'it';
    
    console.log(`💬 [PlantChatSection] Sending message in language: ${selectedLanguage}`);
    
    toast({
      title: isItalian ? "Messaggio inviato" : "Message sent",
      description: isItalian ? "La tua pianta sta pensando..." : "Your plant is thinking...",
    });
    
    try {
      console.log('🌿 [PlantChatSection] Sending message to chat-with-plant:', message);
      console.log('🌿 [PlantChatSection] Selected language:', selectedLanguage);
      
      // Pass language parameter to backend
      const { data, error } = await supabase.functions.invoke('chat-with-plant', {
        body: {
          message,
          plantName: plantData.name,
          plantType: plantData.name,
          healthStatus: plantData.healthProbability || 0.85,
          language: selectedLanguage // Pass language to backend
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('🌿 [PlantChatSection] Response received:', data);

      if (data?.response) {
        setChatResponse(data.response);
        
        // AUTOMATIC LANGUAGE DETECTION from response text con TIPO DI PIANTA
        const detectedLanguage = detectTextLanguage(data.response);
        console.log('🔊 [PlantChatSection] Auto-detected language from response:', detectedLanguage);
        
        // Use TTS con TIPO DI PIANTA per voce specifica
        await speak(data.response, plantData.name);
        
        toast({
          title: isItalian ? "Risposta ricevuta" : "Response received",
          description: isItalian ? "La tua pianta ha risposto!" : "Your plant has responded!",
        });
      } else {
        throw new Error(isItalian ? 'Nessuna risposta ricevuta dalla pianta' : 'No response received from plant');
      }
      
    } catch (error) {
      console.error('❌ [PlantChatSection] Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const fallbackMessage = isItalian 
        ? `Scusa, sto avendo difficoltà a comunicare. Errore: ${errorMessage}`
        : `Sorry, I'm having trouble communicating. Error: ${errorMessage}`;
      
      setChatResponse(fallbackMessage);
      
      toast({
        title: isItalian ? "Errore di comunicazione" : "Communication error",
        description: isItalian 
          ? "C'è stato un problema nel connettersi alla tua pianta. Riprova."
          : "There was a problem connecting to your plant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle audio function (play/pause/resume) LOGICA CORRETTA
  const handleToggleAudio = () => {
    if (!chatResponse) return;

    console.log('🔊 [PlantChatSection] Audio button clicked - isPlaying:', isPlaying, 'isPaused:', isPaused);

    if (isPlaying) {
      console.log('🔊 [PlantChatSection] Pausing audio');
      pause(); // USA PAUSE per fermare senza resettare
    } else if (isPaused) {
      console.log('🔊 [PlantChatSection] Resuming paused audio');
      resume(); // USA RESUME per continuare dallo stesso punto
    } else {
      console.log('🔊 [PlantChatSection] Starting new audio with plant type');
      speak(chatResponse, plantData.name); // PASSA IL TIPO DI PIANTA
    }
  };

  const selectedLanguage = getSelectedLanguage();
  const isItalian = selectedLanguage === 'it';

  return (
    <>
      {/* AGGIUNTO: Titolo "Chat with Me" */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-plant-dark-green bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2">
          {isItalian ? "Chatta con me" : "Chat with Me"}
        </h3>
      </div>
      
      {/* Input Chat - UI con effetto trasparenza */}
      <div className="mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
          <PlantChatInput 
            isPremium={isPremium} 
            onSendMessage={handleSendMessage} 
            className="min-h-[120px] bg-white/80 backdrop-blur-sm"
          />
        </div>
      </div>
      
      {/* SEMPRE VISIBILE per utenti PREMIUM - Container immagine con onde sonore */}
      {isPremium && capturedImage && (
        <div className="mb-6">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted/30">
            <img src={capturedImage} alt="Your plant" className="w-full h-full object-cover" />
            
            {/* Onde sonore posizionate sopra l'immagine SOLO quando sta parlando */}
            {(isPlaying || isTTSLoading) && (
              <AudioWaveVisualizer
                analyser={analyser}
                isPlaying={isPlaying}
                className="absolute inset-0 w-full h-full"
              />
            )}
            
            {/* Bottone Play/Pause */}
            {chatResponse && (
              <div className="absolute bottom-4 right-4">
                <Button
                  onClick={handleToggleAudio}
                  variant="secondary"
                  size="sm"
                  className="bg-gray-400/90 hover:bg-gray-500 text-white shadow-md transition-all duration-200"
                  disabled={isTTSLoading}
                >
                  {isTTSLoading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Risposta Chat */}
      {(chatResponse || isProcessing) && isPremium && (
        <div className="mb-6">
          {/* Testo risposta */}
          <div className="p-4 bg-plant-light-green/10 rounded-lg border border-plant-light-green">
            {/* Animazione processing */}
            {isProcessing && !chatResponse && (
              <div className="flex items-center justify-center py-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-plant-dark-green rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-plant-dark-green rounded-full animate-bounce delay-100"></div>
                  <div className="w-3 h-3 bg-plant-dark-green rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            
            {/* Testo risposta */}
            {chatResponse && (
              <p className="text-sm leading-relaxed">{chatResponse}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PlantChatSection;

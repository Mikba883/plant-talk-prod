
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Send, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PlantChatInputProps {
  isPremium: boolean;
  onSendMessage: (message: string) => void;
  className?: string;
}

const PlantChatInput: React.FC<PlantChatInputProps> = ({ isPremium, onSendMessage, className = '' }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [recordingAnalyser, setRecordingAnalyser] = useState<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get selected language from sessionStorage
  const getSelectedLanguage = () => {
    return sessionStorage.getItem('selectedLanguage') || 'en';
  };

  // FIXED: Initialize speech recognition properly with improved error handling
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      console.log('🎙️ [PlantChatInput] Speech recognition supported');
      setIsRecognitionSupported(true);
      
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        // Set language based on selected language
        const selectedLanguage = getSelectedLanguage();
        recognition.lang = selectedLanguage === 'it' ? 'it-IT' : 'en-US';
        console.log(`🎙️ [PlantChatInput] Speech recognition language set to: ${recognition.lang}`);
        
        recognition.onstart = () => {
          console.log('🎙️ [PlantChatInput] Speech recognition started');
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log('🎙️ [PlantChatInput] Voice transcription:', transcript);
          setMessage(transcript);
          setIsListening(false);
          
          // FIXED: Remove auto-submit - let user control when to send
          console.log('🎙️ [PlantChatInput] Voice transcription complete - user can review and send manually');
        };
        
        recognition.onerror = (event: any) => {
          console.error('🎙️ [PlantChatInput] Voice recognition error:', event.error);
          setIsListening(false);
          cleanupRecordingAudio();
          
          const selectedLanguage = getSelectedLanguage();
          const isItalian = selectedLanguage === 'it';
          
          toast({
            title: isItalian ? "Errore riconoscimento vocale" : "Voice recognition error",
            description: isItalian 
              ? "C'è stato un errore con il riconoscimento vocale. Riprova o scrivi il messaggio."
              : "There was an error with voice recognition. Please try again or type your message.",
            variant: "destructive"
          });
        };
        
        recognition.onend = () => {
          console.log('🎙️ [PlantChatInput] Speech recognition ended');
          setIsListening(false);
          cleanupRecordingAudio();
        };
        
        recognitionRef.current = recognition;
        
      } catch (error) {
        console.error('🎙️ [PlantChatInput] Error initializing speech recognition:', error);
        setIsRecognitionSupported(false);
      }
    } else {
      console.log('🎙️ [PlantChatInput] Speech recognition not supported');
      setIsRecognitionSupported(false);
    }
    
    return () => {
      cleanupRecordingAudio();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.warn('🎙️ [PlantChatInput] Error aborting recognition:', error);
        }
      }
    };
  }, [toast, isPremium]);

  // Update recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      const selectedLanguage = getSelectedLanguage();
      const newLang = selectedLanguage === 'it' ? 'it-IT' : 'en-US';
      recognitionRef.current.lang = newLang;
      console.log(`🎙️ [PlantChatInput] Updated speech recognition language to: ${newLang}`);
    }
  }, []);

  // FIXED: Setup audio visualization for recording
  const setupRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      source.connect(analyser);
      setRecordingAnalyser(analyser);
      
      console.log('🎙️ [PlantChatInput] Recording audio visualization setup complete');
    } catch (error) {
      console.error('🎙️ [PlantChatInput] Error setting up recording audio:', error);
    }
  };

  const cleanupRecordingAudio = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setRecordingAnalyser(null);
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    if (isPremium) {
      onSendMessage(message);
      setMessage('');
    } else {
      navigate('/pricing');
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // FIXED: Toggle voice recognition with audio visualization
  const toggleListening = async () => {
    if (!isPremium) {
      navigate('/pricing');
      return;
    }
    
    if (!isRecognitionSupported) {
      const selectedLanguage = getSelectedLanguage();
      const isItalian = selectedLanguage === 'it';
      
      toast({
        title: isItalian ? "Riconoscimento vocale non supportato" : "Voice recognition not supported",
        description: isItalian 
          ? "Il tuo browser non supporta il riconoscimento vocale."
          : "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }
    
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.warn('🎙️ [PlantChatInput] Error stopping recognition:', error);
        }
      }
      setIsListening(false);
      cleanupRecordingAudio();
    } else {
      if (recognitionRef.current) {
        try {
          // Setup audio visualization first
          await setupRecordingAudio();
          
          // Update language before starting
          const selectedLanguage = getSelectedLanguage();
          recognitionRef.current.lang = selectedLanguage === 'it' ? 'it-IT' : 'en-US';
          
          recognitionRef.current.start();
          
          const isItalian = selectedLanguage === 'it';
          toast({
            title: isItalian ? "Ascolto in corso..." : "Listening...",
            description: isItalian 
              ? "Parla ora per porre una domanda alla tua pianta."
              : "Speak now to ask your plant a question.",
          });
        } catch (error) {
          console.error('🎙️ [PlantChatInput] Error starting recognition:', error);
          setIsListening(false);
          cleanupRecordingAudio();
          
          const selectedLanguage = getSelectedLanguage();
          const isItalian = selectedLanguage === 'it';
          
          toast({
            title: isItalian ? "Errore avvio riconoscimento" : "Recognition start error",
            description: isItalian 
              ? "Non è possibile avviare il riconoscimento vocale."
              : "Unable to start voice recognition.",
            variant: "destructive"
          });
        }
      }
    }
  };

  const getSendButtonClasses = () => {
    const hasText = message.trim().length > 0;
    const baseClasses = "rounded-full p-2 h-10 w-10";
    
    if (hasText) {
      return `${baseClasses} bg-plant-dark-green hover:bg-plant-dark-green/90 text-white`;
    }
    
    return `${baseClasses} bg-transparent border border-plant-dark-green/50 text-plant-dark-green hover:bg-plant-light-green/10`;
  };

  const selectedLanguage = getSelectedLanguage();
  const isItalian = selectedLanguage === 'it';

  return (
    <div className={`relative ${!isPremium ? 'opacity-80' : ''} ${className}`}>
      {/* UI MIGLIORATA: Box più grande e prominente con stile gradiente */}
      <div className="relative bg-white rounded-2xl border-2 border-plant-light-green/30 shadow-lg hover:border-plant-light-green/50 transition-all duration-200">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => isPremium ? setMessage(e.target.value) : null}
          onKeyPress={handleKeyPress}
          placeholder={isPremium 
            ? (isItalian ? "Fai una domanda alla tua pianta..." : "Ask your plant a question...")
            : (isItalian ? "Funzione Premium - Aggiorna per chattare con la tua pianta" : "Premium Feature - Upgrade to chat with your plant")
          }
          className={`pr-24 resize-none rounded-2xl pl-6 py-4 min-h-[80px] max-h-[160px] border-0 focus:ring-0 text-base ${!isPremium ? 'cursor-pointer' : ''}`}
          rows={3}
          disabled={!isPremium}
          onClick={() => !isPremium && navigate('/pricing')}
        />
        
        {/* FIXED: Show audio waves during recording */}
        {isListening && recordingAnalyser && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50/50 rounded-2xl">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Microphone button */}
        <div className="absolute right-16 bottom-3">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full p-2 h-12 w-12 ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-plant-dark-green hover:bg-plant-light-green/20'}`}
            onClick={toggleListening}
            disabled={!isRecognitionSupported || !isPremium}
          >
            {isListening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
        </div>
        
        {/* Send button */}
        <div className="absolute right-3 bottom-3">
          <Button
            onClick={handleSendMessage}
            className={getSendButtonClasses()}
            disabled={!message.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Overlay for non-premium users */}
      {!isPremium && (
        <div 
          className="absolute inset-0 bg-white/5 flex items-center justify-center cursor-pointer rounded-2xl"
          onClick={() => navigate('/pricing')}
        >
          <div className="bg-plant-dark-green text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            {isItalian ? "Funzione Premium" : "Premium Feature"}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantChatInput;

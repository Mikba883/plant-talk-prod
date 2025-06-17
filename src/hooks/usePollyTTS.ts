
import { useState, useRef, useCallback, useEffect } from 'react';

interface UsePollyTTSProps {
  speak: (text: string, plantType?: string) => void;
  stop: () => void;
  isLoading: boolean;
  isPlaying: boolean;
  speechText: string;
  speechDuration: number;
  textProgress: number;
}

// Plant type to Polly voice mapping
const getPollyVoiceForPlant = (plantType: string): string => {
  const plantTypeLower = plantType.toLowerCase();
  
  // Cacti and succulents - male robotic voice
  if (plantTypeLower.includes("cactus") || 
      plantTypeLower.includes("succulent") || 
      plantTypeLower.includes("aloe") || 
      plantTypeLower.includes("agave")) {
    return "Matthew"; // Male, deep voice
  }
  
  // Flowering plants - soft female voice
  if (plantTypeLower.includes("rose") || 
      plantTypeLower.includes("lily") ||
      plantTypeLower.includes("tulip") ||
      plantTypeLower.includes("daisy") ||
      plantTypeLower.includes("orchid") ||
      plantTypeLower.includes("flower")) {
    return "Joanna"; // Soft female voice
  }
  
  // Trees - authoritative male voice
  if (plantTypeLower.includes("tree") ||
      plantTypeLower.includes("oak") ||
      plantTypeLower.includes("pine") ||
      plantTypeLower.includes("maple") ||
      plantTypeLower.includes("birch")) {
    return "Brian"; // Authoritative male voice
  }
  
  // Herbs - light female voice
  if (plantTypeLower.includes("herb") ||
      plantTypeLower.includes("mint") ||
      plantTypeLower.includes("basil") ||
      plantTypeLower.includes("thyme") ||
      plantTypeLower.includes("parsley")) {
    return "Emma"; // Light, cheerful female voice
  }
  
  // Vines and climbers - flowing voice
  if (plantTypeLower.includes("vine") ||
      plantTypeLower.includes("ivy") ||
      plantTypeLower.includes("clematis") ||
      plantTypeLower.includes("creeper")) {
    return "Amy"; // Flowing female voice
  }
  
  // Tropical plants - warm voice
  if (plantTypeLower.includes("palm") ||
      plantTypeLower.includes("monstera") ||
      plantTypeLower.includes("fern") ||
      plantTypeLower.includes("tropical") ||
      plantTypeLower.includes("philodendron")) {
    return "Kimberly"; // Warm, expressive voice
  }
  
  // Default voice
  return "Joanna";
};

export function usePollyTTS(): UsePollyTTSProps {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechText, setSpeechText] = useState<string>("");
  const [speechDuration, setSpeechDuration] = useState<number>(0);
  const [textProgress, setTextProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visualizerAudioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeakTimeRef = useRef<number>(0);
  
  const SPEAK_DEBOUNCE_MS = 500;
  
  const stop = useCallback(() => {
    console.log('Polly TTS: Stop called');
    
    // Stop all audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    if (visualizerAudioRef.current) {
      visualizerAudioRef.current.pause();
      visualizerAudioRef.current.currentTime = 0;
      visualizerAudioRef.current = null;
    }
    
    // Clear timers
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    
    // Reset states
    setIsPlaying(false);
    setIsLoading(false);
    setTextProgress(0);
  }, []);
  
  const startTextProgressTracking = useCallback((duration: number) => {
    setTextProgress(0);
    
    const startTime = Date.now();
    const updateInterval = 100;
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setTextProgress(progress);
      
      if (progress >= 1) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }, updateInterval);
    
    speechTimeoutRef.current = setTimeout(() => {
      console.log('Polly TTS: Safety timeout triggered');
      stop();
    }, duration + 1000);
  }, [stop]);
  
  const speak = useCallback(async (text: string, plantType: string = 'generic') => {
    const now = Date.now();
    if (now - lastSpeakTimeRef.current < SPEAK_DEBOUNCE_MS) {
      console.log("Polly TTS: Speak call debounced");
      return;
    }
    lastSpeakTimeRef.current = now;
    
    stop();
    setIsLoading(true);
    setSpeechText(text);
    
    const estimatedDuration = Math.max(3000, text.length * 80);
    setSpeechDuration(estimatedDuration);
    
    console.log('Polly TTS: Starting speech generation for plant:', plantType);
    
    try {
      const voice = getPollyVoiceForPlant(plantType);
      
      console.log('Polly TTS: Using voice:', voice);
      console.log('Polly TTS: Generating audio for text:', text.substring(0, 100) + '...');
      
      const response = await fetch('https://btqokydfhdavjiwgydif.functions.supabase.co/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voiceId: voice,
          languageCode: 'en-US'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Polly TTS request failed: ${response.status}`);
      }
      
      // Get the audio blob directly from response
      const audioBlob = await response.blob();
      
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('No audio data received from Polly service');
      }
      
      console.log('Polly TTS: Audio blob received, size:', audioBlob.size, 'bytes');
      
      // Create audio URL from blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create main audio for playback
      const mainAudio = new Audio(audioUrl);
      audioRef.current = mainAudio;
      
      // Create visualizer audio (muted)
      const visualizerAudio = new Audio(audioUrl);
      visualizerAudio.muted = true;
      visualizerAudioRef.current = visualizerAudio;
      
      // Setup main audio events
      mainAudio.onloadedmetadata = () => {
        const actualDuration = mainAudio.duration * 1000;
        setSpeechDuration(actualDuration);
        console.log('Polly TTS: Actual duration:', actualDuration);
      };
      
      mainAudio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
        startTextProgressTracking(speechDuration);
        console.log('Polly TTS: Playback started');
        
        // Start visualizer audio
        if (visualizerAudioRef.current) {
          visualizerAudioRef.current.play().catch(console.warn);
        }
      };
      
      mainAudio.onended = () => {
        console.log('Polly TTS: Playback ended');
        // Clean up blob URL
        URL.revokeObjectURL(audioUrl);
        stop();
      };
      
      mainAudio.onerror = (error) => {
        console.error('Polly TTS: Playback error:', error);
        URL.revokeObjectURL(audioUrl);
        stop();
      };
      
      // Start playback immediately (autoplay)
      await mainAudio.play();
      
    } catch (error) {
      console.error('Polly TTS: Error:', error);
      setIsLoading(false);
      stop();
    }
  }, [stop, startTextProgressTracking, speechDuration]);
  
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);
  
  return {
    speak,
    stop,
    isLoading,
    isPlaying,
    speechText,
    speechDuration,
    textProgress
  };
}

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Pause, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Global registry for active audio players
if (typeof window !== 'undefined') {
  window.activeAudioPlayerId = null;
  window.activeAudioPlayer = null;
}

interface AudioPlayerProps {
  message: string;
  plantType: string;
  healthStatus?: number;
  autoPlay?: boolean;
  redirectOnComplete?: boolean;
  onPlayingStateChange?: (isPlaying: boolean) => void;
  onAudioUrlChange?: (url: string | null) => void;
  onVoiceSelected?: (voiceName: string | null) => void;
  preferredVoice?: string | null;
  isPremium?: boolean;
}

const AudioPlayer = ({ 
  message, 
  plantType, 
  healthStatus = 0.85, 
  autoPlay = false,
  redirectOnComplete = false,
  onPlayingStateChange,
  onAudioUrlChange,
  onVoiceSelected,
  preferredVoice = null,
  isPremium = false
}: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const hasAttemptedAutoPlay = useRef(false);
  const audioGeneratedRef = useRef(false);
  
  // Static identifier for this instance
  const instanceIdRef = useRef(`audio-player-${Math.random().toString(36).substring(2, 9)}`);
  console.log(`[TTS] Created audio player instance: ${instanceIdRef.current}`);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Track the voice that was selected for consistency between auto and manual play
  const voiceSelectionRef = useRef<string | null>(preferredVoice);
  
  useEffect(() => {
    // Check for previously saved voice selection
    const savedVoice = sessionStorage.getItem('selected_tts_voice');
    if (savedVoice) {
      voiceSelectionRef.current = savedVoice;
      console.log(`[TTS] ${instanceIdRef.current}: Using previously saved voice: ${savedVoice}`);
    }
    // If preferred voice is provided directly, use that instead
    else if (preferredVoice) {
      voiceSelectionRef.current = preferredVoice;
      console.log(`[TTS] ${instanceIdRef.current}: Using preferred voice: ${preferredVoice}`);
    }
  }, [preferredVoice]);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    // Register in global space to manage multiple players
    window.activeAudioPlayerId = window.activeAudioPlayerId || null;
    window.activeAudioPlayer = window.activeAudioPlayer || null;
    
    return () => {
      console.log(`[TTS] ${instanceIdRef.current}: Component unmounting`);
      isMountedRef.current = false;
      
      // If this instance is the active one, clear it
      if (window.activeAudioPlayerId === instanceIdRef.current) {
        console.log(`[TTS] ${instanceIdRef.current}: Clearing active player reference on unmount`);
        window.activeAudioPlayerId = null;
        window.activeAudioPlayer = null;
      }
      
      // Clean up resources
      cleanupAudio();
    };
  }, []);

  // Update playing state through callback
  useEffect(() => {
    if (onPlayingStateChange) {
      onPlayingStateChange(isPlaying);
    }
  }, [isPlaying, onPlayingStateChange]);

  // Update audio URL through callback
  useEffect(() => {
    if (onAudioUrlChange) {
      onAudioUrlChange(audioUrl);
    }
  }, [audioUrl, onAudioUrlChange]);

  // Clean up function to stop all audio
  const cleanupAudio = () => {
    console.log(`[TTS] ${instanceIdRef.current}: Cleaning up audio`);
    
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    if (isMountedRef.current) {
      setIsPlaying(false);
    }
  };

  // Map plant types to voice characteristics
  const getPlantVoiceCharacteristics = (plantType: string) => {
    const plantTypeLower = plantType.toLowerCase();
    
    // Default voice
    let voiceStyle = {
      pitch: "medium",
      rate: 1.0,
      volume: 1.0,
      emphasis: "",
      preferredVoice: ""
    };
    
    // Cacti and succulents - deeper, slower voice
    if (plantTypeLower.includes("cactus") || 
        plantTypeLower.includes("succulent") || 
        plantTypeLower.includes("aloe") || 
        plantTypeLower.includes("agave")) {
      voiceStyle = {
        pitch: "low",
        rate: 0.9,
        volume: 0.95,
        emphasis: "calm",
        preferredVoice: "Google US English Male" // Deeper male voice
      };
    }
    // Flowering plants - more upbeat voice
    else if (plantTypeLower.includes("rose") || 
             plantTypeLower.includes("lily") ||
             plantTypeLower.includes("tulip") ||
             plantTypeLower.includes("daisy") ||
             plantTypeLower.includes("orchid") ||
             plantTypeLower.includes("flower")) {
      voiceStyle = {
        pitch: "high",
        rate: 1.1,
        volume: 1.0,
        emphasis: "cheerful",
        preferredVoice: "Google US English Female" // Cheerful female voice
      };
    }
    // Trees - strong, deeper voice
    else if (plantTypeLower.includes("tree") ||
             plantTypeLower.includes("oak") ||
             plantTypeLower.includes("pine") ||
             plantTypeLower.includes("maple") ||
             plantTypeLower.includes("birch")) {
      voiceStyle = {
        pitch: "low",
        rate: 0.95,
        volume: 1.0,
        emphasis: "strong",
        preferredVoice: "Google UK English Male" // Deeper, authoritative male voice
      };
    }
    // Herbs - light, breezy voice
    else if (plantTypeLower.includes("herb") ||
             plantTypeLower.includes("mint") ||
             plantTypeLower.includes("basil") ||
             plantTypeLower.includes("thyme") ||
             plantTypeLower.includes("parsley")) {
      voiceStyle = {
        pitch: "medium-high",
        rate: 1.05,
        volume: 0.9,
        emphasis: "bright",
        preferredVoice: "Google UK English Female" // Lighter female voice
      };
    }
    // Vines and climbers - flowing voice
    else if (plantTypeLower.includes("vine") ||
             plantTypeLower.includes("ivy") ||
             plantTypeLower.includes("clematis") ||
             plantTypeLower.includes("creeper")) {
      voiceStyle = {
        pitch: "medium",
        rate: 1.05,
        volume: 0.9,
        emphasis: "flowing",
        preferredVoice: "Google US English Female" // Flowing female voice
      };
    }
    // Tropical plants - warm, expressive voice
    else if (plantTypeLower.includes("palm") ||
             plantTypeLower.includes("monstera") ||
             plantTypeLower.includes("fern") ||
             plantTypeLower.includes("tropical") ||
             plantTypeLower.includes("philodendron")) {
      voiceStyle = {
        pitch: "medium-high",
        rate: 1.0,
        volume: 1.0,
        emphasis: "warm",
        preferredVoice: "Google Australia Male" // Warm, expressive voice
      };
    }
    
    console.log(`[TTS] Voice mapping for "${plantType}":`, voiceStyle);
    return voiceStyle;
  };

  // Find the best matching Google voice from available voices
  const findBestMatchingVoice = (preferredVoice: string, voices: SpeechSynthesisVoice[]) => {
    console.log(`[TTS] ${instanceIdRef.current}: Searching for preferred voice: ${preferredVoice}`);
    console.log(`[TTS] ${instanceIdRef.current}: Available voices: ${voices.map(v => v.name).join(', ')}`);
    
    // First try to use voice from session storage for consistency
    const savedVoice = sessionStorage.getItem('selected_tts_voice');
    if (savedVoice) {
      const matchedVoice = voices.find(v => v.name === savedVoice);
      if (matchedVoice) {
        console.log(`[TTS] ${instanceIdRef.current}: Using voice from session storage: ${savedVoice}`);
        return matchedVoice;
      }
    }
    
    // If we have a previously selected voice, try to find it first
    if (voiceSelectionRef.current) {
      let savedVoice = voices.find(v => v.name === voiceSelectionRef.current);
      if (savedVoice) {
        console.log(`[TTS] ${instanceIdRef.current}: Reusing previously selected voice: ${savedVoice.name}`);
        return savedVoice;
      }
    }

    // First try exact match with preferredVoice
    let voice = voices.find(v => v.name === preferredVoice);
    if (voice) {
      console.log(`[TTS] ${instanceIdRef.current}: Found exact match for ${preferredVoice}`);
      return voice;
    }
    
    // Try partial match with preferredVoice
    voice = voices.find(v => v.name.includes(preferredVoice));
    if (voice) {
      console.log(`[TTS] ${instanceIdRef.current}: Found partial match for ${preferredVoice}: ${voice.name}`);
      return voice;
    }
    
    // If preferredVoice contains "Male" or "Female", try to find any Google voice with that gender
    if (preferredVoice.includes("Male")) {
      voice = voices.find(v => v.name.includes("Google") && v.name.includes("Male"));
      if (voice) {
        console.log(`[TTS] ${instanceIdRef.current}: Found Google male voice: ${voice.name}`);
        return voice;
      }
    } else if (preferredVoice.includes("Female")) {
      voice = voices.find(v => v.name.includes("Google") && v.name.includes("Female"));
      if (voice) {
        console.log(`[TTS] ${instanceIdRef.current}: Found Google female voice: ${voice.name}`);
        return voice;
      }
    }
    
    // Try any Google voice
    voice = voices.find(v => v.name.includes("Google"));
    if (voice) {
      console.log(`[TTS] ${instanceIdRef.current}: Found Google voice: ${voice.name}`);
      return voice;
    }
    
    // Try any natural-sounding voice
    voice = voices.find(v => 
      v.name.includes("Natural") || 
      v.name.includes("Wavenet") || 
      v.name.includes("Neural")
    );
    if (voice) {
      console.log(`[TTS] ${instanceIdRef.current}: Found natural-sounding voice: ${voice.name}`);
      return voice;
    }
    
    // Try other common good voices
    voice = voices.find(v =>
      v.name.includes("Samantha") || 
      v.name.includes("Alex") ||
      v.name.includes("Daniel")
    );
    if (voice) {
      console.log(`[TTS] ${instanceIdRef.current}: Found common good voice: ${voice.name}`);
      return voice;
    }
    
    // Fall back to any English voice
    voice = voices.find(v => v.lang.startsWith('en'));
    if (voice) {
      console.log(`[TTS] ${instanceIdRef.current}: Falling back to English voice: ${voice.name}`);
      return voice;
    }
    
    // Last resort - any voice
    console.log(`[TTS] ${instanceIdRef.current}: No suitable voice found, using default voice`);
    return null;
  };

  // Generate improved SSML based on message, plant type and health
  const generateSSML = (text: string, plantType: string, health: number): string => {
    // Clean the message to remove scientific name and temperature info
    let cleanedText = text
      // Remove scientific names in parentheses or after "also known as"
      .replace(/\(.*?\)/g, '')
      .replace(/also known as.*?\./, '.')
      // Remove temperature references
      .replace(/I prefer temperatures.*?\./i, '')
      .replace(/Temperature.*?\./i, '')
      // Clean up any double spaces or periods
      .replace(/\.\s*\./g, '.')
      .replace(/\s{2,}/g, ' ');
      
    // Get voice characteristics based on plant type
    const voiceStyle = getPlantVoiceCharacteristics(plantType);
    
    // Adjust prosody based on plant health and type
    const pitch = health < 0.7 ? "low" : (voiceStyle.pitch || "medium");
    const rate = voiceStyle.rate || 1.0;
    
    // Add more emotional cues and pauses for better expressivity
    const enhancedText = cleanedText
      .replace(/\./g, '.<break time="500ms"/>')
      .replace(/!/g, '!<break time="700ms"/>');
      
    return `<speak><prosody pitch='${pitch}' rate='${rate}'>${enhancedText}</prosody></speak>`;
  };

  // Browser speech synthesis with improved voice selection
  const useBrowserTTS = (message: string) => {
    console.log(`[TTS] ${instanceIdRef.current}: Using browser TTS`);
    
    // Stop any other playing audio
    if (window.activeAudioPlayer && window.activeAudioPlayerId !== instanceIdRef.current) {
      window.activeAudioPlayer();
    }
    
    // Register this instance as active
    window.activeAudioPlayerId = instanceIdRef.current;
    window.activeAudioPlayer = cleanupAudio;
    
    // Reset audio URL as we're using the browser's speech synthesis
    setAudioUrl(null);
    audioGeneratedRef.current = true;
    
    if ('speechSynthesis' in window) {
      // Clean message to remove scientific name and temperature info
      let cleanedMessage = message
        .replace(/\(.*?\)/g, '')
        .replace(/also known as.*?\./, '.')
        .replace(/I prefer temperatures.*?\./i, '')
        .replace(/Temperature.*?\./i, '')
        .replace(/\.\s*\./g, '.')
        .replace(/\s{2,}/g, ' ');
        
      // Get voice characteristics based on plant type
      const voiceStyle = getPlantVoiceCharacteristics(plantType);
        
      const utterance = new SpeechSynthesisUtterance(cleanedMessage);
      utterance.rate = voiceStyle.rate;
      utterance.pitch = healthStatus < 0.7 ? 0.8 : (voiceStyle.pitch === "low" ? 0.8 : voiceStyle.pitch === "high" ? 1.2 : 1.0);
      utterance.lang = 'en-US';
      utterance.volume = voiceStyle.volume;
      
      // Preload voices to ensure they're available
      setTimeout(() => {
        const voices = speechSynthesis.getVoices();
        console.log(`[TTS] ${instanceIdRef.current}: Available voices:`, voices.length);
        
        // Use our enhanced voice selection function with the preferred voice for this plant
        const selectedVoice = findBestMatchingVoice(voiceStyle.preferredVoice, voices);
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          setSelectedVoiceName(selectedVoice.name);
          voiceSelectionRef.current = selectedVoice.name;
          
          // Save voice selection to session storage for consistency
          sessionStorage.setItem('selected_tts_voice', selectedVoice.name);
          
          // Notify parent of selected voice
          if (onVoiceSelected && selectedVoice.name) {
            onVoiceSelected(selectedVoice.name);
          }
          
          console.log(`[TTS] ${instanceIdRef.current}: Selected voice: ${selectedVoice.name}`);
        } else {
          console.log(`[TTS] ${instanceIdRef.current}: No suitable voice found, using default`);
          setSelectedVoiceName("Default");
          voiceSelectionRef.current = null;
          sessionStorage.removeItem('selected_tts_voice');
          
          if (onVoiceSelected) {
            onVoiceSelected(null);
          }
        }
        
        utterance.onend = () => {
          console.log(`[TTS] ${instanceIdRef.current}: Browser speech completed`);
          
          if (isMountedRef.current) {
            setIsPlaying(false);
          }
          
          // Clear active player reference
          window.activeAudioPlayerId = null;
          window.activeAudioPlayer = null;
          
          // Redirect to pricing page after completion if requested
          if (redirectOnComplete) {
            console.log(`[TTS] ${instanceIdRef.current}: Redirecting to pricing page`);
            setTimeout(() => navigate('/pricing'), 1000);
          }
        };
        
        utterance.onstart = () => {
          setIsPlaying(true);
        };
        
        console.log(`[TTS] ${instanceIdRef.current}: Starting browser speech with voice: ${utterance.voice?.name || 'default'}`);
        speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  // Handle play/stop/pause audio
  const handleToggleAudio = async () => {
    // If already playing, pause the audio
    if (isPlaying) {
      cleanupAudio();
      return;
    }
    
    // Stop any other playing audio
    if (window.activeAudioPlayer && window.activeAudioPlayerId !== instanceIdRef.current) {
      console.log(`[TTS] ${instanceIdRef.current}: Stopping other player: ${window.activeAudioPlayerId}`);
      window.activeAudioPlayer();
    }
    
    // Register this instance as active
    window.activeAudioPlayerId = instanceIdRef.current;
    window.activeAudioPlayer = cleanupAudio;
    
    // If audio exists but is paused, resume it
    if (audio && audioGeneratedRef.current) {
      try {
        await audio.play();
        setIsPlaying(true);
        return;
      } catch (error) {
        console.error(`[TTS] ${instanceIdRef.current}: Error resuming audio:`, error);
      }
    }
    
    // Otherwise, generate new audio
    try {
      setIsLoading(true);
      console.log(`[TTS] ${instanceIdRef.current}: Starting TTS for`, plantType);
      const ssml = generateSSML(message, plantType, healthStatus);
      
      // Create payload with only plantType and ssml as requested
      const requestPayload = {
        plantType: plantType,
        ssml: ssml
      };
      
      console.log(`[TTS] ${instanceIdRef.current}: TTS Request:`, requestPayload);
      
      // Call the Supabase TTS function with updated CORS configuration
      const response = await fetch('https://btqokydfhdavjiwgydif.functions.supabase.co/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });
      
      console.log(`[TTS] ${instanceIdRef.current}: TTS Response status:`, response.status);
      
      if (!response.ok) {
        throw new Error(`TTS request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[TTS] ${instanceIdRef.current}: Parsed response data:`, data);
      
      if (!data.audioUrl) {
        throw new Error("Response missing audioUrl");
      }
      
      console.log(`[TTS] ${instanceIdRef.current}: Audio URL received:`, data.audioUrl.substring(0, 50) + "...");
      
      // Store the audio URL
      setAudioUrl(data.audioUrl);
      audioGeneratedRef.current = true;
      
      // Use browser TTS for actual playback with same text for consistency
      useBrowserTTS(message);
      
    } catch (error) {
      console.error(`[TTS] ${instanceIdRef.current}: TTS Error:`, error);
      useBrowserTTS(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle auto-play when component mounts
  useEffect(() => {
    if (autoPlay && !hasAttemptedAutoPlay.current) {
      console.log(`[TTS] ${instanceIdRef.current}: Auto-play triggered`);
      hasAttemptedAutoPlay.current = true;
      
      // Check if first visit to control autoplay
      const hasVisited = sessionStorage.getItem('has_visited_result_page');
      const capturedTimestamp = sessionStorage.getItem('captureTimestamp');
      const lastProcessedTimestamp = sessionStorage.getItem('lastProcessedTimestamp');
      
      // Play automatically if it's first visit or a new plant image has been uploaded
      if (!hasVisited || (capturedTimestamp && lastProcessedTimestamp !== capturedTimestamp)) {
        // Small delay to ensure component is fully mounted
        const timer = setTimeout(() => {
          handleToggleAudio();
          sessionStorage.setItem('has_visited_result_page', 'true');
          
          // Store the timestamp of the processed image to prevent repeat playback of the same image
          if (capturedTimestamp) {
            sessionStorage.setItem('lastProcessedTimestamp', capturedTimestamp);
          }
        }, 800);
        
        return () => clearTimeout(timer);
      } else {
        console.log(`[TTS] ${instanceIdRef.current}: Skipping auto-play, page already visited`);
      }
    }
    
    // Cleanup function
    return () => {
      cleanupAudio();
    };
  }, [autoPlay, message]);

  return (
    <Button 
      onClick={handleToggleAudio}
      variant="ghost" 
      size="sm"
      className="h-8 w-8 p-0"
      disabled={isLoading}
      aria-label={isPlaying ? "Pause audio" : "Play audio"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
};

// Declare global properties to manage active audio players
declare global {
  interface Window {
    activeAudioPlayerId: string | null;
    activeAudioPlayer: (() => void) | null;
  }
}

export default AudioPlayer;

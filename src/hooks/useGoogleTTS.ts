
import { useState, useRef, useCallback } from 'react';
import { detectTextLanguage } from '@/utils/languageDetection';

interface UseGoogleTTSReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isLoading: boolean;
  isPlaying: boolean;
  analyser: AnalyserNode | null;
}

export function useGoogleTTS(): UseGoogleTTSReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // STOP FUNCTION CHE FUNZIONA DAVVERO
  const stop = useCallback(() => {
    console.log('🔊 [GoogleTTS] STOPPING audio completely');
    
    // Stop audio immediately
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    
    // Reset all states
    setIsPlaying(false);
    setIsLoading(false);
    setAnalyser(null);
    
    // Cleanup audio context
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.log('Audio context already closed');
      }
      audioContextRef.current = null;
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    console.log('🔊 [GoogleTTS] Starting TTS for:', text.substring(0, 50) + '...');
    
    // RILEVA LA LINGUA DEL TESTO AUTOMATICAMENTE
    const detectedLanguage = detectTextLanguage(text);
    console.log('🔊 [GoogleTTS] Language detected:', detectedLanguage);
    
    // STOP COMPLETAMENTE qualsiasi audio esistente
    stop();
    
    // Small delay to ensure cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setIsLoading(true);

    try {
      // Configura voce basata sulla lingua rilevata
      const voiceConfig = detectedLanguage === 'it' 
        ? { name: 'it-IT-Wavenet-A', gender: 'FEMALE', language: 'it' }
        : { name: 'en-US-Wavenet-F', gender: 'FEMALE', language: 'en' };

      console.log('🔊 [GoogleTTS] Using voice config:', voiceConfig);

      // Call Supabase Edge Function for Google TTS with AUTO-DETECTED LANGUAGE
      const response = await fetch("https://btqokydfhdavjiwgydif.functions.supabase.co/tts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          plantType: 'default',
          ssml: `<speak>${text}</speak>`,
          language: detectedLanguage, // USA LA LINGUA RILEVATA
          voiceConfig: voiceConfig
        })
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const data = await response.json();
      const audioUrl = data?.audioUrl;
      
      if (!audioUrl) {
        throw new Error('No audio URL received');
      }

      console.log('🔊 [GoogleTTS] Audio URL received, setting up NEW audio...');

      // Create NEW audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Setup NEW audio context for waveform visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioContext = audioContextRef.current;
      
      // Create analyser for waveform
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
      
      setAnalyser(analyserNode);

      audio.oncanplay = () => {
        console.log('🔊 [GoogleTTS] Audio ready');
        setIsLoading(false);
      };

      audio.onplay = () => {
        console.log('🔊 [GoogleTTS] Audio PLAYING');
        setIsPlaying(true);
      };

      audio.onpause = () => {
        console.log('🔊 [GoogleTTS] Audio PAUSED');
        setIsPlaying(false);
      };

      audio.onended = () => {
        console.log('🔊 [GoogleTTS] Audio ENDED');
        setIsPlaying(false);
        setAnalyser(null);
      };

      audio.onerror = (e) => {
        console.error('🔊 [GoogleTTS] Audio error:', e);
        setIsLoading(false);
        setIsPlaying(false);
        setAnalyser(null);
      };

      // Start playing
      await audio.play();

    } catch (error) {
      console.error('🔊 [GoogleTTS] Error:', error);
      setIsLoading(false);
      setIsPlaying(false);
      setAnalyser(null);
    }
  }, [stop]);

  return {
    speak,
    stop,
    isLoading,
    isPlaying,
    analyser
  };
}

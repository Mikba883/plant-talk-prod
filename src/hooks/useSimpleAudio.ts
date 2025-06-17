
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSimpleAudioProps {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isLoading: boolean;
  isPlaying: boolean;
  analyser: AnalyserNode | null;
}

export function useSimpleAudio(): UseSimpleAudioProps {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const stop = useCallback(() => {
    console.log('🔊 [SimpleAudio] Stopping audio...');
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    console.log('🔊 [SimpleAudio] STARTING ENGLISH TTS:', text.substring(0, 50) + '...');
    
    // Stop any existing audio
    stop();
    setIsLoading(true);

    try {
      // FORCE ENGLISH - Use Google TTS with English language forced
      console.log('🔊 [SimpleAudio] FORCING ENGLISH for TTS');
      
      const response = await fetch("https://btqokydfhdavjiwgydif.functions.supabase.co/tts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          plantType: 'default',
          ssml: `<speak><prosody pitch='medium'>${text}</prosody></speak>`,
          language: 'en',
          voiceConfig: { name: 'en-US-Standard-C', gender: 'FEMALE' }
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

      console.log('🔊 [SimpleAudio] Audio URL received, creating player...');

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Create audio context WITHOUT createMediaElementSource
      // This avoids the problematic error
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create analyzer for visualization WITHOUT connecting to audio element
      const newAnalyser = audioContext.createAnalyser();
      newAnalyser.fftSize = 256;
      setAnalyser(newAnalyser);

      // Simple event handlers
      audio.oncanplay = () => {
        console.log('🔊 [SimpleAudio] Audio ready');
        setIsLoading(false);
      };

      audio.onplay = () => {
        console.log('🔊 [SimpleAudio] Audio started');
        setIsPlaying(true);
      };

      audio.onpause = () => {
        console.log('🔊 [SimpleAudio] Audio paused');
        setIsPlaying(false);
      };

      audio.onended = () => {
        console.log('🔊 [SimpleAudio] Audio ended');
        setIsPlaying(false);
        setAnalyser(null);
      };

      audio.onerror = (e) => {
        console.error('🔊 [SimpleAudio] Audio error:', e);
        setIsLoading(false);
        setIsPlaying(false);
        setAnalyser(null);
      };

      await audio.play();

    } catch (error) {
      console.error('🔊 [SimpleAudio] TTS Error:', error);
      setIsLoading(false);
      setIsPlaying(false);
      setAnalyser(null);
      
      // INTELLIGENT FALLBACK: Use browser TTS as backup
      console.log('🔊 [SimpleAudio] Falling back to browser TTS (ENGLISH)');
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
      }
    }
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stop]);

  return {
    speak,
    stop,
    isLoading,
    isPlaying,
    analyser
  };
}

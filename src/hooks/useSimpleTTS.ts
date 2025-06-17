
import { useState, useRef, useCallback } from 'react';

interface UseSimpleTTSProps {
  speak: (text: string) => void;
  stop: () => void;
  isLoading: boolean;
  isPlaying: boolean;
}

// Gestione globale per evitare audio multipli
let globalAudioInstance: HTMLAudioElement | null = null;
let globalIsPlaying = false;

export function useSimpleTTS(): UseSimpleTTSProps {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const stop = useCallback(() => {
    console.log('🔊 [SimpleAudio] Stopping audio...');
    
    // Ferma qualsiasi richiesta in corso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Ferma l'audio globale
    if (globalAudioInstance) {
      globalAudioInstance.pause();
      globalAudioInstance.currentTime = 0;
      globalAudioInstance = null;
    }
    
    globalIsPlaying = false;
    setIsPlaying(false);
    setIsLoading(false);
  }, []);
  
  const speak = useCallback(async (text: string) => {
    console.log('🔊 [SimpleAudio] STARTING ENGLISH TTS:', text.substring(0, 50) + '...');
    
    // Ferma qualsiasi audio precedente
    stop();
    
    setIsLoading(true);
    
    // FORZA SEMPRE INGLESE per evitare problemi
    console.log('🔊 [SimpleAudio] FORCING ENGLISH for TTS');
    
    try {
      // Crea nuovo controller per questa richiesta
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('https://btqokydfhdavjiwgydif.functions.supabase.co/generate-audio-gcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0cW9reWRmaGRhdmppd2d5ZGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MjU0NTAsImV4cCI6MjA2MzQwMTQ1MH0.GeHg6BUK16BmSB4W5PLVlgHuxaufKCLehpWbMVR-v9k',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0cW9reWRmaGRhdmppd2d5ZGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MjU0NTAsImV4cCI6MjA2MzQwMTQ1MH0.GeHg6BUK16BmSB4W5PLVlgHuxaufKCLehpWbMVR-v9k'
        },
        body: JSON.stringify({
          text: text,
          voiceName: "en-US-Journey-D", // Voce inglese fissa
          languageCode: "en-US",
          useSSML: false
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.audioContent) {
        throw new Error('No audio content received');
      }

      console.log('🔊 [SimpleAudio] Audio URL received, creating player...');
      
      // Converti base64 a blob
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);
      
      // Crea nuovo audio player
      const audio = new Audio(audioUrl);
      globalAudioInstance = audio;
      
      audio.onloadeddata = () => {
        console.log('🔊 [SimpleAudio] Audio ready');
        setIsLoading(false);
      };
      
      audio.onplay = () => {
        console.log('🔊 [SimpleAudio] Audio started');
        globalIsPlaying = true;
        setIsPlaying(true);
      };
      
      audio.onpause = () => {
        console.log('🔊 [SimpleAudio] Audio paused');
        globalIsPlaying = false;
        setIsPlaying(false);
      };
      
      audio.onended = () => {
        console.log('🔊 [SimpleAudio] Audio ended');
        globalIsPlaying = false;
        setIsPlaying(false);
        globalAudioInstance = null;
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (e) => {
        console.error('🔊 [SimpleAudio] Audio error:', e);
        setIsLoading(false);
        setIsPlaying(false);
        globalIsPlaying = false;
        globalAudioInstance = null;
        URL.revokeObjectURL(audioUrl);
      };
      
      // Avvia riproduzione
      await audio.play();
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🔊 [SimpleAudio] Request aborted');
        return;
      }
      
      console.error('🔊 [SimpleAudio] TTS Error:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [stop]);
  
  return {
    speak,
    stop,
    isLoading,
    isPlaying: isPlaying || globalIsPlaying
  };
}

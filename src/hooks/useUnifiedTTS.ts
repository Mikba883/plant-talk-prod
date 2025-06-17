
import { useState, useRef, useCallback, useEffect } from 'react';
import { detectTextLanguage } from '@/utils/languageDetection';
import { getVoiceByPlantType } from '@/utils/googleVoiceMapping';

interface UseUnifiedTTSProps {
  speak: (text: string, plantType?: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  repeat: () => void;
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  analyser: AnalyserNode | null;
}

export function useUnifiedTTS(): UseUnifiedTTSProps {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastMessageRef = useRef<{ text: string; plantType?: string } | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);
  const isProcessingRef = useRef(false); // AGGIUNTO: flag per evitare chiamate multiple

  const pause = useCallback(() => {
    console.log('🔊 [UnifiedTTS] Pausing audio...');
    
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    console.log('🔊 [UnifiedTTS] Resuming audio...');
    
    if (audioRef.current && audioRef.current.paused && isPaused) {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsPaused(false);
        
        if (audioContextRef.current && !analyser) {
          const newAnalyser = audioContextRef.current.createAnalyser();
          newAnalyser.fftSize = 256;
          setAnalyser(newAnalyser);
          
          try {
            const source = audioContextRef.current.createMediaElementSource(audioRef.current);
            source.connect(newAnalyser);
            newAnalyser.connect(audioContextRef.current.destination);
          } catch (error) {
            console.log('🔊 [UnifiedTTS] Source already connected');
          }
        }
      }).catch(error => {
        console.error('🔊 [UnifiedTTS] Error resuming audio:', error);
      });
    }
  }, [isPaused, analyser]);

  const stop = useCallback(() => {
    console.log('🔊 [UnifiedTTS] Stopping audio completely...');
    
    // Reset flag di processing
    isProcessingRef.current = false;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.suspend();
    }
    
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setAnalyser(null);
    
    currentAudioUrlRef.current = null;
    audioRef.current = null;
  }, []);

  const speak = useCallback(async (text: string, plantType?: string) => {
    // CONTROLLO: evita chiamate multiple simultanee
    if (isProcessingRef.current) {
      console.log('🔊 [UnifiedTTS] Already processing speech, ignoring duplicate call');
      return;
    }
    
    console.log('🔊 [UnifiedTTS] Starting speech synthesis:', text.substring(0, 50) + '...');
    console.log('🔊 [UnifiedTTS] Plant type:', plantType);
    
    // Imposta il flag di processing
    isProcessingRef.current = true;
    
    if (isPlaying || isPaused || audioRef.current) {
      console.log('🔊 [UnifiedTTS] FORCE STOPPING current audio before starting new one');
      stop();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsLoading(true);
    lastMessageRef.current = { text, plantType };

    try {
      const detectedLanguage = detectTextLanguage(text);
      console.log('🔊 [UnifiedTTS] Language auto-detected from text:', detectedLanguage);
      
      let voiceConfig;
      if (plantType) {
        voiceConfig = getVoiceByPlantType(plantType);
        console.log('🔊 [UnifiedTTS] Using plant-specific voice:', voiceConfig, 'for plant:', plantType);
      } else {
        voiceConfig = detectedLanguage === 'it' 
          ? { voiceName: 'it-IT-Wavenet-A', languageCode: 'it-IT' }
          : { voiceName: 'en-US-Wavenet-C', languageCode: 'en-US' };
        console.log('🔊 [UnifiedTTS] Using default voice:', voiceConfig);
      }

      const response = await fetch("https://btqokydfhdavjiwgydif.functions.supabase.co/tts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          plantType: plantType || 'default',
          ssml: `<speak><prosody pitch='medium'>${text}</prosody></speak>`,
          language: detectedLanguage,
          voiceConfig: {
            name: voiceConfig.voiceName,
            gender: 'FEMALE',
            language: detectedLanguage
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Google TTS request failed: ${response.status}`);
      }

      const data = await response.json();
      const audioUrl = data?.audioUrl;
      
      if (!audioUrl) {
        throw new Error('No audio URL received from Google TTS');
      }

      console.log(`🔊 [UnifiedTTS] Google TTS audio URL received (${detectedLanguage}, voice: ${voiceConfig.voiceName}), setting up playback...`);

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const newAnalyser = audioContext.createAnalyser();
      newAnalyser.fftSize = 256;
      setAnalyser(newAnalyser);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      currentAudioUrlRef.current = audioUrl;

      const source = audioContext.createMediaElementSource(audio);
      source.connect(newAnalyser);
      newAnalyser.connect(audioContext.destination);

      audio.onloadstart = () => {
        console.log('🔊 [UnifiedTTS] Loading Google TTS audio...');
      };

      audio.oncanplay = () => {
        console.log('🔊 [UnifiedTTS] Google TTS audio ready to play');
        setIsLoading(false);
      };

      audio.onplay = () => {
        console.log('🔊 [UnifiedTTS] Google TTS audio started');
        setIsPlaying(true);
        setIsPaused(false);
      };

      audio.onpause = () => {
        console.log('🔊 [UnifiedTTS] Google TTS audio paused');
        setIsPlaying(false);
        if (audio.currentTime > 0 && audio.currentTime < audio.duration) {
          setIsPaused(true);
        }
      };

      audio.onended = () => {
        console.log('🔊 [UnifiedTTS] Google TTS audio ended');
        setIsPlaying(false);
        setIsPaused(false);
        setAnalyser(null);
        isProcessingRef.current = false; // Reset flag quando finisce
      };

      audio.onerror = (e) => {
        console.error('🔊 [UnifiedTTS] Google TTS audio error:', e);
        setIsLoading(false);
        setIsPlaying(false);
        setIsPaused(false);
        setAnalyser(null);
        currentAudioUrlRef.current = null;
        audioRef.current = null;
        isProcessingRef.current = false; // Reset flag in caso di errore
      };

      await audio.play();

    } catch (error) {
      console.error('🔊 [UnifiedTTS] Google TTS Error:', error);
      setIsLoading(false);
      setIsPlaying(false);
      setIsPaused(false);
      setAnalyser(null);
      
      currentAudioUrlRef.current = null;
      audioRef.current = null;
      isProcessingRef.current = false; // Reset flag in caso di errore
      
      console.error('🔊 [UnifiedTTS] Google TTS failed - no fallback used');
    }
  }, [isPlaying, isPaused, stop]);

  const repeat = useCallback(() => {
    if (lastMessageRef.current) {
      console.log('🔄 [UnifiedTTS] Repeating last message');
      speak(lastMessageRef.current.text, lastMessageRef.current.plantType);
    } else {
      console.warn('🔄 [UnifiedTTS] No message to repeat');
    }
  }, [speak]);

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
    pause,
    resume,
    stop,
    repeat,
    isLoading,
    isPlaying,
    isPaused,
    analyser
  };
}

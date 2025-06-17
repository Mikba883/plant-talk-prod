
import { useRef, useState, useEffect } from 'react';

export const usePlantSpeech = (plantData: any, ttsTriggered: boolean, setTtsTriggered: (triggered: boolean) => void) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visualizerAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisActiveRef = useRef<boolean>(false);
  const [visualizerAudioUrl, setVisualizerAudioUrl] = useState<string | null>(null);
  // Track the speech text to ensure consistency between TTS systems
  const [speechText, setSpeechText] = useState<string>("");
  // Flag to track if ElevenLabs audio is ready
  const [elevenLabsReady, setElevenLabsReady] = useState<boolean>(false);
  
  // Only run TTS when explicitly triggered
  useEffect(() => {
    if (plantData && ttsTriggered) {
      console.log("🔊 TTS triggered for plant:", plantData.name);
      
      // Cancel any existing speech synthesis or audio
      cleanupAudio();
      
      // Prepare text for speech based on premium status
      const isPremium = sessionStorage.getItem('is_premium') === 'true';
      let textToRead = "";
      
      if (isPremium) {
        // Premium users get detailed plant information
        textToRead = `Hi! I'm your ${plantData.name}. `;
        
        if (plantData.description) {
          textToRead += `${plantData.description} `;
        }
        
        if (plantData.healthProbability !== undefined) {
          if (plantData.healthProbability > 0.85) {
            textToRead += "I'm feeling very healthy right now! ";
          } else if (plantData.healthProbability > 0.7) {
            textToRead += "I'm doing pretty well. ";
          } else {
            textToRead += "I could use some attention. ";
          }
        }
        
        if (plantData.careInfo) {
          if (plantData.careInfo.light) {
            textToRead += `For light, I need ${plantData.careInfo.light}. `;
          }
          if (plantData.careInfo.water) {
            textToRead += `${plantData.careInfo.water} `;
          }
        }
      } else {
        // Free version gets the basic template
        const waterMin = "250";
        const waterMax = "350";
        const sunlightPref = plantData.careInfo?.light || "moderate to bright indirect light";
        
        textToRead = `Hi! I'm your ${plantData.name}. `;
        textToRead += `I usually enjoy ${sunlightPref}, and I need about ${waterMin} to ${waterMax} milliliters of water per week. `;
        textToRead += `If you really want to take care of me, you can unlock the Premium Mode — it lets me tell you how I'm actually feeling, what symptoms I have, and what I truly need to thrive. Would you like to hear more?`;
      }
      
      // Store the speech text for consistency
      setSpeechText(textToRead);
      
      try {
        // First fetch ElevenLabs audio for visualizer (muted)
        fetchElevenLabsAudioForVisualizer(textToRead, plantData.name)
          .then(() => {
            // Once ElevenLabs audio is ready (or failed), use browser's TTS for actual playback
            useBrowserTTS(textToRead, plantData.name);
          })
          .catch(error => {
            console.error("🌊 ElevenLabs fetch error:", error);
            // Fall back to browser TTS even if ElevenLabs fails
            useBrowserTTS(textToRead, plantData.name);
          });
      } catch (error) {
        console.error("Error with TTS:", error);
        // Fall back to browser TTS
        useBrowserTTS(textToRead, plantData.name);
        setTtsTriggered(false);
      }
    }
    
    // Cleanup function
    return () => {
      cleanupAudio();
    };
  }, [plantData, ttsTriggered, setTtsTriggered]);

  // Fetch ElevenLabs audio for visualizer (muted)
  const fetchElevenLabsAudioForVisualizer = async (text: string, plantType: string) => {
    try {
      console.log("🌊 Fetching ElevenLabs audio for visualizer");
      
      // Generate SSML for better speech
      const ssml = `<speak>${text}</speak>`;
      
      // Call the Supabase TTS function
      const response = await fetch('https://btqokydfhdavjiwgydif.functions.supabase.co/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plantType,
          ssml
        })
      });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs TTS request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.audioUrl) {
        throw new Error("Response missing audioUrl");
      }
      
      console.log("🌊 Visualizer audio URL received");
      
      // Store the audio URL for visualizer
      setVisualizerAudioUrl(data.audioUrl);
      setElevenLabsReady(true);
      
      // Create visualizer audio (muted)
      const visualizerAudio = new Audio(data.audioUrl);
      visualizerAudio.muted = true;  // Important: muted for visualizer only
      
      visualizerAudio.oncanplaythrough = () => {
        console.log("🌊 Visualizer audio ready to play");
        
        // Play it muted to drive the visualizer
        visualizerAudio.play().catch(error => {
          console.error("🌊 Error playing visualizer audio:", error);
          // Fall back to simulated visualization if needed
        });
      };
      
      visualizerAudio.onerror = (e) => {
        console.error("🌊 Visualizer audio load error:", e);
      };
      
      visualizerAudioRef.current = visualizerAudio;
      
    } catch (error) {
      console.error("🌊 ElevenLabs audio fetch error:", error);
      // Visual-only fallback will be used
      setElevenLabsReady(false);
      throw error;
    }
  };
  
  // Browser speech synthesis
  const useBrowserTTS = (message: string, plantType: string) => {
    if ('speechSynthesis' in window) {
      // Clean message to match what will be used by ElevenLabs
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      
      // Try to use a more natural voice if available
      // Preload voices with a small delay to ensure they're available
      setTimeout(() => {
        console.log("🔊 Attempting to find natural voice for TTS...");
        
        const voices = speechSynthesis.getVoices();
        console.log("🔊 Available TTS voices:", voices.map(v => `${v.name} (${v.lang})`).join(', '));
        
        // First try to use voice from session storage for consistency
        const savedVoice = sessionStorage.getItem('selected_tts_voice');
        if (savedVoice) {
          const matchedVoice = voices.find(v => v.name === savedVoice);
          if (matchedVoice) {
            console.log(`🔊 Using voice from session storage: ${savedVoice}`);
            utterance.voice = matchedVoice;
          }
        } else {
          // Try to find Google voices first (most natural)
          let selectedVoice = voices.find(voice => 
            voice.name.includes('Google') && voice.lang.startsWith('en')
          );
          
          // If no Google voice, try other natural sounding options
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => 
              (voice.name.includes('Natural') || 
               voice.name.includes('Samantha') ||
               voice.name.includes('Daniel'))
              && voice.lang.startsWith('en')
            );
          }
          
          // If still no match, find any English voice
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
          }
          
          if (selectedVoice) {
            console.log("🔊 Using voice:", selectedVoice.name);
            utterance.voice = selectedVoice;
            // Save the selected voice to ensure consistency
            sessionStorage.setItem('selected_tts_voice', selectedVoice.name);
          } else {
            console.log("🔊 No suitable voice found, using default voice");
          }
        }
        
        // Set ref to indicate speech synthesis is active
        speechSynthesisActiveRef.current = true;
        
        // Add event listeners for speech end
        utterance.onend = () => {
          console.log("🔊 TTS completed");
          speechSynthesisActiveRef.current = false;
          setTtsTriggered(false);
          
          // Also stop the visualizer audio when TTS completes
          if (visualizerAudioRef.current) {
            visualizerAudioRef.current.pause();
            visualizerAudioRef.current.currentTime = 0;
          }
        };
        
        utterance.onerror = (e) => {
          console.error("🔊 TTS error:", e);
          speechSynthesisActiveRef.current = false;
          setTtsTriggered(false);
          
          // Also stop the visualizer audio on error
          if (visualizerAudioRef.current) {
            visualizerAudioRef.current.pause();
            visualizerAudioRef.current.currentTime = 0;
          }
        };
        
        // Store that we've already done TTS to prevent autoplay on refresh
        sessionStorage.setItem('has_visited_result_page', 'true');
        
        // Store the speech text for consistency with button press
        sessionStorage.setItem('last_speech_text', message);
        
        // Speak!
        window.speechSynthesis.speak(utterance);
      }, 300);
    }
  };
  
  const cleanupAudio = () => {
    // Cancel any existing speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      speechSynthesisActiveRef.current = false;
    }
    
    // Stop any audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    // Stop visualizer audio
    if (visualizerAudioRef.current) {
      visualizerAudioRef.current.pause();
      visualizerAudioRef.current.currentTime = 0;
      visualizerAudioRef.current = null;
    }
  };
  
  return { 
    audioRef, 
    cleanupAudio,
    visualizerAudioUrl,
    visualizerAudioRef,
    speechText,
    elevenLabsReady
  };
};

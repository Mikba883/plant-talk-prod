
import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  speechText?: string;
  duration?: number;
  textProgress?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  isPlaying, 
  speechText, 
  duration,
  textProgress = 0 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Stop animation immediately when not playing
  useEffect(() => {
    if (!isPlaying) {
      console.log('AudioVisualizer: Stopping animation');
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }
    
    console.log('AudioVisualizer: Starting animation');
    drawPollyBasedVisualization();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, textProgress, speechText]);

  // Enhanced text-based intensity calculation for Polly audio
  const getPollyTextIntensity = (barIndex: number, totalBars: number): number => {
    if (!speechText || speechText.length === 0) {
      // More dynamic base animation when no text
      const time = Date.now() * 0.005;
      return 0.3 + Math.sin(time + barIndex * 0.6) * 0.25 + Math.sin(time * 1.8 + barIndex * 0.4) * 0.15;
    }
    
    // Calculate text position based on progress
    const textPosition = Math.floor(textProgress * speechText.length);
    const textSegmentSize = Math.max(1, Math.floor(speechText.length / totalBars));
    const segmentStart = barIndex * textSegmentSize;
    const segmentEnd = Math.min(segmentStart + textSegmentSize, speechText.length);
    
    let segmentIntensity = 0.15; // Lower base intensity
    
    // Analyze text segment with enhanced character weights
    for (let i = segmentStart; i < segmentEnd; i++) {
      const char = speechText[i];
      const charCode = char.charCodeAt(0);
      
      // Enhanced vowel detection (stronger response)
      if ('aeiouAEIOU'.includes(char)) {
        segmentIntensity += 0.35;
      }
      
      // Strong consonants (plosives and fricatives)
      if ('bcdgkpqtBCDGKPQT'.includes(char)) {
        segmentIntensity += 0.28;
      }
      
      // Soft consonants
      if ('fhlmnrsvwzFHLMNRSVWZ'.includes(char)) {
        segmentIntensity += 0.15;
      }
      
      // SSML tags detection (Polly-specific)
      if (char === '<' || char === '>') {
        segmentIntensity += 0.1;
      }
      
      // Punctuation effects (enhanced for Polly's natural pauses)
      if ('!?'.includes(char)) {
        segmentIntensity += 0.6;
      } else if ('.,:;'.includes(char)) {
        segmentIntensity += 0.4;
      }
      
      // Character code variation
      segmentIntensity += (charCode % 25) / 100;
    }
    
    // Enhanced center bias (more pronounced bell curve)
    const centerDistance = Math.abs((barIndex / totalBars) - 0.5);
    const centerEffect = 1 - centerDistance * 0.8;
    segmentIntensity *= centerEffect;
    
    // Progress effect (stronger for read text)
    if (textPosition >= segmentStart) {
      const readProgress = Math.min(1, (textPosition - segmentStart) / textSegmentSize);
      segmentIntensity *= (1 + readProgress * 0.7);
    }
    
    // Multiple time-based waves for more organic movement
    const time = Date.now() * 0.006;
    const timeWave1 = Math.sin(time + barIndex * 0.5) * 0.2;
    const timeWave2 = Math.sin(time * 2.1 + barIndex * 0.8) * 0.12;
    const timeWave3 = Math.sin(time * 0.7 + barIndex * 1.5) * 0.08;
    segmentIntensity += timeWave1 + timeWave2 + timeWave3;
    
    // Speech rhythm effect (simulates natural speech patterns)
    const speechRhythm = Math.sin(textProgress * Math.PI * 12) * 0.15;
    segmentIntensity += speechRhythm;
    
    // Clamp between wider range for more dynamic visualization
    return Math.min(1.2, Math.max(0.08, segmentIntensity));
  };

  const drawPollyBasedVisualization = () => {
    if (!isPlaying) {
      console.log('AudioVisualizer: Animation stopped mid-frame');
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const center = height / 2;
    
    const barCount = 52; // More bars for smoother effect
    const barWidth = (width / barCount) * 0.85;
    const barGap = (width - (barWidth * barCount)) / (barCount + 1);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Enhanced gradients for Polly visualization
    const topGradient = ctx.createLinearGradient(0, center, 0, 0);
    topGradient.addColorStop(0, 'rgba(34, 197, 94, 0.95)');
    topGradient.addColorStop(0.4, 'rgba(22, 163, 74, 0.85)');
    topGradient.addColorStop(1, 'rgba(15, 118, 110, 0.7)');
    
    const bottomGradient = ctx.createLinearGradient(0, center, 0, height);
    bottomGradient.addColorStop(0, 'rgba(34, 197, 94, 0.95)');
    bottomGradient.addColorStop(0.4, 'rgba(22, 163, 74, 0.85)');
    bottomGradient.addColorStop(1, 'rgba(15, 118, 110, 0.7)');

    // Draw the enhanced waveform
    let x = barGap;
    for (let i = 0; i < barCount; i++) {
      const intensity = getPollyTextIntensity(i, barCount);
      const barHeight = intensity * (height / 2.2);
      
      // Add subtle glow effect
      ctx.shadowColor = 'rgba(34, 197, 94, 0.3)';
      ctx.shadowBlur = 4;
      
      // Top bar
      ctx.fillStyle = topGradient;
      ctx.beginPath();
      ctx.roundRect(x, center - barHeight, barWidth - 1, barHeight, 3);
      ctx.fill();
      
      // Bottom bar (mirrored)
      ctx.fillStyle = bottomGradient;
      ctx.beginPath();
      ctx.roundRect(x, center, barWidth - 1, barHeight, 3);
      ctx.fill();
      
      x += barWidth + barGap;
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Continue animation if still playing
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawPollyBasedVisualization);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={150} 
        className="w-full h-[150px]"
      />
    </div>
  );
};

export default AudioVisualizer;

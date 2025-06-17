
import React, { useRef, useEffect, useCallback } from 'react';

interface AudioWaveVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  className?: string;
}

const AudioWaveVisualizer: React.FC<AudioWaveVisualizerProps> = ({
  analyser,
  isPlaying,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const stopAnimation = useCallback(() => {
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
  }, []);

  const drawWaveform = useCallback(() => {
    if (!analyser || !canvasRef.current) {
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(drawWaveform);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);
    
    const usableData = dataArray.slice(0, Math.floor(dataArray.length / 2));

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);

    const barCount = 80;
    const spacing = 1;
    const barWidth = Math.max(1, (canvas.width - (barCount - 1) * spacing) / barCount);
    
    const totalWidth = barCount * barWidth + (barCount - 1) * spacing;
    let x = (canvas.width - totalWidth) / 2;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * usableData.length);
      const rawIntensity = usableData[dataIndex] / 255;
      
      const intensity = Math.max(0.15, rawIntensity * 1.5);
      
      const maxBarHeight = height * 0.7;
      const barHeight = Math.max(8, intensity * maxBarHeight);
      
      const gradient = ctx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
      
      if (intensity > 0.8) {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 1)');
        gradient.addColorStop(0.3, 'rgba(34, 197, 94, 1)');
        gradient.addColorStop(0.7, 'rgba(22, 163, 74, 1)');
        gradient.addColorStop(1, 'rgba(21, 128, 61, 0.9)');
      } else if (intensity > 0.6) {
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.95)');
        gradient.addColorStop(0.4, 'rgba(22, 163, 74, 1)');
        gradient.addColorStop(1, 'rgba(21, 128, 61, 0.8)');
      } else if (intensity > 0.4) {
        gradient.addColorStop(0, 'rgba(74, 222, 128, 0.8)');
        gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.9)');
        gradient.addColorStop(1, 'rgba(22, 163, 74, 0.7)');
      } else if (intensity > 0.2) {
        gradient.addColorStop(0, 'rgba(134, 239, 172, 0.7)');
        gradient.addColorStop(0.5, 'rgba(74, 222, 128, 0.8)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0.6)');
      } else {
        gradient.addColorStop(0, 'rgba(187, 247, 208, 0.5)');
        gradient.addColorStop(0.5, 'rgba(134, 239, 172, 0.6)');
        gradient.addColorStop(1, 'rgba(74, 222, 128, 0.5)');
      }

      ctx.fillStyle = gradient;
      
      const y = (height - barHeight) / 2;
      
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, Math.min(2, barWidth / 2));
      ctx.fill();
      
      if (intensity > 0.6) {
        ctx.shadowColor = 'rgba(34, 197, 94, 0.7)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      x += barWidth + spacing;
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawWaveform);
    }
  }, [analyser, isPlaying]);

  useEffect(() => {
    if (isPlaying && analyser) {
      console.log("🌿 Starting waveform animation");
      drawWaveform();
    } else {
      console.log("🌿 Stopping waveform animation");
      stopAnimation();
    }
    
    return stopAnimation;
  }, [isPlaying, analyser, drawWaveform, stopAnimation]);

  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ 
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default AudioWaveVisualizer;

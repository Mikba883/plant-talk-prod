
import React, { useRef, useEffect, useCallback } from 'react';

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  className?: string;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
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
      // Schedule next frame if still playing
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
    
    // Get current frequency data from the analyser
    analyser.getByteFrequencyData(dataArray);
    
    // Use only the first half of the frequency data for better animation
    const usableData = dataArray.slice(0, Math.floor(dataArray.length / 2));

    // Use the actual canvas element dimensions
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Set canvas internal dimensions to match display size
    canvas.width = width;
    canvas.height = height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Increased bar count for richer animation
    const barCount = 80;
    const spacing = 1;
    // Calculate adaptive bar width based on canvas width
    const barWidth = Math.max(1, (canvas.width - (barCount - 1) * spacing) / barCount);
    
    // Center the waveform bars properly
    const totalWidth = barCount * barWidth + (barCount - 1) * spacing;
    let x = (canvas.width - totalWidth) / 2; // Center horizontally
    
    console.log(`🌿 Canvas actual dimensions: ${width}x${height}, barCount: ${barCount}, barWidth: ${barWidth.toFixed(2)}`);
    console.log(`🌿 Total waveform width: ${totalWidth.toFixed(2)}, starting X position: ${x.toFixed(2)}`);
    console.log(`🌿 Using first half of frequency data: ${usableData.length} out of ${dataArray.length}`);

    let barsDrawn = 0;
    
    for (let i = 0; i < barCount; i++) {
      // Map bar index to usable frequency data (first half only)
      const dataIndex = Math.floor((i / barCount) * usableData.length);
      const rawIntensity = usableData[dataIndex] / 255;
      
      // Apply some smoothing and ensure minimum visibility
      const intensity = Math.max(0.15, rawIntensity * 1.5); // Higher amplification and minimum
      
      // Height calculation - use more of the available height
      const maxBarHeight = height * 0.7; // Use 70% of canvas height
      const barHeight = Math.max(8, intensity * maxBarHeight); // Minimum 8px height (reduced for more bars)
      
      // Count all bars for debugging
      barsDrawn++;
      
      // Create gradient based on intensity
      const gradient = ctx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
      
      if (intensity > 0.8) {
        // Very high intensity - bright green
        gradient.addColorStop(0, 'rgba(16, 185, 129, 1)');
        gradient.addColorStop(0.3, 'rgba(34, 197, 94, 1)');
        gradient.addColorStop(0.7, 'rgba(22, 163, 74, 1)');
        gradient.addColorStop(1, 'rgba(21, 128, 61, 0.9)');
      } else if (intensity > 0.6) {
        // High intensity - vibrant green
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.95)');
        gradient.addColorStop(0.4, 'rgba(22, 163, 74, 1)');
        gradient.addColorStop(1, 'rgba(21, 128, 61, 0.8)');
      } else if (intensity > 0.4) {
        // Medium intensity - medium green
        gradient.addColorStop(0, 'rgba(74, 222, 128, 0.8)');
        gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.9)');
        gradient.addColorStop(1, 'rgba(22, 163, 74, 0.7)');
      } else if (intensity > 0.2) {
        // Low intensity - soft green
        gradient.addColorStop(0, 'rgba(134, 239, 172, 0.7)');
        gradient.addColorStop(0.5, 'rgba(74, 222, 128, 0.8)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0.6)');
      } else {
        // Minimum intensity - very soft green
        gradient.addColorStop(0, 'rgba(187, 247, 208, 0.5)');
        gradient.addColorStop(0.5, 'rgba(134, 239, 172, 0.6)');
        gradient.addColorStop(1, 'rgba(74, 222, 128, 0.5)');
      }

      ctx.fillStyle = gradient;
      
      // Position bars using properly centered x
      const y = (height - barHeight) / 2; // Center vertically
      
      // Draw rounded rectangle (smaller radius for thinner bars)
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, Math.min(2, barWidth / 2));
      ctx.fill();
      
      // Add glow effect for high intensity
      if (intensity > 0.6) {
        ctx.shadowColor = 'rgba(34, 197, 94, 0.7)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      }
      
      // Move to next bar position with proper spacing
      x += barWidth + spacing;
    }

    console.log("🌿 Canvas post-draw size:", canvas.width, canvas.height);
    console.log("🌿 Number of bars drawn:", barsDrawn);
    console.log("🌿 Bar dimensions - width:", barWidth.toFixed(2), "spacing:", spacing);
    console.log("🌿 Final X position:", x.toFixed(2), "should be close to canvas width:", canvas.width);

    // Continue animation while playing
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawWaveform);
    }
  }, [analyser, isPlaying]);

  // Start/stop animation based on playing state
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

  // Cleanup on unmount
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

export default WaveformVisualizer;

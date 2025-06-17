
import React from 'react';

interface ScanAnimationProps {
  isScanning: boolean;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  showParticles?: boolean;
}

const ScanAnimation: React.FC<ScanAnimationProps> = ({ 
  isScanning, 
  direction = 'vertical',
  showParticles = false
}) => {
  if (!isScanning) return null;

  // Generate random particles for enhanced effect
  const particles = [];
  if (showParticles) {
    for (let i = 0; i < 15; i++) {
      const size = Math.random() * 6 + 2;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 1 + Math.random() * 4;
      const opacity = 0.3 + Math.random() * 0.7;
      
      particles.push(
        <div 
          key={i}
          className="absolute bg-green-300 rounded-full animate-pulse"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            top: `${top}%`,
            opacity: opacity,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`
          }}
        />
      );
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {direction === 'vertical' && (
        // Vertical scan line
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-300 via-plant-light-green to-green-300 opacity-70 animate-scan-vertical"></div>
      )}
      
      {direction === 'horizontal' && (
        // Horizontal scan line
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-green-300 via-plant-light-green to-green-300 opacity-70 animate-scan-horizontal"></div>
      )}
      
      {direction === 'diagonal' && (
        // Diagonal scan line
        <div className="absolute h-1 w-[200%] bg-gradient-to-r from-transparent via-plant-light-green to-transparent opacity-70 -rotate-45 -left-1/2 animate-scan-diagonal"></div>
      )}
      
      {/* Add a subtle overlay to enhance the scanning effect */}
      <div className="absolute inset-0 bg-plant-light-green/5 animate-pulse"></div>
      
      {/* Add floating particles */}
      {showParticles && particles}
      
      {/* Add scanning data pattern overlay */}
      {showParticles && (
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDgzZjE0IiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iNiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEyIi8+PGxpbmUgeDE9IjgiIHkxPSIyMCIgeDI9IjEyIiB5Mj0iMjAiLz48bGluZSB4MT0iMjgiIHkxPSIyMCIgeDI9IjMyIiB5Mj0iMjAiLz48bGluZSB4MT0iMjAiIHkxPSI4IiB4Mj0iMjAiIHkyPSIxMiIvPjxsaW5lIHgxPSIyMCIgeTE9IjI4IiB4Mj0iMjAiIHkyPSIzMiIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
      )}
    </div>
  );
};

export default ScanAnimation;

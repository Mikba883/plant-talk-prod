
import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, className = "" }) => {
  if (!error) return null;

  return (
    <div className={`absolute bottom-2 left-4 right-4 z-30 pointer-events-auto ${className}`}>
      <div className="text-xs text-red-100 bg-red-600/80 px-2 py-1 rounded backdrop-blur-sm">
        {error}
      </div>
    </div>
  );
};

export default ErrorDisplay;

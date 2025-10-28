
import React from 'react';

interface LoadingStateProps {
  message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg text-gray-300 font-medium">{message || 'Processing...'}</p>
      <p className="text-sm text-gray-500 mt-1">This may take a moment, especially for complex requests.</p>
    </div>
  );
};

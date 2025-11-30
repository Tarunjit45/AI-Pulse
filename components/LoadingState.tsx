import React from 'react';

interface LoadingStateProps {
  message: string;
}

/**
 * Displays a centralized loading spinner and a customizable message.
 * FIX: Memoized for performance as it's a pure functional component.
 */
export const LoadingState: React.FC<LoadingStateProps> = React.memo(({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-gray-900/50 shadow-2xl">
      {/* Tailwind Spinner: Cyan border, transparent top, perfect circle */}
      <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      
      {/* Message feedback */}
      <p className="text-lg text-gray-300 font-medium">{message || 'Processing...'}</p>
      
      {/* Set user expectation */}
      <p className="text-sm text-gray-500 mt-1">This may take a moment, especially for complex requests.</p>
    </div>
  );
});
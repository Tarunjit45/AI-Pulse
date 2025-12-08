import React from 'react';

interface LoadingStateProps {
  message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 bg-neon-cyan/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute inset-0 border-t-2 border-neon-cyan rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-2 border-neon-pink rounded-full animate-spin animation-delay-2000 reverse"></div>
        <div className="absolute inset-4 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 rounded-full backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        </div>
      </div>
      <p className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 animate-pulse">{message || 'Processing...'}</p>
      <p className="text-xs text-neon-cyan/60 mt-2 font-mono uppercase tracking-widest">Neural Link Active</p>
    </div>
  );
};
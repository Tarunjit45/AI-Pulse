
import React, { useState } from 'react';

interface InputBarProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

export const InputBar: React.FC<InputBarProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3 bg-gray-800 border border-gray-700 rounded-full p-2 shadow-lg w-full max-w-4xl mx-auto">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., What are the latest AI breakthroughs this week?"
        className="flex-grow bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none px-4"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-full p-3 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <SendIcon />
        )}
      </button>
    </form>
  );
};

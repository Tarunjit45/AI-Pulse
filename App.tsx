
import React, { useState, useCallback } from 'react';
import { PostCard } from './components/PostCard';
import { LoadingState } from './components/LoadingState';
import { LogoIcon, PlayIcon, RefreshIcon } from './components/icons';
import { generateContentFromPrompt } from './services/geminiService';
import { NewsItem } from './types';

function App() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleGenerate = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setNewsItems([]);
    setStatusMessage('Initializing AI Pulse...');

    try {
      const results = await generateContentFromPrompt(prompt, setStatusMessage);
      setNewsItems(results);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check the console.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  }, []);
  
  const handleStart = () => {
    handleGenerate("Summarize today's most important AI news and updates.");
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="p-4 border-b border-gray-700/50 flex items-center justify-center space-x-3">
        <LogoIcon className="h-8 w-8 text-cyan-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">AI Pulse</h1>
          <p className="text-sm text-gray-400">Your Automated AI News & Content Assistant</p>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 w-full flex flex-col items-center">
        {isLoading && <div className="flex-grow flex items-center justify-center"><LoadingState message={statusMessage} /></div>}
        
        {error && (
          <div className="flex-grow flex items-center justify-center">
            <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg text-center">
              <h3 className="font-bold mb-2">Generation Failed</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && newsItems.length === 0 && (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <LogoIcon className="h-16 w-16 text-cyan-400 mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Ready to Catch the AI Wave?</h2>
            <p className="text-lg text-gray-400 mb-8 max-w-xl">
              AI Pulse automatically finds the latest breakthroughs and drafts share-worthy posts for your social media.
            </p>
            <button
              onClick={handleStart}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
            >
              <span className="flex items-center space-x-2">
                <span>Start Pulse</span>
                <PlayIcon className="w-6 h-6" />
              </span>
            </button>
          </div>
        )}

        {!isLoading && newsItems.length > 0 && (
          <div className="w-full">
            <div className="flex justify-center mb-8">
              <button
                onClick={handleStart}
                disabled={isLoading}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-full transition-colors duration-200 flex items-center space-x-2"
                aria-label="Generate New AI Pulse Report"
              >
                <RefreshIcon className="w-5 h-5"/>
                <span>Generate New Report</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-8 w-full">
              {newsItems.map((item, index) => (
                <div key={index} className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-1 text-cyan-300">Topic: {item.source.title}</h2>
                    <a href={item.source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-200 mb-6">
                        <span>{item.source.url}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        <PostCard platform="LinkedIn" content={item.linkedinPost} />
                        <PostCard platform="Medium" content={item.mediumArticle} />
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

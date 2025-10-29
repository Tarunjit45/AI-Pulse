import React, { useState, useEffect, useCallback } from 'react';
import { LogoIcon, RefreshIcon } from './components/icons';
import { LoadingState } from './components/LoadingState';
import { ArticleCard } from './components/ArticleCard';
import { Modal } from './components/Modal';
import { PostCard } from './components/PostCard';
import { Footer } from './components/Footer';
import { generateArticles, generateSocialPost } from './services/geminiService';
import { Article, LinkedInPost, MediumArticle } from './types';

type SocialPlatform = 'LinkedIn' | 'Medium';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState<boolean>(false);
  const [generatedPost, setGeneratedPost] = useState<LinkedInPost | MediumArticle | null>(null);
  const [modalPlatform, setModalPlatform] = useState<SocialPlatform | null>(null);
  
  const fetchArticles = useCallback(async () => {
    try {
      setError(null);
      setIsLoadingArticles(true);
      const articleContent = await generateArticles();
      setArticles(articleContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setArticles([]);
      console.error(err);
    } finally {
      setIsLoadingArticles(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleGeneratePost = async (articleContent: string, platform: SocialPlatform) => {
    setModalPlatform(platform);
    setIsModalOpen(true);
    setIsGeneratingPost(true);
    setGeneratedPost(null);

    try {
      const postContent = await generateSocialPost(articleContent, platform);
      setGeneratedPost(postContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate post.';
      setGeneratedPost({
        title: `Error Generating ${platform} Post`,
        body: errorMessage,
        takeaway: "Please try again.",
        headline: `Error Generating ${platform} Post`,
        hashtags: [],
      });
      console.error(err);
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setGeneratedPost(null);
    setModalPlatform(null);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      <header className="p-4 border-b border-gray-800/50 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-3">
          <LogoIcon className="h-8 w-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">AI Pulse</h1>
            <p className="text-sm text-gray-400">Your Automated AI Content Assistant</p>
          </div>
        </div>
        <button
          onClick={fetchArticles}
          disabled={isLoadingArticles}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-black"
          title="Refresh Feed"
        >
          <RefreshIcon className={`h-5 w-5 mr-2 ${isLoadingArticles ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </header>
      
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 w-full">
        {isLoadingArticles && (
          <div className="flex-grow flex items-center justify-center pt-24">
            <LoadingState message="Scanning for the latest AI trends..." />
          </div>
        )}
        
        {error && !isLoadingArticles && (
          <div className="flex-grow flex items-center justify-center pt-24">
            <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg text-center max-w-2xl mx-auto">
              <h3 className="font-bold mb-2">Failed to Generate Report</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!isLoadingArticles && articles.length > 0 && (
          <div className="grid gap-8 max-w-4xl mx-auto">
            {articles.map((article, index) => (
              <ArticleCard
                key={index}
                article={article}
                onGenerate={handleGeneratePost}
                isGenerating={isGeneratingPost}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {isGeneratingPost && <LoadingState message={`Drafting ${modalPlatform} post...`} />}
        {generatedPost && modalPlatform && (
          <PostCard platform={modalPlatform} content={generatedPost} />
        )}
      </Modal>
    </div>
  );
}

export default App;
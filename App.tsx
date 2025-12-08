import React, { useState, useEffect, useCallback } from 'react';
import { LogoIcon, RefreshIcon } from './components/icons';
import { LoadingState } from './components/LoadingState';
import { ArticleCard } from './components/ArticleCard';
import { Modal } from './components/Modal';
import { PostCard } from './components/PostCard';
import { Footer } from './components/Footer';
import { generateSingleArticle, generateSocialPost } from './services/geminiService';
import { Article, LinkedInPost, MediumArticle } from './types';

type SocialPlatform = 'LinkedIn' | 'Medium';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState<boolean>(false);
  const [generatedPost, setGeneratedPost] = useState<LinkedInPost | MediumArticle | null>(null);
  const [modalPlatform, setModalPlatform] = useState<SocialPlatform | null>(null);
  
  const fetchArticle = useCallback(async () => {
    try {
      const existingTitles = articles.map(a => a.title);
      const articleContent = await generateSingleArticle(existingTitles);
      setArticles(prev => [...prev, articleContent]);
    } catch (err) {
      console.error(err);
      if(articles.length < 2) {
         setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching news.');
      }
    }
  }, [articles]);

  const init = async () => {
      setIsLoading(true);
      setError(null);
      setArticles([]);
      try {
        const firstArticle = await generateSingleArticle();
        setArticles([firstArticle]);
        setIsLoading(false);
        // Background fetch next
        generateSingleArticle([firstArticle.title])
          .then(secondArticle => setArticles(prev => [...prev, secondArticle]))
          .catch(console.error);
      } catch(err) {
        setError(err instanceof Error ? err.message : 'Connection to Pulse Network failed.');
        setIsLoading(false);
      }
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwipe = useCallback(() => {
    setArticles(prev => {
        const next = prev.slice(1);
        if (next.length < 2) fetchArticle(); // Pre-fetch when running low
        return next;
    });
  }, [fetchArticle]);

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
        title: `Error`,
        body: errorMessage,
        takeaway: "Please try again.",
        headline: `Error`,
        hashtags: [],
      });
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
    <div className="min-h-screen bg-void text-gray-100 flex flex-col overflow-hidden relative">
      
      {/* Aesthetic Background - Aurora Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-neon-purple/20 rounded-full blur-[128px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[128px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-neon-pink/10 rounded-full blur-[128px] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <header className="px-6 py-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3 bg-glass-border backdrop-blur-md px-4 py-2 rounded-full border border-white/5 shadow-2xl">
          <div className="relative">
            <LogoIcon className="h-8 w-8 text-neon-cyan drop-shadow-[0_0_15px_rgba(0,242,234,0.6)]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-white">AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink">PULSE</span></h1>
          </div>
        </div>
        {!isLoading && (
            <button 
                onClick={init} 
                className="group p-3 bg-glass-border hover:bg-white/10 rounded-full transition-all border border-white/5 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,242,234,0.3)]"
                title="Refresh Feed"
            >
                <RefreshIcon className="w-5 h-5 text-gray-300 group-hover:text-neon-cyan transition-colors" />
            </button>
        )}
      </header>
      
      <main className="flex-grow container mx-auto p-4 w-full flex flex-col items-center justify-center relative z-10">
        {isLoading && (
          <div className="flex-grow flex items-center justify-center">
             <LoadingState message="Scanning Global Intelligence..." />
          </div>
        )}
        
        {error && !isLoading && (
          <div className="flex-grow flex items-center justify-center">
            <div className="bg-red-950/20 border border-red-500/30 text-red-200 p-8 rounded-3xl text-center max-w-lg backdrop-blur-xl shadow-2xl shadow-red-900/10">
              <h3 className="font-display font-bold text-2xl mb-3 text-red-400">Signal Interrupted</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button onClick={init} className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-xl text-sm font-bold text-red-400 transition-all">Retry Uplink</button>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="w-full max-w-lg h-[720px] relative flex items-center justify-center">
            {articles.length > 0 ? (
               articles.slice(0, 2).reverse().map((article, index) => {
                const isTopCard = index === 1 || articles.length === 1;
                return (
                  <ArticleCard
                    key={article.title}
                    article={article}
                    onGenerate={handleGeneratePost}
                    isGenerating={isGeneratingPost}
                    onSwipe={handleSwipe}
                    isTopCard={isTopCard}
                  />
                )
              })
            ) : (
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-gray-700 mb-2">Feed Complete</p>
                <p className="text-gray-500">Syncing next cycle...</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {isGeneratingPost && <LoadingState message={`Architecting ${modalPlatform} content...`} />}
        {generatedPost && modalPlatform && (
          <PostCard platform={modalPlatform} content={generatedPost} />
        )}
      </Modal>
    </div>
  );
}

export default App;
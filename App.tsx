import React, { useState, useEffect, useCallback } from 'react';
import { LogoIcon } from './components/icons';
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
      // Only set a global error if the initial fetch fails.
      // Background fetch errors are logged but don't stop the app.
      if(articles.length < 2) {
         setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching news.');
      }
    }
  }, [articles]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setError(null);
      setArticles([]);
      try {
        const article1 = await generateSingleArticle();
        const article2 = await generateSingleArticle([article1.title]);
        setArticles([article1, article2]);
      } catch(err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setArticles([]);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwipe = useCallback(() => {
    setArticles(prev => prev.slice(1));
    fetchArticle();
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
    <div className="min-h-screen bg-black text-gray-100 flex flex-col overflow-hidden">
      <header className="p-4 border-b border-gray-800/50 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-sm z-20">
        <div className="flex items-center space-x-3">
          <LogoIcon className="h-8 w-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">AI Pulse</h1>
            <p className="text-sm text-gray-400">Your Daily AI Briefing, Swiped</p>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 md:p-6 w-full flex flex-col items-center justify-center">
        {isLoading && (
          <div className="flex-grow flex items-center justify-center">
             <LoadingState message="Scanning for the latest AI trends..." />
          </div>
        )}
        
        {error && !isLoading && (
          <div className="flex-grow flex items-center justify-center">
            <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg text-center max-w-2xl mx-auto">
              <h3 className="font-bold mb-2">Failed to Generate Report</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="w-full max-w-xl h-[75vh] max-h-[650px] md:h-[620px] relative flex items-center justify-center">
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
              <div className="text-center text-gray-500">
                <p className="text-xl font-semibold">All caught up for now!</p>
                <p>Come back later for more AI news.</p>
              </div>
            )}
             {articles.length === 1 && (
              <div className="absolute -bottom-16 text-center text-gray-500 animate-pulse">
                <p>Finding next article...</p>
              </div>
            )}
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
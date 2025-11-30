import React, { useState, useEffect, useCallback } from 'react';
// Assuming extension-less imports resolve correctly based on Vite convention
import { LogoIcon } from './components/icons';
import { LoadingState } from './components/LoadingState';
import { ArticleCard } from './components/ArticleCard';
import { Modal } from './components/Modal';
import { PostCard } from './components/PostCard';
import { Footer } from './components/Footer';
import { generateSingleArticle, generateSocialPost } from './services/geminiService'; 
import { Article, LinkedInPost, MediumArticle } from './types';

// Define a structured error type for better debugging
type AppError = { 
  message: string; 
  details?: string; // For console logging or a debug view
};

type SocialPlatform = 'LinkedIn' | 'Medium';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null); // Use structured error state

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState<boolean>(false);
  const [generatedPost, setGeneratedPost] = useState<LinkedInPost | MediumArticle | null>(null);
  const [modalPlatform, setModalPlatform] = useState<SocialPlatform | null>(null);
  const [postError, setPostError] = useState<string | null>(null); // Dedicated error state for the modal

  const getErrorMessage = (err: unknown): string => {
    return err instanceof Error ? err.message : 'An unknown error occurred.';
  };

  // Memoized function to fetch a new article and append it
  const fetchArticle = useCallback(async () => {
    try {
      const existingTitles = articles.map(a => a.title);
      const articleContent = await generateSingleArticle(existingTitles);
      // Use the functional update form for articles array
      setArticles(prev => [...prev, articleContent]); 
    } catch (err) {
      console.error("Background article fetch failed:", err);
      // If the list is empty (initial fetch failed), set a visible error.
      if (articles.length === 0) {
        setError({
          message: "Failed to load the first article.",
          details: getErrorMessage(err),
        });
      }
      // If articles are present, just log the background failure.
    }
  }, [articles]); 

  // Initial and subsequent background fetching logic
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setError(null);
      setArticles([]);
      try {
        // 1. Fetch the first article
        const firstArticle = await generateSingleArticle();
        setArticles([firstArticle]);
        setIsLoading(false);

        // 2. Pre-fetch the second article in the background for smooth swiping
        generateSingleArticle([firstArticle.title])
          .then(secondArticle => {
            setArticles(prev => [...prev, secondArticle]);
          })
          .catch(err => {
            console.error("Failed to pre-fetch next article:", err);
          });
      } catch(err) {
        setError({
          message: 'An initial critical error occurred.',
          details: getErrorMessage(err),
        });
        setArticles([]);
        console.error("Initial load failed:", err);
        setIsLoading(false);
      }
    };
    init();
  }, []); // Empty dependency array means this runs once on mount

  // Handles the "swipe" action: removes the top article and fetches a new one
  const handleSwipe = useCallback(() => {
    setArticles(prev => prev.slice(1));
    fetchArticle(); // Trigger fetch for the next article
  }, [fetchArticle]);

  // Handles post generation for LinkedIn or Medium
  const handleGeneratePost = async (articleContent: string, platform: SocialPlatform) => {
    setModalPlatform(platform);
    setIsModalOpen(true);
    setIsGeneratingPost(true);
    setGeneratedPost(null);
    setPostError(null); // Clear previous modal error

    try {
      const postContent = await generateSocialPost(articleContent, platform);
      setGeneratedPost(postContent);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setPostError(`Could not generate ${platform} post. Reason: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setGeneratedPost(null);
    setModalPlatform(null);
    setPostError(null);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col overflow-hidden font-sans">
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
        
        {/* Global Error Display */}
        {error && !isLoading && (
          <div className="flex-grow flex items-center justify-center">
            <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-xl shadow-2xl text-center max-w-2xl mx-auto space-y-2">
              <h3 className="font-extrabold text-xl mb-2">System Failure</h3>
              <p className="text-lg font-semibold">{error.message}</p>
              <p className="text-sm text-red-400 italic">Details: {error.details}</p>
              <p className="text-sm pt-2">Please check the console for debugging information.</p>
            </div>
          </div>
        )}

        {/* Main Content View (Swipable Cards) */}
        {!isLoading && !error && (
          <div className="w-full max-w-xl h-[75vh] max-h-[650px] md:h-[620px] relative flex items-center justify-center">
            {articles.length > 0 ? (
                // Only render the top two cards (current and next)
                articles.slice(0, 2).reverse().map((article, index) => {
                const isTopCard = index === 1 || articles.length === 1; // Top card is index 1 after reverse, or if only 1 exists
                return (
                  <ArticleCard
                    // Using a more unique key: title + index (as a safeguard)
                    key={`${article.title}-${index}`}
                    article={article}
                    onGenerate={handleGeneratePost}
                    isGenerating={isGeneratingPost}
                    onSwipe={handleSwipe}
                    isTopCard={isTopCard}
                  />
                )
              })
            ) : (
              <div className="text-center text-gray-500 p-8 rounded-xl border border-gray-800/50">
                <p className="text-xl font-semibold">All caught up for now!</p>
                <p>Come back later for more AI news.</p>
                {/* Add a button to retry/force fetch */}
                <button 
                  onClick={() => { setIsLoading(true); fetchArticle(); }}
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition"
                >
                  Fetch New Pulse
                </button>
              </div>
            )}
              {/* Indicator for background fetching */}
             {articles.length === 1 && (
              <div className="absolute bottom-4 text-center text-gray-500 animate-pulse text-sm">
                <p>Finding next article...</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* Modal for Post Generation */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {isGeneratingPost && <LoadingState message={`Drafting ${modalPlatform} post...`} />}
        
        {postError && (
          <div className="p-6 bg-red-900/20 border border-red-500 rounded-xl text-red-300 text-center">
             <h3 className="font-bold mb-2">Generation Failed</h3>
             <p>{postError}</p>
             <button 
               onClick={closeModal}
               className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
             >
               Close
             </button>
          </div>
        )}

        {generatedPost && modalPlatform && !isGeneratingPost && (
          <PostCard platform={modalPlatform} content={generatedPost} />
        )}
      </Modal>
    </div>
  );
}

export default App;
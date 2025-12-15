
import React, { useState } from 'react';
import { LogoIcon, RefreshIcon } from './components/icons';
import { LoadingState } from './components/LoadingState';
import { ArticleCard } from './components/ArticleCard';
import { Modal } from './components/Modal';
import { PostCard } from './components/PostCard';
import { Footer } from './components/Footer';
import { generateSocialPost } from './services/geminiService';
import { LinkedInPost, MediumArticle } from './types';
import { useNewsFeed } from './hooks/useNewsFeed';

type SocialPlatform = 'LinkedIn' | 'Medium';
type Region = 'Global' | 'India';

const CATEGORIES = ['All', 'Politics', 'Geopolitics', 'Tech', 'AI', 'Sports', 'Business', 'Entertainment'];

function App() {
  const [region, setRegion] = useState<Region>('Global');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Architecture Upgrade: Moved state logic to custom hook
  const { articles, isLoading, error, handleSwipe, retry } = useNewsFeed(region, activeCategory);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState<boolean>(false);
  const [generatedPost, setGeneratedPost] = useState<LinkedInPost | MediumArticle | null>(null);
  const [modalPlatform, setModalPlatform] = useState<SocialPlatform | null>(null);

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

  const isIndia = region === 'India';

  return (
    <div className="h-[100dvh] bg-void text-gray-100 flex flex-col overflow-hidden relative transition-colors duration-1000">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-1000">
        <div className={`absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[128px] animate-blob transition-colors duration-1000 ${isIndia ? 'bg-orange-500/20' : 'bg-neon-purple/20'}`}></div>
        <div className={`absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[128px] animate-blob animation-delay-2000 transition-colors duration-1000 ${isIndia ? 'bg-blue-600/10' : 'bg-neon-cyan/10'}`}></div>
        <div className={`absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] rounded-full blur-[128px] animate-blob animation-delay-4000 transition-colors duration-1000 ${isIndia ? 'bg-green-600/15' : 'bg-neon-pink/10'}`}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <header className="shrink-0 z-30 transition-all duration-300 w-full relative">
        <div className="px-4 py-3 md:px-8 md:py-4 flex flex-col gap-3 md:gap-4 max-w-7xl mx-auto">
            
            {/* Top Row: Logo, Region Toggle, Refresh */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-3 bg-glass-border backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/5 shadow-lg">
                  <div className="relative">
                    <LogoIcon className={`h-6 w-6 md:h-8 md:w-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-colors duration-500 ${isIndia ? 'text-orange-400' : 'text-neon-cyan'}`} />
                  </div>
                  <div>
                    <h1 className="text-lg md:text-xl font-display font-bold tracking-tight text-white">AI <span className={`text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500 ${isIndia ? 'from-orange-400 via-white to-green-400' : 'from-neon-cyan to-neon-pink'}`}>PULSE</span></h1>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <div className="bg-glass-border backdrop-blur-md rounded-full p-1 flex border border-white/5">
                        <button 
                            onClick={() => setRegion('Global')}
                            className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-300 ${region === 'Global' ? 'bg-neon-cyan/20 text-neon-cyan shadow-[0_0_10px_rgba(0,242,234,0.3)]' : 'text-gray-400 hover:text-white'}`}
                        >
                            GLOBAL
                        </button>
                        <button 
                            onClick={() => setRegion('India')}
                            className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-300 ${region === 'India' ? 'bg-orange-500/20 text-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.3)]' : 'text-gray-400 hover:text-white'}`}
                        >
                            INDIA
                        </button>
                    </div>

                    {!isLoading && (
                        <button 
                            onClick={retry} 
                            className="group p-2 md:p-2.5 bg-glass-border hover:bg-white/10 rounded-full transition-all border border-white/5 hover:border-neon-cyan/50"
                            title="Refresh Feed"
                        >
                            <RefreshIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-neon-cyan transition-colors" />
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Row: Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar mask-gradient-x w-full">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`whitespace-nowrap px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider border transition-all duration-300 flex-shrink-0 ${
                            activeCategory === cat 
                            ? isIndia 
                                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                                : 'bg-neon-pink text-white border-neon-pink shadow-[0_0_15px_rgba(255,0,85,0.4)]'
                            : 'bg-glass-border text-gray-400 border-transparent hover:border-white/20 hover:text-white'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </header>
      
      <main className="flex-grow w-full flex flex-col items-center justify-center relative z-10 px-4 overflow-hidden">
        {isLoading && (
          <div className="flex-grow flex items-center justify-center">
             <LoadingState message={`Scanning ${region === 'India' ? 'India' : 'Global'} wires for ${activeCategory}...`} />
          </div>
        )}
        
        {error && !isLoading && (
          <div className="flex-grow flex items-center justify-center">
            <div className="bg-red-950/20 border border-red-500/30 text-red-200 p-8 rounded-3xl text-center max-w-lg backdrop-blur-xl shadow-2xl shadow-red-900/10">
              <h3 className="font-display font-bold text-2xl mb-3 text-red-400">Signal Interrupted</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button onClick={retry} className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-xl text-sm font-bold text-red-400 transition-all">Retry Uplink</button>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          // Responsive Card Container:
          // Mobile: Full height minus header (calc)
          // Desktop (md): Dynamic 75% of viewport height (h-[75dvh]) or calc based to fill comfortably
          // We use min-h to prevent squashing on small screens, max-h for ultra-wide.
          <div className="w-full max-w-md md:max-w-2xl relative flex items-center justify-center transition-all duration-300 h-[calc(100dvh-11rem)] md:h-[calc(100dvh-10rem)] min-h-[500px] max-h-[900px]">
            {articles.length > 0 ? (
               articles.slice(0, 2).reverse().map((article, index) => {
                const isTopCard = index === 1 || articles.length === 1;
                return (
                  <ArticleCard
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
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-gray-700 mb-2">Feed Complete</p>
                <p className="text-gray-500">Syncing next cycle...</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Hidden footer on mobile to save space, or make it very small */}
      <div className="hidden md:block">
        <Footer />
      </div>

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

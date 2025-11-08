import React, { useRef, useState, useEffect } from 'react';
import { Article } from '../types';
import { LinkedInIcon, MediumIcon, ShareIcon } from './icons';

// A simple markdown-to-HTML renderer
const renderMarkdown = (text: string) => {
  if(!text) return '';
  let html = text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-gray-300">')
    .replace(/\n/g, '<br />');

  return `<p class="mb-4 leading-relaxed text-gray-300">${html}</p>`;
};

interface ArticleCardProps {
  article: Article;
  isGenerating: boolean;
  onGenerate: (articleBody: string, platform: 'LinkedIn' | 'Medium') => void;
  onSwipe: () => void;
  isTopCard: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, isGenerating, onGenerate, onSwipe, isTopCard }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number } | null>(null);
  const [style, setStyle] = useState({});
  const [swipeFeedback, setSwipeFeedback] = useState<'like' | 'nope' | null>(null);

  const articleHtml = renderMarkdown(article.body);
  const SWIPE_THRESHOLD = 120; // pixels

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isTopCard) return;
    const point = 'touches' in e ? e.touches[0] : e;
    dragStartPos.current = { x: point.clientX };
    // Disable transition for smooth dragging
    if (cardRef.current) {
        cardRef.current.style.transition = 'none';
    }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStartPos.current || !isTopCard) return;
    e.preventDefault();
    const point = 'touches' in e ? e.touches[0] : e;
    const dx = point.clientX - dragStartPos.current.x;
    const rotation = dx * 0.1;
    
    setStyle({
      transform: `translate(${dx}px, 0px) rotate(${rotation}deg)`,
    });

    if (dx > 20) setSwipeFeedback('like');
    else if (dx < -20) setSwipeFeedback('nope');
    else setSwipeFeedback(null);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStartPos.current || !isTopCard || !cardRef.current) return;
    
    const point = 'changedTouches' in e ? e.changedTouches[0] : e;
    const dx = point.clientX - dragStartPos.current.x;
    
    // Re-enable transition for exit or snap-back animation
    cardRef.current.style.transition = 'transform 0.3s ease-out';

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      const exitX = dx > 0 ? window.innerWidth : -window.innerWidth;
      const rotation = dx * 0.2;
      setStyle({ transform: `translate(${exitX}px, 0px) rotate(${rotation}deg)` });
      setTimeout(onSwipe, 300);
    } else {
      setStyle({ transform: 'translate(0, 0) rotate(0deg)' });
    }
    setSwipeFeedback(null);
    dragStartPos.current = null;
  };

  // Add and remove global event listeners for smooth dragging outside the card
  useEffect(() => {
    const card = cardRef.current;
    if (!card || !isTopCard) return;

    const onMove = (e: MouseEvent | TouchEvent) => handleDragMove(e as any);
    const onEnd = (e: MouseEvent | TouchEvent) => handleDragEnd(e as any);

    if (dragStartPos.current) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchend', onEnd);
    }

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
    };
  }, [dragStartPos.current, isTopCard]); // Re-run when dragging starts/stops

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: `Check out this AI news: ${article.title}`,
          url: article.sources[0] || window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(article.sources[0] || window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <div
      ref={cardRef}
      className={`absolute w-full h-full bg-gray-950/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm flex flex-col ${isTopCard ? 'cursor-grab active:cursor-grabbing' : 'scale-95 -translate-y-4 opacity-70'}`}
      style={style}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      {/* Swipe Feedback Overlays */}
      {swipeFeedback === 'like' && (
        <div className="absolute top-8 left-4 text-green-400 border-4 border-green-400 rounded-lg px-4 py-2 text-2xl sm:text-3xl font-bold tracking-widest -rotate-12 select-none opacity-80 z-10">LIKE</div>
      )}
      {swipeFeedback === 'nope' && (
        <div className="absolute top-8 right-4 text-red-400 border-4 border-red-400 rounded-lg px-4 py-2 text-2xl sm:text-3xl font-bold tracking-widest rotate-12 select-none opacity-80 z-10">NOPE</div>
      )}
      
      <div className="flex-shrink-0">
        <img src={article.imageUrl} alt={article.title} className="w-full h-40 sm:h-48 object-cover pointer-events-none" />
      </div>
      
      <div className="p-6 flex-grow flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <div className="flex-grow">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">{article.title}</h2>
            <div
              className="prose prose-invert text-gray-300 mb-4"
              dangerouslySetInnerHTML={{ __html: articleHtml }}
            />

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Sources:</h4>
              <ul className="list-none space-y-1">
                {article.sources.map((source, i) => (
                  <li key={i}>
                    <a href={source} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm truncate block transition-colors">
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
        </div>
        
        <div 
          className="flex flex-col sm:flex-row gap-3 border-t border-gray-800 pt-5 mt-auto flex-shrink-0"
          onMouseDown={(e) => e.stopPropagation()} 
          onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onGenerate(article.body, 'LinkedIn')}
            disabled={isGenerating}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <LinkedInIcon className="w-5 h-5 mr-2" />
            Create LinkedIn Post
          </button>
          <button
            onClick={() => onGenerate(article.body, 'Medium')}
            disabled={isGenerating}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <MediumIcon className="w-5 h-5 mr-2" />
            Create Medium Post
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            title="Share Article"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
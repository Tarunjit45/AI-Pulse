import React, { useRef, useState, useEffect } from 'react';
import { Article } from '../types';
// Assuming extension-less import resolves correctly
import { LinkedInIcon, MediumIcon, ShareIcon } from './icons'; 

// A simple markdown-to-HTML renderer. Flagged for future replacement with a robust library (e.g., marked.js + DOMPurify).
const renderMarkdown = (text: string) => {
  if(!text) return '';
  let html = text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Paragraphs - Note: We assume the AI uses double newline for paragraphs
    .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-gray-300">')
    // Single newlines become line breaks within a paragraph
    .replace(/\n/g, '<br />');

  // Wrap the entire content in a paragraph tag if it's not empty
  if (html.startsWith('</p>') || html.startsWith('<br />')) {
      // Handle cases where the first replacement left a residue
      return `<p class="mb-4 leading-relaxed text-gray-300">${html.replace(/<\/?p class=.*?>|<\/p><p class=.*?>|<br \/>/g, '').trim()}</p>`;
  }
  return `<p class="mb-4 leading-relaxed text-gray-300">${html}</p>`;
};

interface ArticleCardProps {
  article: Article;
  isGenerating: boolean;
  onGenerate: (articleBody: string, platform: 'LinkedIn' | 'Medium') => void;
  onSwipe: () => void;
  isTopCard: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = React.memo(({ article, isGenerating, onGenerate, onSwipe, isTopCard }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef<{ x: number } | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [swipeFeedback, setSwipeFeedback] = useState<'like' | 'nope' | null>(null);
  const [imageError, setImageError] = useState(false);
  // NEW: State for custom clipboard notification
  const [showToast, setShowToast] = useState(false); 

  // Reset image error state when the article (and thus imageUrl) changes
  useEffect(() => {
    setImageError(false);
    // Also reset styles/position when the card content changes
    setStyle({}); 
  }, [article.title, article.imageUrl]);

  const articleHtml = renderMarkdown(article.body);
  const SWIPE_THRESHOLD = 120; // pixels

  const handleImageError = () => {
    setImageError(true);
  };

  // FIX: Clipboard copy using platform-approved method (document.execCommand)
  const copyToClipboard = (text: string) => {
    const tempElement = document.createElement('textarea');
    tempElement.value = text;
    document.body.appendChild(tempElement);
    tempElement.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text using execCommand', err);
    }

    document.body.removeChild(tempElement);
  };

  // Event handlers need to be stable if used in useEffect dependencies or passed down.
  // Although not strictly necessary here, declaring them outside the render function body is cleaner.
  const handleDragMove = (moveEvent: MouseEvent | TouchEvent) => {
    if (!isDragging.current || !dragStartPos.current) return;
    
    if (moveEvent instanceof TouchEvent) {
      moveEvent.preventDefault(); // Prevent scrolling during drag
    }

    const movePoint = 'touches' in moveEvent ? moveEvent.touches[0] : moveEvent;
    const dx = movePoint.clientX - dragStartPos.current.x;
    const rotation = dx * 0.1;
    
    setStyle({
      transform: `translate(${dx}px, 0px) rotate(${rotation}deg)`,
      transition: 'none',
    });

    if (dx > 20) setSwipeFeedback('like');
    else if (dx < -20) setSwipeFeedback('nope');
    else setSwipeFeedback(null);
  };

  const handleDragEnd = (endEvent: MouseEvent | TouchEvent) => {
    if (!isDragging.current || !dragStartPos.current) return;

    isDragging.current = false;
    
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchend', handleDragEnd);
    
    const point = 'changedTouches' in endEvent ? endEvent.changedTouches[0] : endEvent;
    const dx = point.clientX - dragStartPos.current.x;

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      // Swipe action confirmed
      const exitX = dx > 0 ? window.innerWidth : -window.innerWidth;
      const rotation = dx * 0.2;
      setStyle({ 
        transform: `translate(${exitX}px, 0px) rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease-out' 
      });
      setTimeout(onSwipe, 300);
    } else {
      // Snap back
      setStyle({ 
        transform: 'translate(0, 0) rotate(0deg)',
        transition: 'transform 0.3s ease-out'
      });
    }
    
    setSwipeFeedback(null);
    dragStartPos.current = null;
  };
  
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isTopCard) return;

    isDragging.current = true;
    const point = 'touches' in e ? e.touches[0] : e;
    dragStartPos.current = { x: point.clientX };
    
    // Attach global listeners for move and end events
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove, { passive: false }); 
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  };
  
  // Clean up global listeners when component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, []); 

  const handleShare = async () => {
    const shareUrl = article.sources[0] || window.location.href;
    
    if (navigator.share) {
      // Web Share API (preferred on mobile)
      try {
        await navigator.share({
          title: article.title,
          text: `Check out this AI news: ${article.title}`,
          url: shareUrl,
        });
      } catch (error) {
        // If sharing fails (e.g., user cancels), fall back to copy
        console.error('Error sharing, falling back to copy:', error);
        copyToClipboard(shareUrl);
      }
    } else {
      // Fallback for desktop/unsupported browsers
      copyToClipboard(shareUrl);
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`absolute w-full h-full bg-gray-950/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm flex flex-col transition-all duration-300 ease-out ${isTopCard ? 'cursor-grab active:cursor-grabbing z-10' : 'scale-95 -translate-y-4 opacity-70 z-0'}`}
        style={style}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {/* Swipe Feedback Overlays */}
        {swipeFeedback === 'like' && isTopCard && (
          <div className="absolute top-8 left-4 text-green-400 border-4 border-green-400 rounded-lg px-4 py-2 text-2xl sm:text-3xl font-bold tracking-widest -rotate-12 select-none opacity-80 z-20">KEEP</div>
        )}
        {swipeFeedback === 'nope' && isTopCard && (
          <div className="absolute top-8 right-4 text-red-400 border-4 border-red-400 rounded-lg px-4 py-2 text-2xl sm:text-3xl font-bold tracking-widest rotate-12 select-none opacity-80 z-20">SKIP</div>
        )}
        
        <div className="flex-shrink-0 h-40 sm:h-48 bg-gray-900">
          {!imageError && article.imageUrl ? (
            <img
              // Adding a placeholder fallback URL in case of error/absence
              src={article.imageUrl || "https://placehold.co/800x450/1e293b/94a3b8?text=AI+Pulse"}
              alt={article.title}
              className="w-full h-full object-cover pointer-events-none"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-center p-4">
              {/* Using a Lucide Icon for a modern look */}
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 mb-2">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
              <span className="text-gray-500 text-sm">Image unavailable</span>
            </div>
          )}
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
                      <a 
                        href={source} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        // Truncating the URL display for a cleaner look
                        className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors overflow-hidden text-ellipsis whitespace-nowrap block max-w-full"
                        title={source} // Full URL shown on hover
                      >
                        {source.replace(/^(https?:\/\/)?(www\.)?/i, '').split('/')[0] + '...'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
          </div>
          
          <div 
            className="flex flex-col sm:flex-row gap-3 border-t border-gray-800 pt-5 mt-auto flex-shrink-0"
            // Ensure no swipe events trigger when interacting with buttons
            onMouseDown={(e) => e.stopPropagation()} 
            onTouchStart={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onGenerate(article.body, 'LinkedIn')}
              disabled={isGenerating}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/20"
            >
              <LinkedInIcon className="w-5 h-5 mr-2" />
              Create LinkedIn Post
            </button>
            <button
              onClick={() => onGenerate(article.body, 'Medium')}
              disabled={isGenerating}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors shadow-lg shadow-gray-700/20"
            >
              <MediumIcon className="w-5 h-5 mr-2" />
              Create Medium Post
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 transition-colors shadow-lg shadow-gray-900/20"
              title="Share Article Link"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* NEW: Custom Toast Notification (replaces alert()) */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-xl z-50 transition-opacity duration-300 animate-fadeInOut">
          Link copied to clipboard!
        </div>
      )}
    </>
  );
});
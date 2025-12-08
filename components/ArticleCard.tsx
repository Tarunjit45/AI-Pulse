
import React, { useRef, useState, useEffect } from 'react';
import { Article } from '../types';
import { LinkedInIcon, MediumIcon, ShareIcon } from './icons';
import { chatWithArticle } from '../services/geminiService';

// -- Visual Components --

const ScoreBar = ({ label, score, colorClass }: { label: string; score: number; colorClass: string }) => (
  <div className="mb-4 md:mb-5 group">
    <div className="flex justify-between text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400 mb-1.5 md:mb-2 group-hover:text-white transition-colors">
      <span>{label}</span>
      <span className={colorClass}>{score}%</span>
    </div>
    <div className="h-2 md:h-3 w-full bg-gray-900/50 rounded-full overflow-hidden border border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse"></div>
        <div 
            className={`h-full bg-gradient-to-r ${colorClass.includes('pink') ? 'from-purple-600 to-neon-pink' : 'from-blue-600 to-neon-cyan'} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
            style={{ width: `${score}%` }}
        />
    </div>
  </div>
);

const ChatInterface = ({ article }: { article: Article }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{role: string, content: string}[]>([
        { role: 'model', content: `Ready to analyze "${article.title}". What's on your mind?` }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const response = await chatWithArticle(article, userMsg, messages);
            setMessages(prev => [...prev, { role: 'model', content: response }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', content: "Link unstable. Retrying connection..." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full rounded-2xl border border-white/5 bg-black/20 overflow-hidden text-sm">
            <div className="flex-grow overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 md:px-4 md:py-3 text-sm md:text-base leading-relaxed shadow-lg ${
                            m.role === 'user' 
                            ? 'bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 text-white border border-neon-pink/20 rounded-tr-none' 
                            : 'bg-gray-800/80 text-gray-100 border border-white/5 rounded-tl-none backdrop-blur-sm'
                        }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {loading && <div className="text-[10px] text-neon-cyan animate-pulse pl-4 font-mono">:: PROCESSING QUERY ::</div>}
            </div>
            <div className="p-2 md:p-3 bg-black/30 border-t border-white/5 flex gap-2">
                <input 
                    className="flex-grow bg-gray-900/50 border border-gray-700/50 rounded-full px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all placeholder:text-gray-500 font-medium"
                    placeholder="Ask specific questions..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                    onClick={handleSend}
                    className="p-3 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-full transition-colors active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

// -- Main Component --

const renderMarkdown = (text: string) => {
  if(!text) return '';
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white shadow-neon-cyan/10 drop-shadow-sm">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-neon-cyan not-italic">$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-4 md:mb-6 leading-relaxed">')
    .replace(/\n/g, '<br />');

  // Enhanced readability for desktop (lg)
  return `<div class="font-body text-base md:text-lg lg:text-xl leading-7 md:leading-8 text-gray-200 tracking-wide">${html}</div>`;
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
  const isDragging = useRef(false);
  const dragStartPos = useRef<{ x: number } | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [swipeFeedback, setSwipeFeedback] = useState<'save' | 'skip' | null>(null);
  const [activeTab, setActiveTab] = useState<'story' | 'analysis' | 'chat'>('story');
  const [imageError, setImageError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => { setImageError(false); setActiveTab('story'); }, [article.imageUrl, article.title]);

  const articleHtml = renderMarkdown(article.body);
  const SWIPE_THRESHOLD = 80;

  // -- Interactions --

  const toggleSpeech = () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    } else {
        const utterance = new SpeechSynthesisUtterance(`${article.title}. ${article.body}`);
        utterance.rate = 1.0;
        utterance.pitch = 0.9;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button, input, .no-drag')) return;
    if (!isTopCard) return;

    isDragging.current = true;
    const point = 'touches' in e ? e.touches[0] : e;
    dragStartPos.current = { x: point.clientX };

    const handleDragMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !dragStartPos.current) return;
      const movePoint = 'touches' in moveEvent ? moveEvent.touches[0] : moveEvent;
      const dx = movePoint.clientX - dragStartPos.current.x;
      const rotation = dx * 0.04;
      
      setStyle({ transform: `translate(${dx}px, 0px) rotate(${rotation}deg)`, transition: 'none' });

      if (dx > 50) setSwipeFeedback('save');
      else if (dx < -50) setSwipeFeedback('skip');
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
        window.speechSynthesis.cancel();
        const exitX = dx > 0 ? window.innerWidth : -window.innerWidth;
        setStyle({ transform: `translate(${exitX}px, 0px) rotate(${dx * 0.1}deg)`, transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' });
        setTimeout(onSwipe, 400);
      } else {
        setStyle({ transform: 'translate(0, 0) rotate(0deg)', transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' });
      }
      setSwipeFeedback(null);
      dragStartPos.current = null;
    };
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  };

  return (
    <div
      ref={cardRef}
      className={`absolute w-full h-full bg-[#111827]/95 backdrop-blur-xl border border-white/15 rounded-2xl md:rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col transition-all duration-300 select-none ${isTopCard ? 'cursor-grab active:cursor-grabbing z-20 shadow-[0_0_40px_rgba(0,242,234,0.05)]' : 'scale-[0.94] translate-y-6 opacity-40 z-10 grayscale-[50%]'}`}
      style={style}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      {/* Swipe Feedback Indicators */}
      <div className={`absolute top-12 left-8 pointer-events-none transition-all duration-200 z-50 ${swipeFeedback === 'save' ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}`}>
         <div className="bg-gradient-to-r from-green-500 to-emerald-400 text-black font-display font-black text-xl md:text-2xl px-4 py-1.5 md:px-6 md:py-2 rounded-full -rotate-12 shadow-[0_0_20px_rgba(34,197,94,0.6)] tracking-widest">SAVE</div>
      </div>
      <div className={`absolute top-12 right-8 pointer-events-none transition-all duration-200 z-50 ${swipeFeedback === 'skip' ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}`}>
         <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-display font-black text-xl md:text-2xl px-4 py-1.5 md:px-6 md:py-2 rounded-full rotate-12 shadow-[0_0_20px_rgba(239,68,68,0.6)] tracking-widest">NEXT</div>
      </div>

      {/* Hero Image Section - Optimized for Desktop Height */}
      <div className="relative h-48 md:h-[35%] shrink-0 group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent z-10" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
            <span className="px-2.5 py-1.5 md:px-3 md:py-1.5 bg-black/70 backdrop-blur-md border border-white/20 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest text-white shadow-lg">
                {article.category || 'NEWS'}
            </span>
        </div>

        {/* Audio Button */}
        <button 
            onClick={(e) => { e.stopPropagation(); toggleSpeech(); }}
            className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-2 md:p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all border border-white/20 no-drag hover:scale-105 active:scale-95 touch-manipulation"
        >
            {isSpeaking ? (
                <div className="flex gap-1 h-4 w-4 md:h-5 md:w-5 items-center justify-center">
                    <span className="w-0.5 md:w-1 h-2 bg-neon-cyan animate-pulse"></span>
                    <span className="w-0.5 md:w-1 h-4 bg-neon-pink animate-pulse delay-75"></span>
                    <span className="w-0.5 md:w-1 h-3 bg-neon-cyan animate-pulse delay-150"></span>
                </div>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
            )}
        </button>

        {!imageError ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 pattern-grid-lg">
             <span className="text-gray-500 font-mono text-xs tracking-widest uppercase">Image Data Corrupted</span>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 p-4 md:p-6 lg:p-8 z-20 w-full">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-white leading-tight drop-shadow-xl line-clamp-2 shadow-black">{article.title}</h2>
        </div>
      </div>

      {/* Futuristic Tabs */}
      <div className="flex mx-3 md:mx-4 mt-2 p-1 bg-white/5 rounded-xl backdrop-blur-md border border-white/5 no-drag relative z-20 shrink-0">
        {[
            { id: 'story', label: 'Briefing' },
            { id: 'analysis', label: 'Deep Dive' },
            { id: 'chat', label: 'Ask Question' }
        ].map(tab => (
            <button
                key={tab.id}
                onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id as any); }}
                className={`flex-1 py-2 md:py-2.5 text-xs md:text-sm lg:text-base font-bold uppercase tracking-wider rounded-lg transition-all duration-300 relative ${activeTab === tab.id ? 'text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-blue-400 rounded-lg -z-10 animate-fade-in"></div>
                )}
                {tab.label}
            </button>
        ))}
      </div>
      
      {/* Content Area */}
      <div className="p-4 md:p-6 lg:p-8 flex-grow overflow-y-auto no-drag custom-scrollbar relative">
        
        {activeTab === 'story' && (
            <div className="animate-fadeIn">
                <div 
                  className="prose prose-invert prose-p:text-gray-200 max-w-none mb-4 md:mb-6"
                  dangerouslySetInnerHTML={{ __html: articleHtml }}
                />
                
                <div className="flex items-center gap-2 mt-4 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent flex-grow"></div>
                    <a href={article.sources[0]} target="_blank" rel="noopener noreferrer" className="text-[10px] md:text-xs text-neon-cyan font-mono uppercase tracking-widest hover:underline truncate max-w-[150px] md:max-w-[200px]">
                        SOURCE UPLINK
                    </a>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent flex-grow"></div>
                </div>
            </div>
        )}

        {activeTab === 'analysis' && article.analysis && (
            <div className="space-y-6 md:space-y-8 animate-fadeIn h-full flex flex-col justify-start pt-2">
                <div className="space-y-4">
                     <ScoreBar label="Hype Factor" score={article.analysis.hypeScore} colorClass="text-neon-pink" />
                     <ScoreBar label="Global Impact" score={article.analysis.impactScore} colorClass="text-neon-cyan" />
                </div>

                <div className="relative p-5 md:p-6 bg-gradient-to-br from-neon-purple/10 to-transparent rounded-xl md:rounded-2xl border border-neon-purple/20">
                    <div className="absolute -top-3 left-4 bg-[#111827] border border-neon-purple/20 px-3 py-0.5 text-xs md:text-sm font-bold text-neon-purple uppercase tracking-widest rounded-full">Projection</div>
                    <p className="text-gray-200 italic font-body text-sm md:text-base lg:text-lg leading-relaxed mt-1">
                        "{article.analysis.prediction}"
                    </p>
                </div>

                <div className="relative p-5 md:p-6 bg-gradient-to-br from-blue-900/10 to-transparent rounded-xl md:rounded-2xl border border-blue-500/20">
                    <div className="absolute -top-3 left-4 bg-[#111827] border border-blue-500/20 px-3 py-0.5 text-xs md:text-sm font-bold text-blue-400 uppercase tracking-widest rounded-full">Key Focus</div>
                    <div className="flex flex-col gap-2 mt-1">
                        <span className="text-white font-display font-bold text-lg md:text-xl lg:text-2xl">{article.analysis.technicalTerm}</span>
                        <span className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">{article.analysis.simpleDefinition}</span>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'chat' && (
            <div className="h-full animate-fadeIn pb-2">
                <ChatInterface article={article} />
            </div>
        )}
      </div>

      {/* Footer Actions */}
      <div 
        className="p-3 md:p-5 bg-[#111827]/95 backdrop-blur-xl border-t border-white/10 flex gap-2 md:gap-3 no-drag z-30 shrink-0"
      >
        <button
            onClick={() => onGenerate(article.body, 'LinkedIn')}
            disabled={isGenerating}
            className="flex-1 py-3 md:py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm lg:text-base font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-1.5 md:gap-2 group touch-manipulation"
        >
            <LinkedInIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
            <span>Post</span>
        </button>
        <button
            onClick={() => onGenerate(article.body, 'Medium')}
            disabled={isGenerating}
            className="flex-1 py-3 md:py-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs md:text-sm lg:text-base font-bold shadow-lg border border-white/10 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-1.5 md:gap-2 group touch-manipulation"
        >
            <MediumIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
            <span>Blog</span>
        </button>
        <button
            onClick={() => {
                 if (navigator.share) navigator.share({ title: article.title, url: article.sources[0] });
                 else navigator.clipboard.writeText(article.sources[0]);
            }}
            className="p-3 md:p-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-white/10 transition-all active:scale-95 hover:text-neon-cyan touch-manipulation"
        >
            <ShareIcon className="w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6" />
        </button>
      </div>
    </div>
  );
};

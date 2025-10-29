import React from 'react';
import { Article } from '../types';
import { LinkedInIcon, MediumIcon, ShareIcon } from './icons';

// A simple markdown-to-HTML renderer
const renderMarkdown = (text: string) => {
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
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, isGenerating, onGenerate }) => {
  const articleHtml = renderMarkdown(article.body);

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
      // Fallback for desktop or browsers that don't support Web Share API
      navigator.clipboard.writeText(article.sources[0] || window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <div className="bg-gray-950/50 border border-gray-800 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm">
      <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" />
      
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-3 text-white">{article.title}</h2>
        
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
        
        <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-800 pt-5">
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
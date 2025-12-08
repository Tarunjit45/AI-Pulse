import React, { useState } from 'react';
import { LinkedInPost, MediumArticle } from '../types';
import { LinkedInIcon, MediumIcon, CopyIcon } from './icons';

type PostContent = LinkedInPost | MediumArticle;

interface PostCardProps {
  platform: 'LinkedIn' | 'Medium';
  content: PostContent;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy Post"}
      className={`absolute top-4 right-4 p-2.5 rounded-xl transition-all duration-200 border ${
        copied
          ? 'bg-green-500/20 text-green-400 border-green-500/50 scale-110'
          : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10'
      }`}
    >
      <CopyIcon className="h-5 w-5" />
    </button>
  );
};

export const PostCard: React.FC<PostCardProps> = ({ platform, content }) => {
  const isLinkedIn = platform === 'LinkedIn';
  const post = content as LinkedInPost & MediumArticle;

  const getTextToCopy = () => {
    if (isLinkedIn) {
      return `${post.headline}\n\n${post.body}\n\n${post.hashtags.join(' ')}`;
    }
    return `${post.title}\n\n${post.body}\n\nTakeaway:\n${post.takeaway}`;
  };
  
  const isError = post.title?.startsWith('Error') || post.headline?.startsWith('Error');

  return (
    <div className={`bg-[#0a0f1e] rounded-2xl p-8 relative h-full flex flex-col border border-white/10 shadow-2xl ${isError ? 'border-red-500/50' : ''}`}>
      {!isError && <CopyButton textToCopy={getTextToCopy()} />}
      
      <div className="flex items-center space-x-3 mb-6 border-b border-white/5 pb-4">
        {isLinkedIn ? (
            <div className="p-2 bg-blue-600/20 rounded-lg">
                <LinkedInIcon className="h-6 w-6 text-blue-500" />
            </div>
        ) : (
            <div className="p-2 bg-white/10 rounded-lg">
                <MediumIcon className="h-6 w-6 text-white" />
            </div>
        )}
        <h3 className="text-xl font-display font-bold text-white tracking-wide">{platform} Draft</h3>
      </div>
      
      <div className="flex-grow space-y-5 text-gray-300 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
        <h4 className={`font-display font-bold text-xl leading-snug ${isError ? 'text-red-400' : 'text-neon-cyan'}`}>
            {isLinkedIn ? post.headline : post.title}
        </h4>
        
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed font-body text-gray-200">
            {post.body}
        </p>
        
        {isLinkedIn && post.hashtags?.length > 0 && (
          <p className="text-blue-400 text-sm font-medium tracking-wide">
            {post.hashtags.join(' ')}
          </p>
        )}

        {!isLinkedIn && post.takeaway && (
          <div className="mt-6 pt-4 border-t border-dashed border-white/10">
            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Key Takeaway</h5>
            <p className="text-sm italic text-gray-400 bg-white/5 p-4 rounded-xl border-l-2 border-neon-cyan">
                {post.takeaway}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
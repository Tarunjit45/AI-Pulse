
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
      className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 ${
        copied
          ? 'bg-green-500/20 text-green-400'
          : 'bg-gray-600/50 hover:bg-gray-500/50 text-gray-300'
      }`}
    >
      <CopyIcon className="h-5 w-5" />
      <span className="absolute -top-8 -right-2 bg-gray-900 text-xs px-2 py-1 rounded-md opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
        {copied ? 'Copied!' : 'Copy Post'}
      </span>
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

  return (
    <div className="bg-gray-800 rounded-lg p-6 relative group h-full flex flex-col border border-gray-700/80">
      <CopyButton textToCopy={getTextToCopy()} />
      <div className="flex items-center space-x-3 mb-4">
        {isLinkedIn ? <LinkedInIcon className="h-7 w-7" /> : <MediumIcon className="h-7 w-7" />}
        <h3 className="text-xl font-bold text-white">{platform} Post</h3>
      </div>
      
      <div className="flex-grow space-y-4 text-gray-300">
        <h4 className="font-semibold text-lg text-cyan-400">{isLinkedIn ? post.headline : post.title}</h4>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>
        
        {isLinkedIn && post.hashtags && (
          <p className="text-cyan-500 text-sm font-medium">{post.hashtags.join(' ')}</p>
        )}

        {!isLinkedIn && post.takeaway && (
          <div className="pt-2 border-t border-gray-700">
            <h5 className="font-semibold text-gray-200">Takeaway:</h5>
            <p className="text-sm italic">{post.takeaway}</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { LinkedInPost, MediumArticle } from '../types';
// Assuming extension-less import resolves correctly
import { LinkedInIcon, MediumIcon, CopyIcon } from './icons'; 

type PostContent = LinkedInPost | MediumArticle;

interface PostCardProps {
  platform: 'LinkedIn' | 'Medium';
  content: PostContent;
}

/**
 * Component responsible for copying text to the clipboard using the platform-approved method.
 */
const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);
  // FIX: New state to handle copy failure without using alert()
  const [copyError, setCopyError] = useState(false); 

  // FIX: Using document.execCommand('copy') for better compatibility in embedded environments
  const handleCopy = () => {
    setCopyError(false); // Reset error state

    const tempElement = document.createElement('textarea');
    tempElement.value = textToCopy;
    document.body.appendChild(tempElement);
    tempElement.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback copy failed
        setCopyError(true);
        setTimeout(() => setCopyError(false), 3000);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
      // FIX: Use state feedback instead of alert()
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }

    document.body.removeChild(tempElement);
  };
  
  // Helper to determine the button title based on state
  const getButtonTitle = () => {
    if (copied) return "Copied!";
    if (copyError) return "Copy Failed! Try selecting manually.";
    return "Copy Post";
  };


  return (
    <button
      onClick={handleCopy}
      title={getButtonTitle()}
      // FIX: Added error styling (red and pulse)
      className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 z-10 ${
        copied
          ? 'bg-green-500/20 text-green-400 scale-110'
          : copyError
          ? 'bg-red-500/20 text-red-400 animate-pulse'
          : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
      }`}
    >
      <CopyIcon className="h-5 w-5" />
    </button>
  );
};

// Use type guards to safely determine the content type
const isLinkedInPost = (content: PostContent): content is LinkedInPost => {
    return (content as LinkedInPost).headline !== undefined;
};

/**
 * Displays the generated social media post (LinkedIn or Medium) content.
 * FIX: Wrapped in React.memo for performance.
 */
export const PostCard: React.FC<PostCardProps> = React.memo(({ platform, content }) => {
  const isLinkedIn = platform === 'LinkedIn';
  
  // Use a narrowed type based on platform check
  const linkedInContent = isLinkedIn ? (content as LinkedInPost) : null;
  const mediumContent = !isLinkedIn ? (content as MediumArticle) : null;

  // Function to compile the text for copying
  const getTextToCopy = () => {
    if (linkedInContent) {
      return `${linkedInContent.headline}\n\n${linkedInContent.body}\n\n${linkedInContent.hashtags.join(' ')}`;
    }
    if (mediumContent) {
        return `${mediumContent.title}\n\n${mediumContent.body}\n\nTakeaway:\n${mediumContent.takeaway}`;
    }
    return ''; // Should not happen
  };
  
  // Check for error state based on required fields for each platform
  let titleOrHeadline: string | undefined;
  if (linkedInContent) {
      titleOrHeadline = linkedInContent.headline;
  } else if (mediumContent) {
      titleOrHeadline = mediumContent.title;
  }
  
  const isError = titleOrHeadline?.startsWith('Error');

  return (
    <div className={`bg-gray-900 rounded-xl p-6 relative h-full flex flex-col border ${isError ? 'border-red-500/50' : 'border-gray-700/80'}`}>
      {!isError && <CopyButton textToCopy={getTextToCopy()} />}
      <div className="flex items-center space-x-3 mb-4">
        {isLinkedIn ? <LinkedInIcon className="h-7 w-7 text-blue-500" /> : <MediumIcon className="h-7 w-7" />}
        <h3 className="text-xl font-bold text-white" id="modal-title">{platform} Post</h3>
      </div>
      
      <div className="flex-grow space-y-4 text-gray-300 overflow-y-auto max-h-[60vh]">
        
        {/* Title/Headline Display */}
        <h4 className={`font-extrabold text-lg ${isError ? 'text-red-400' : 'text-cyan-400'}`}>
            {titleOrHeadline}
        </h4>
        
        {/* Body Content */}
        {linkedInContent && <p className="whitespace-pre-wrap text-sm leading-relaxed">{linkedInContent.body}</p>}
        {mediumContent && <p className="whitespace-pre-wrap text-sm leading-relaxed">{mediumContent.body}</p>}
        
        {/* LinkedIn Hashtags */}
        {linkedInContent && linkedInContent.hashtags?.length > 0 && (
          <p className="text-cyan-500 text-sm font-medium pt-2 border-t border-gray-800">
              {linkedInContent.hashtags.join(' ')}
          </p>
        )}

        {/* Medium Takeaway */}
        {mediumContent && mediumContent.takeaway && (
          <div className="pt-2 border-t border-gray-800">
            <h5 className="font-semibold text-gray-200">Takeaway:</h5>
            <p className="text-sm italic">{mediumContent.takeaway}</p>
          </div>
        )}
      </div>
    </div>
  );
});
import React from 'react';
import { LinkedInIcon, GitHubIcon, EmailIcon } from './icons';

const SocialLink: React.FC<{ href: string; children: React.ReactNode; ariaLabel: string }> = ({ href, children, ariaLabel }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={ariaLabel}
    className="p-2 text-gray-500 hover:text-neon-cyan transition-all duration-300 hover:scale-110 hover:bg-white/5 rounded-lg"
  >
    {children}
  </a>
);

export const Footer: React.FC = () => {
  return (
    <footer className="w-full relative z-10 mt-12 border-t border-white/5 bg-black/40 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-8 text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <SocialLink href="https://www.linkedin.com/in/tarunjit-biswas-a5248131b/" ariaLabel="Tarunjit Biswas's LinkedIn Profile">
            <LinkedInIcon className="h-5 w-5" />
          </SocialLink>
          <div className="w-px h-4 bg-gray-800"></div>
          <SocialLink href="https://github.com/Tarunjit45" ariaLabel="Tarunjit Biswas's GitHub Profile">
            <GitHubIcon className="h-5 w-5" />
          </SocialLink>
          <div className="w-px h-4 bg-gray-800"></div>
          <SocialLink href="mailto:tarunjitbiswas24@gmail.com" ariaLabel="Email Tarunjit Biswas">
            <EmailIcon className="h-5 w-5" />
          </SocialLink>
        </div>
        <p className="text-xs font-medium text-gray-600 tracking-wide">
          ENGINEERED BY <span className="text-gray-400 font-bold hover:text-neon-pink transition-colors cursor-default">TARUNJIT BISWAS</span>
        </p>
      </div>
    </footer>
  );
};
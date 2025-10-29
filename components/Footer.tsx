import React from 'react';
import { LinkedInIcon, GitHubIcon, EmailIcon } from './icons';

const SocialLink: React.FC<{ href: string; children: React.ReactNode; ariaLabel: string }> = ({ href, children, ariaLabel }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={ariaLabel}
    className="text-gray-400 hover:text-white transform hover:scale-110 transition-all duration-300"
  >
    {children}
  </a>
);

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black border-t border-gray-800/50 py-6 mt-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center text-gray-500">
        <p className="mb-4 text-sm">
          Built by <span className="font-semibold text-gray-300">Tarunjit Biswas</span>
        </p>
        <div className="flex items-center justify-center space-x-6">
          <SocialLink href="https://www.linkedin.com/in/tarunjit-biswas-a5248131b/" ariaLabel="Tarunjit Biswas's LinkedIn Profile">
            <LinkedInIcon className="h-6 w-6" />
          </SocialLink>
          <SocialLink href="https://github.com/Tarunjit45" ariaLabel="Tarunjit Biswas's GitHub Profile">
            <GitHubIcon className="h-6 w-6" />
          </SocialLink>
          <SocialLink href="mailto:tarunjitbiswas24@gmail.com" ariaLabel="Email Tarunjit Biswas">
            <EmailIcon className="h-6 w-6" />
          </SocialLink>
        </div>
      </div>
    </footer>
  );
};
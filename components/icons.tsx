import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

// FIX: Wrapped pure components in React.memo for performance optimization
export const LogoIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9.002 11.25a.75.75 0 0 1 .75-.75h.005a.75.75 0 0 1 .75.75v.005a.75.75 0 0 1-.75.75h-.005a.75.75 0 0 1-.75-.75v-.005ZM10.5 15a.75.75 0 0 0-.75-.75h-.005a.75.75 0 0 0-.75.75v.005a.75.75 0 0 0 .75.75h.005a.75.75 0 0 0 .75-.75v-.005Zm3.75-1.5a.75.75 0 0 1 .75-.75h.005a.75.75 0 0 1 .75.75v.005a.75.75 0 0 1-.75.75h-.005a.75.75 0 0 1-.75-.75v-.005Zm1.5 3a.75.75 0 0 0-.75-.75h-.005a.75.75 0 0 0-.75.75v.005a.75.75 0 0 0 .75.75h.005a.75.75 0 0 0 .75-.75v-.005ZM12 8.25a.75.75 0 0 1 .75-.75h.005a.75.75 0 0 1 .75.75v.005a.75.75 0 0 1-.75.75h-.005a.75.75 0 0 1-.75-.75V8.25Z" clipRule="evenodd" />
    <path d="M11.248 15.012a2.248 2.248 0 0 0 2.248-2.248v-.005a2.248 2.248 0 0 0-2.248-2.248h-.005a2.248 2.248 0 0 0-2.248 2.248v.005a2.248 2.248 0 0 0 2.248 2.248h.005Z" />
  </svg>
));

export const LinkedInIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.25 6.5 1.75 1.75 0 016.5 8.25zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.62 1.62 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.4 1.16 3.4 4.3z"/>
  </svg>
));

export const MediumIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M7.45,14.23l2.2-3.92L11.75,6h5.81l-3.2,5.55,2.71,5.32h-5.4L9.13,11.5l-2,3.87H3.45l4-6.52Z"/>
    <path d="M18.3,18.87h-5.26l.48-1L18.78,6h4.77L18.3,18.87Z"/>
  </svg>
));

export const CopyIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
));

export const XIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
));

export const RefreshIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-2.121a.75.75 0 01-.75-.75H16.023a.75.75 0 010-1.5zM4.5 12a7.5 7.5 0 017.5-7.5v0a7.5 7.5 0 017.5 7.5v0a7.5 7.5 0 01-7.5 7.5v0a7.5 7.5 0 01-7.5-7.5z" />
  </svg>
));


export const ShareIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.05.588.08a2.25 2.25 0 012.158 2.308c.036.636.088 1.27.15 1.897m-.86.754c.228.026.46.05.694.074a2.25 2.25 0 100-2.186m0 2.186c-.195-.025-.39-.05-.588-.08a2.25 2.25 0 00-2.158-2.308c-.036-.636-.088-1.27-.15-1.897m.86-.754c-.228-.026-.46-.05-.694-.074" />
  </svg>
));

export const GitHubIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.492.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.578.688.48A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
  </svg>
));

export const EmailIcon: React.FC<IconProps> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
  </svg>
));
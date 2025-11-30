import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Note: We load env variables, but we DO NOT expose the GEMINI_API_KEY
    // via the `define` property. Secrets must be handled by a backend proxy.
    const env = loadEnv(mode, '.', ''); 
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // SECURITY FIX: Removed the insecure `define` block which exposed API_KEY to the client.
      // Environment variables must now be accessed via `import.meta.env`
      // and only those prefixed with VITE_ are public.
      
      resolve: {
        alias: {
          // Standard Vite Alias Resolution
          '@': path.resolve(__dirname, './'), 
        }
      }
    };
});

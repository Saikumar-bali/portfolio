import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import jevMiddleware from './server/index.js';

// https://vite.dev/config
export default defineConfig({
  plugins: [react(), jevMiddleware()],
});

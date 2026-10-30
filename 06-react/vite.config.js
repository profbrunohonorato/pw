import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/pw/06-react/',
  test: { environment: 'jsdom', setupFiles: './src/setupTests.js' }
});

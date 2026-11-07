import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Configure Vite to transform JSX and enable React Fast Refresh during development.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    clearMocks: true,
  },
});

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main:           resolve(__dirname, 'index.html'),
        researchTheme:  resolve(__dirname, 'research-theme/index.html'),
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import yaml from '@modyfi/vite-plugin-yaml';
import pkg from 'esbuild-plugin-yaml';

const { yamlPlugin } = pkg;

export default defineConfig({
  plugins: [react(), yaml()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [yamlPlugin()],
    },
  },
});
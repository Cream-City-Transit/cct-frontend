import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import yaml from '@modyfi/vite-plugin-yaml';
import pkg from 'esbuild-plugin-yaml';
import {nodePolyfills} from "vite-plugin-node-polyfills";

const { yamlPlugin } = pkg;

export default defineConfig({
  plugins: [react(), yaml(), nodePolyfills({include: ['querystring']})],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [yamlPlugin()],
    },
  },
});
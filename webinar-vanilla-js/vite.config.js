import { defineConfig } from 'vite';

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export default defineConfig({
  root: 'src',
  base: '/',
  mode: 'development', // 'production'
  plugins: [],
  publicDir: '../public',
  logLevel: 'info',
  clearScreen: false,
  envDir: './',
  appType: 'spa', // 'spa' | 'mpa' | 'custom'
  server: {
    host: process.env.FE_JS_HOST || 'localhost', // '0.0.0.0'
    port: process.env.FE_JS_PORT || 3000,
    strictPort: true,
    cors: true,
  },
  build: {
    outDir: '../dist',
  },
});

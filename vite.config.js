import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import tailwindcss from '@tailwindcss/vite'; <-- REMOVE THIS LINE
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // tailwindcss(), <-- REMOVE THIS LINE
  ],
  base: './',
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './localhost.pem')),
    },
    port: 5173,
  },
});
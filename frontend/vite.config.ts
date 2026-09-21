import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repositoryBase = process.env.VITE_BASE_PATH ?? '/GeoBrasil/';

export default defineConfig({
  base: repositoryBase,
  plugins: [react()],
  server: {
    port: 5173,
  },
});

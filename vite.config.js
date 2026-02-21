import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  base: '/html/diagrammes/', // Chemin exact sur votre serveur
  publicDir: 'public', // Vite cherchera ici les fichiers statiques (comme l'api)
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        accords: resolve(__dirname, 'src/accords.html'),
      },
    },
  },
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    root: '.', // Chercher les tests à partir de la racine du projet
  },
});

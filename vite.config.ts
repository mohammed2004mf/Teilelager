import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    // Die Excel-Bibliothek für die Sicherung ist groß, wird aber nur beim Klick geladen
    chunkSizeWarningLimit: 1200,
  },
});

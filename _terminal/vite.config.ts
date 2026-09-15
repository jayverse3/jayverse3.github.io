import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../assets/terminal',
    emptyOutDir: true,
    target: 'es2022',
    license: { fileName: 'THIRD_PARTY_NOTICES.md' },
    lib: {
      entry: 'src/main.ts',
      formats: ['es'],
      fileName: () => 'terminal.js',
      cssFileName: 'terminal',
    },
  },
});

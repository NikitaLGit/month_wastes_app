// Конфигурация сборки Vite. Зависимости: @vitejs/plugin-react, vite-plugin-singlefile.
// viteSingleFile — инлайнит весь JS и CSS прямо в dist/index.html (один файл без чанков).
// Нужно потому что Express раздаёт статику из dist/ и не должен обрабатывать хэшированные чанки.
// outDir: 'dist' — туда же Express монтирует express.static.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

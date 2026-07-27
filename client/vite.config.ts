import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Вказуємо, що всі запити, які починаються з /api, треба відправляти на бекенд
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
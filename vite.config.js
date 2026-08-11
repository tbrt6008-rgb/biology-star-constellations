import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 子路径部署（https://<user>.github.io/biology-star-constellations/）
  base: '/biology-star-constellations/',
  plugins: [vue(), tailwindcss()],
})

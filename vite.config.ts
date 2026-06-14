import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/Medical/',
  build: {
    outDir: 'docs',
  },
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      closeBundle() {
        // Copy index.html as 404.html for GitHub Pages SPA fallback
        const outDir = resolve(__dirname, 'docs')
        copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
        console.log('✓ 404.html created for SPA fallback')
      },
    },
  ],
})

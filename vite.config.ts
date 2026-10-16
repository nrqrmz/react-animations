import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// VITE_BASE is set by the GitHub Pages workflow (e.g. "/my-repo/").
// Everywhere else (local dev, Vercel, Netlify) it is undefined, so we use "/".
// Do not edit this by hand.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})

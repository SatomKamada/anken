import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Codespaces でプレビューできるように host を開放
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})

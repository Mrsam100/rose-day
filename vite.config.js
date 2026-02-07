import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js + R3F in their own chunk — never loaded on mobile
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
})


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  
  plugins: [react()],
  base: './', 
  // base:'/Kalhyge-prod/',
  // base: import.meta.env.VITE_BASE_URL ,

  // Pour gérer les soucis avec docker et le serveur de vitejs
  // On rajoute la config suivante
  // build: {
  //   rollupOptions: {
  //     input: '/index.html',
  //   },
  // },
  build: {
    outDir: 'dist', // Dossier de build attendu par Vercel
  },
  server: {
    host: true,
    watch: {
      usePolling: true
    },
  }
  
})

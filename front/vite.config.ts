
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  
  plugins: [react()],
  base: '/', 
  // base:'/Kalhyge-prod/',
  // base: import.meta.env.VITE_BASE_URL ,

  // Pour gérer les soucis avec docker et le serveurs de vitejs
  // On rajoute la config suivante
  // build: {
  //   rollupOptions: {
  //     input: '/index.html',
  //   },
  // },
  build: {
    outDir: 'dist', // Vérifiez que le dossier de build est "dist"
    rollupOptions: {
      input: 'index.html', // Point d'entrée pour le build
    },
  },
  server: {
    host: true,
    watch: {
      usePolling: true
    },
  }
  
})

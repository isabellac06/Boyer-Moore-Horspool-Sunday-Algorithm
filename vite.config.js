import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' hace que la página funcione en GitHub Pages (https://usuario.github.io/repositorio/)
export default defineConfig({
  plugins: [react()],
  base: './',
})

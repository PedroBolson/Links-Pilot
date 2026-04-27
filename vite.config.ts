import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('/firebase/')) return 'vendor-firebase'
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
            return 'vendor-react'
          }
          if (id.includes('/react-router') || id.includes('/@remix-run/')) {
            return 'vendor-router'
          }
          if (id.includes('/@tanstack/')) return 'vendor-query'
          if (
            id.includes('/i18next/') ||
            id.includes('/react-i18next/') ||
            id.includes('/i18next-browser-languagedetector/')
          ) {
            return 'vendor-i18n'
          }
          if (id.includes('/date-fns/')) return 'vendor-date'
          if (id.includes('/lucide-react/') || id.includes('/lucide/')) return 'vendor-icons'
          if (id.includes('/qrcode.react/')) return 'vendor-qr'
          if (
            id.includes('/@base-ui/') ||
            id.includes('/sonner/') ||
            id.includes('/class-variance-authority/') ||
            id.includes('/tailwind-merge/') ||
            id.includes('/clsx/')
          ) {
            return 'vendor-ui'
          }

          return 'vendor-misc'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

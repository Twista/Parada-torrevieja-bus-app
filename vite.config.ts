import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'node:child_process'

function commit(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
}

const buildDate = new Intl.DateTimeFormat('cs-CZ', { timeZone: 'Europe/Madrid', day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date())

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(`${commit()} · ${buildDate}`) },
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Torrebus',
        short_name: 'Torrebus',
        lang: 'cs',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#c8102e',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,mjs,css,html,png,ico,svg}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'api', networkTimeoutSeconds: 4, expiration: { maxEntries: 300, maxAgeSeconds: 14 * 86400 } },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'tiles.openfreemap.org',
            handler: 'CacheFirst',
            options: { cacheName: 'tiles', expiration: { maxEntries: 3000, maxAgeSeconds: 30 * 86400 } },
          },
        ],
      },
    }),
  ],
  server: { proxy: { '/api': 'http://localhost:8788' } },
})

import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    // 5velte-ph4ser ships raw Svelte/TS source — make sure it shares this
    // app's phaser and svelte instances
    dedupe: ['phaser', 'svelte'],
  },
  server: {
    // the Oak API server (deno task dev:server)
    proxy: {
      '/api': 'http://localhost:8004',
    },
  },
})

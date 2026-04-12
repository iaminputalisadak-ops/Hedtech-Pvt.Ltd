import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** cPanel / FTP often skip dotfiles — ship visible copies next to .htaccess in dist/. */
function htaccessCpanelBackupPlugin() {
  return {
    name: 'htaccess-cpanel-backup',
    closeBundle() {
      const dist = join(__dirname, 'dist')
      const rootHt = join(__dirname, 'public', '.htaccess')
      const apiHt = join(__dirname, '..', 'backend', 'public', '.htaccess')
      const banner =
        '# Hedztech — rename this file to `.htaccess` (leading dot) after upload if your client hid the real .htaccess.\n' +
        '# Lines starting with # are comments and are safe in Apache.\n\n'

      if (existsSync(rootHt)) {
        writeFileSync(join(dist, 'CPANEL-public_html-RENAME-TO-dothtaccess.txt'), banner + readFileSync(rootHt, 'utf8'))
      }
      if (existsSync(apiHt)) {
        writeFileSync(join(dist, 'CPANEL-api-folder-RENAME-TO-dothtaccess.txt'), banner + readFileSync(apiHt, 'utf8'))
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), htaccessCpanelBackupPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('swiper')) return 'vendor-swiper'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('lucide-react')) return 'vendor-icons'
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('react-helmet')) return 'vendor-helmet'
          if (id.includes('@ckeditor') || id.includes('ckeditor')) return 'vendor-ckeditor'
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
})

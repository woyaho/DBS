import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8090,
    open: true,
    proxy: {
      '/api': {
        target: 'http://124.222.236.194:8090/spring-api',
        changeOrigin: true,
        secure: false,
        ws: false,
        followRedirects: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})

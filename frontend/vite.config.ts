import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [
      vue(),
    ],
    // GitHub Pages 需要子路径部署
    base: isProduction ? '/malmodel-scan/' : '/',
    resolve: {
      alias: {
        '@': './src'
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,  // 生产环境关闭 sourcemap
      minify: isProduction ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            // 将大的依赖库分包
            'vendor': ['vue', 'vue-router', 'pinia'],
            'ui': ['@vueuse/core']
          }
        }
      }
    },
    server: {
      port: 5173,
      host: '127.0.0.1',
      // 开发环境代理后端 API
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5180',
          changeOrigin: true,
          secure: false
        }
      }
    },
    preview: {
      port: 4173,
      host: '0.0.0.0'  // 监听所有网络接口，支持SSH转发
    }
  }
})
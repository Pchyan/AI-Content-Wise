import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數
  const env = loadEnv(mode, process.cwd())
  
  return {
    plugins: [
      react({
        // @ts-ignore - strictMode 選項可能未在類型定義中
        strictMode: env.REACT_APP_STRICT_MODE !== 'false',
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // 使用環境變數中的 base URL 或預設值
    base: './',
    // 關閉部分警告訊息
    build: {
      sourcemap: true,
      rollupOptions: {
        onwarn(warning, warn) {
          // 忽略特定警告
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || 
              warning.message && warning.message.includes('react-router')) {
            return
          }
          warn(warning)
        }
      }
    },
    // 開發伺服器選項
    server: {
      open: true,
      host: true
    }
  }
})

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// 로컬에서 CLOVA 프록시 사용 시 .env에 VITE_CLOVA_PROXY_TARGET=https://배포도메인.vercel.app 설정
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const clovaProxyTarget = env.VITE_CLOVA_PROXY_TARGET

  return {
  plugins: [react(), tailwindcss()],
  server: {
    proxy: clovaProxyTarget
      ? { '/api': { target: clovaProxyTarget, changeOrigin: true } }
      : undefined,
  },
  build: {
    // 코드 스플리팅 최적화
    rollupOptions: {
      output: {
        manualChunks: {
          // React 라이브러리를 별도 청크로 분리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Framer Motion을 별도 청크로 분리
          'animation': ['framer-motion'],
          // Supabase를 별도 청크로 분리
          'supabase': ['@supabase/supabase-js'],
          // Lucide 아이콘을 별도 청크로 분리
          'icons': ['lucide-react'],
        },
      },
    },
    // 청크 크기 경고 임계값 조정 (KB)
    chunkSizeWarningLimit: 1000,
    // CSS 코드 스플리팅
    cssCodeSplit: true,
    // Source map 비활성화 (프로덕션)
    sourcemap: false,
  },
  // 최적화 옵션
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
  }
})

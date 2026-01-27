import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
          // Google AI를 별도 청크로 분리
          'ai': ['@google/generative-ai'],
        },
      },
    },
    // 청크 크기 경고 임계값 조정 (KB)
    chunkSizeWarningLimit: 1000,
    // 압축 최적화
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true,
      },
    },
    // CSS 코드 스플리팅
    cssCodeSplit: true,
    // Source map 비활성화 (프로덕션)
    sourcemap: false,
  },
  // 최적화 옵션
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
})

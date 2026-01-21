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
        },
      },
    },
    // 청크 크기 경고 임계값 조정 (KB)
    chunkSizeWarningLimit: 1000,
  },
})

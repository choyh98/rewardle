import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 개발 환경에서 Gemini API 테스트 유틸리티 로드
if (import.meta.env.DEV) {
  import('./services/geminiTestUtils').then(({ geminiTest }) => {
    (window as any).geminiTest = geminiTest;
    console.log('%c🤖 Gemini API 테스트 도구가 로드되었습니다!', 'color: #4285f4; font-weight: bold; font-size: 14px;');
    console.log('%c사용법:', 'color: #34a853; font-weight: bold;');
    console.log('  geminiTest.runAll() - 전체 테스트');
    console.log('  geminiTest.connection() - 연결 테스트');
    console.log('  geminiTest.ask("질문") - AI 응답 테스트');
    console.log('  geminiTest.validateKey() - API 키 검증');
  });
}

createRoot(document.getElementById('root')!).render(
  <App />
)

# 성능 최적화 가이드

## 적용된 최적화 항목

### 1. 코드 스플리팅 (Code Splitting)
- **Lazy Loading**: 모든 페이지와 게임 컴포넌트를 lazy loading으로 구현
- **Manual Chunks**: 라이브러리별로 청크 분리
  - `react-vendor`: React 라이브러리
  - `animation`: Framer Motion
  - `supabase`: Supabase 클라이언트
  - `icons`: Lucide 아이콘
  - `ai`: Google AI

### 2. 빌드 최적화
- **Minification**: Terser를 사용한 코드 압축
- **Tree Shaking**: 사용하지 않는 코드 자동 제거
- **Console 제거**: 프로덕션 빌드에서 console.log 자동 제거
- **CSS Code Split**: CSS 파일도 분리하여 로딩

### 3. 리소스 최적화
- **DNS Prefetch**: CDN 연결 사전 준비
- **Font Preload**: 핵심 폰트(Regular, Bold) 우선 로딩
- **Font Display Swap**: 폰트 로딩 중에도 텍스트 표시

### 4. 이미지 최적화 권장사항
```bash
# 이미지 압축 도구 (수동 실행)
# 1. TinyPNG 또는 Squoosh 사용
# 2. WebP 포맷으로 변환 권장
# 3. 적절한 해상도로 리사이징 (2x까지만)
```

#### 현재 이미지 파일 목록
- `src/assets/apple.png` → WebP 변환 권장
- `src/assets/background.png` → WebP 변환 권장
- `src/assets/check.png` → SVG 또는 WebP 권장
- `src/assets/guide.png` → WebP 변환 권장
- `src/assets/logo.png` → WebP 변환 권장
- `src/assets/point.png` → SVG 또는 WebP 권장
- `src/assets/wordle.png` → WebP 변환 권장

### 5. 런타임 최적화
- **React.memo**: 불필요한 리렌더링 방지
- **useCallback & useMemo**: 함수/값 메모이제이션
- **Debounce/Throttle**: 이벤트 핸들러 최적화

### 6. 네트워크 최적화
- **HTTP/2**: Vercel에서 자동 지원
- **Compression**: Gzip/Brotli 자동 적용
- **CDN**: Vercel Edge Network 활용

## 성능 측정

### Lighthouse 점수 목표
- **Performance**: 90+ 
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 90+

### 측정 도구
```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse https://your-domain.com --view

# Webpack Bundle Analyzer (개발 중)
npm install -D rollup-plugin-visualizer
```

## 추가 최적화 가능 항목

### 1. 이미지 최적화 (수동)
```bash
# WebP 변환 예시
cwebp input.png -q 80 -o output.webp

# 또는 온라인 도구 사용
https://squoosh.app/
https://tinypng.com/
```

### 2. Service Worker (PWA)
- 오프라인 캐싱
- 백그라운드 동기화
- 푸시 알림

### 3. Database 최적화
- Supabase 인덱스 추가
- RLS 정책 최적화
- 쿼리 성능 모니터링

### 4. 모니터링
- Vercel Analytics 활성화
- Sentry 에러 트래킹 (선택)
- 실사용자 성능 모니터링 (RUM)

## 배포 전 체크리스트

- [ ] `npm run build` 성공 확인
- [ ] Bundle 크기 확인 (각 청크 < 500KB 권장)
- [ ] Lighthouse 점수 확인
- [ ] 모바일 테스트 (실제 기기)
- [ ] 네트워크 throttling 테스트
- [ ] 이미지 WebP 변환
- [ ] 환경 변수 설정 확인
- [ ] Supabase RLS 정책 확인
- [ ] 에러 핸들링 테스트

## 성능 모니터링 명령어

```bash
# 빌드 분석
npm run build

# Preview 모드로 테스트
npm run preview

# 번들 크기 확인
du -sh dist/assets/*
```

## 참고 자료
- [Vite 최적화 가이드](https://vitejs.dev/guide/build.html)
- [React 성능 최적화](https://react.dev/learn/render-and-commit)
- [Web.dev 성능 가이드](https://web.dev/performance/)

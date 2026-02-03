# Puppeteer 크롤링 설치 가이드

## 1. 패키지 설치
```bash
npm install puppeteer-core @sparticuz/chromium
npm install --save-dev @types/puppeteer-core
```

## 2. 사용법
- `api/scrape-naver.ts` 파일이 자동으로 `/api/scrape-naver` 엔드포인트 생성
- Vercel에 배포하면 자동으로 작동

## 3. 테스트
```bash
# 로컬 테스트 (vercel dev 필요)
npm install -g vercel
vercel dev
```

## 4. 주의사항
- Puppeteer는 Vercel Pro 플랜에서만 완전히 작동
- Free 플랜에서는 실행 시간 제한(10초) 초과 가능성 있음
- 대안: AI 검색 기능 활용 (현재 구현됨)

# 리워들 (Rewardle) 🎮

> 게임으로 브랜드를 알리고, 포인트를 받는 리워드 플랫폼

## ✨ 주요 기능

### 🎯 게임
- **워들 게임**: 브랜드명을 맞추는 단어 추리 게임  
- **사과 게임**: 숫자 10을 만들어 글자를 모으는 퍼즐 게임  
- **슈팅 워들**: 움직이는 글자를 명중시키는 액션 게임
- **일일 제한**: 하루 최대 10회 플레이 (24시간 타이머)

### 🎁 리워드
- 게임 완료 시 포인트 적립  
- 일일 출석 체크 (2P + 연속 출석 보너스)  
- 추가 미션으로 보너스 포인트

### 👤 사용자
- Google 소셜 로그인  
- 게스트 모드 지원  
- 데이터 동기화 (로그인 사용자)

## 🚀 시작하기

### 설치
```bash
npm install
```

### 데이터베이스 설정
**Supabase 설정 (필수):**
1. `supabase_complete_schema.sql` 실행
   - Supabase Dashboard → SQL Editor
   - 파일 내용 복사 → 붙여넣기 → Run
   - 상세 가이드: `SUPABASE_SETUP.md` 참조

### 환경 변수
`.env` 파일 생성:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key  # AI 미션 생성용 (선택)
VITE_ONNURI_API_KEY=your_onnuri_api_key  # 온누리상품권 API (선택)
```

⚠️ **중요:** 
- `.env` 파일 수정 후 반드시 개발 서버 재시작!
- 본인의 API 키를 발급받아 사용하세요 (코드에 하드코딩 금지)
- 자세한 가이드: `SECURITY_API_KEY_REMOVAL.md` 참고

### 개발 서버
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### 배포
```bash
# 자동 배포
deploy.bat

# 또는 수동
git add .
git commit -m "your message"
git push origin main
```

## 📦 기술 스택

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion

**Backend**
- Supabase (Database + Auth)
- PostgreSQL

**배포**
- Vercel

## 📂 프로젝트 구조

```
src/
├── components/
│   ├── common/          # 공통 UI 컴포넌트
│   └── games/           # 게임 컴포넌트
├── context/
│   ├── AuthContext      # 인증 관리
│   └── PointsContext    # 포인트 관리
├── hooks/               # 커스텀 훅
├── lib/
│   ├── services.ts      # API 서비스 레이어
│   └── supabase.ts      # Supabase 클라이언트
├── pages/               # 페이지 컴포넌트
└── types/               # TypeScript 타입 정의
```

## 🗄️ 데이터베이스

### 테이블 구조
- `brands` - 브랜드/퀴즈 정보
- `user_points` - 사용자 포인트
- `point_history` - 포인트 내역
- `attendance` - 출석 기록
- `game_plays` - 게임 플레이 내역 (wordle, apple, shooting)

### 설정 방법
상세한 데이터베이스 설정은 `SUPABASE_SETUP.md`를 참조하세요.

**빠른 시작:**
```sql
-- Supabase SQL Editor에서 실행
-- 파일: supabase_complete_schema.sql
```

## 📱 주요 페이지

- `/` - 로그인
- `/home` - 메인 홈
- `/game/wordle` - 워들 게임
- `/game/apple` - 사과 게임
- `/game/shooting` - 슈팅 워들
- `/attendance` - 출석 체크
- `/points-history` - 포인트 내역
- `/admin` - 관리자 대시보드

## 📚 문서

### 기본 가이드
- `SUPABASE_SETUP.md` - 데이터베이스 설정 가이드
- `QA_TEST_GUIDE.md` - QA 테스트 및 검증 가이드
- `supabase_complete_schema.sql` - 통합 DB 스키마

### API 연동 가이드
- `ONNURI_API_GUIDE.md` - 온누리상품권 가맹점 API 연동 가이드
- `GEMINI_API_GUIDE.md` - Gemini AI 설정 가이드
- `GEMINI_API_TROUBLESHOOTING.md` - ⚠️ **Gemini API 에러 해결 방법**

### 🚨 문제 해결
**"Gemini API Error" 발생 시:**
1. 브라우저 콘솔에서 `geminiTest.runAll()` 실행
2. `GEMINI_API_TROUBLESHOOTING.md` 파일 참고
3. `.env` 파일에서 API 키 확인 후 서버 재시작

## 📄 라이선스

MIT License

---

**Made with ❤️ by Rewardle Team**

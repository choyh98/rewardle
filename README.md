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
```

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

- `SUPABASE_SETUP.md` - 데이터베이스 설정 가이드
- `QA_TEST_GUIDE.md` - QA 테스트 및 검증 가이드
- `supabase_complete_schema.sql` - 통합 DB 스키마

## 📄 라이선스

MIT License

---

**Made with ❤️ by Rewardle Team**

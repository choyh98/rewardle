# 리워들 (Rewardle) 🎮

> 광고를 플레이하다, 혜택을 획득하다

리워들은 게임을 통해 브랜드를 재미있게 알리고, 사용자는 포인트를 적립할 수 있는 리워드 플랫폼입니다.

## ✨ 주요 기능

### 🎯 게임
- **워들 게임**: 브랜드명을 맞추는 단어 추리 게임
- **사과 게임**: 숫자 10을 만들어 글자를 모으는 퍼즐 게임
- **일일 제한**: 하루 최대 10회 게임 플레이 가능

### 🎁 리워드 시스템
- 게임 완료 시 포인트 적립
- 일일 출석 체크 (2P)
- 연속 출석 보너스
  - 3일 연속: +1P
  - 7일 연속: +3P
  - 10일 연속: +5P
  - 30일 연속: +20P

### 👤 사용자 인증
- Google 소셜 로그인
- 게스트 모드 지원
- 게스트 → 로그인 시 데이터 자동 마이그레이션

### 📊 데이터 관리
- **로그인 사용자**: Supabase 데이터베이스에 저장
- **게스트 사용자**: localStorage에 저장
- 여러 기기에서 데이터 동기화 (로그인 사용자)

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd 리워들
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용 추가:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

자세한 내용은 [ENV_SETUP.md](./ENV_SETUP.md) 참고

### 4. Supabase 설정

1. [Supabase](https://supabase.com) 프로젝트 생성
2. SQL Editor에서 `supabase_schema.sql` 실행
3. Google OAuth 설정

자세한 내용은 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) 참고

### 5. 개발 서버 실행

```bash
npm run dev
```

## 📦 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Framer Motion** - 애니메이션
- **React Router** - 라우팅

### Backend & Database
- **Supabase** - 백엔드 플랫폼
  - PostgreSQL 데이터베이스
  - 인증 (Google OAuth)
  - Row Level Security (RLS)
  - 실시간 동기화

### 배포
- **Vercel** - 프론트엔드 호스팅

## 📂 프로젝트 구조

```
리워들/
├── src/
│   ├── components/        # React 컴포넌트
│   │   └── games/        # 게임 컴포넌트
│   ├── context/          # Context API
│   ├── data/             # 데이터 관리
│   ├── lib/              # 유틸리티 & 설정
│   │   ├── supabase.ts   # Supabase 클라이언트
│   │   └── dataMigration.ts  # 데이터 마이그레이션
│   └── pages/            # 페이지 컴포넌트
├── supabase_schema.sql   # 데이터베이스 스키마
├── MIGRATION_GUIDE.md    # 마이그레이션 가이드
├── TEST_CHECKLIST.md     # 테스트 체크리스트
└── ENV_SETUP.md          # 환경 변수 설정 가이드
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- `user_points` - 사용자별 총 포인트
- `point_history` - 포인트 적립/사용 내역
- `attendance` - 출석 체크 기록
- `game_plays` - 게임 플레이 내역
- `brands` - 브랜드/퀴즈 정보

## 🔒 보안

- Row Level Security (RLS) 적용
- 사용자는 자신의 데이터만 접근 가능
- Supabase Auth를 통한 안전한 인증
- 환경 변수를 통한 민감 정보 관리

## 🧪 테스트

테스트 가이드는 [TEST_CHECKLIST.md](./TEST_CHECKLIST.md)를 참고하세요.

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린팅
npm run lint
```

## 📱 주요 페이지

- `/` - 랜딩/로그인 페이지
- `/home` - 메인 홈 화면
- `/game/wordle` - 워들 게임
- `/game/apple` - 사과 게임
- `/attendance` - 출석 체크
- `/points-history` - 포인트 내역
- `/admin` - 관리자 대시보드

## 🎨 디자인 시스템

- **Primary Color**: `#ff6b6b` (빨강/핑크)
- **Font**: 시스템 폰트 (sans-serif)
- **반응형**: 모바일 우선 (max-width: 500px)

## 📈 향후 계획

- [ ] 포인트 사용처 개발 (쿠폰, 기프티콘 등)
- [ ] 실시간 리더보드
- [ ] 푸시 알림
- [ ] 더 많은 게임 추가
- [ ] 관리자 대시보드 고도화

## 🐛 버그 제보 & 기여

Issues와 Pull Requests를 환영합니다!

## 📄 라이선스

MIT License

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스를 사용했습니다:
- [Wordle](https://www.nytimes.com/games/wordle/index.html) - 게임 영감
- [Lucide Icons](https://lucide.dev/) - 아이콘
- [Framer Motion](https://www.framer.com/motion/) - 애니메이션

---

**Made with ❤️ by Rewardle Team**


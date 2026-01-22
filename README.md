# 리워들 (Rewardle) 🎮

> 게임으로 브랜드를 알리고, 포인트를 받는 리워드 플랫폼

## ✨ 주요 기능

### 🎯 게임
- **워들 게임**: 브랜드명을 맞추는 단어 추리 게임  
- **사과 게임**: 숫자 10을 만들어 글자를 모으는 퍼즐 게임  
- **일일 제한**: 하루 최대 10회 플레이

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

주요 테이블:
- `user_points` - 사용자 포인트
- `point_history` - 포인트 내역
- `attendance` - 출석 기록
- `game_plays` - 게임 플레이 내역
- `brands` - 브랜드/퀴즈 정보

## 📱 주요 페이지

- `/` - 로그인
- `/home` - 메인 홈
- `/game/wordle` - 워들 게임
- `/game/apple` - 사과 게임
- `/attendance` - 출석 체크
- `/points-history` - 포인트 내역
- `/admin` - 관리자 대시보드

## 📄 라이선스

MIT License

---

**Made with ❤️ by Rewardle Team**

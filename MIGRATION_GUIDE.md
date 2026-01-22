# 리워들 (Rewardle) - Supabase 마이그레이션 가이드

## 📋 개요

localStorage 기반에서 Supabase 데이터베이스로 전환하는 마이그레이션이 완료되었습니다.

## 🚀 주요 변경사항

### 1. 데이터 저장 방식 변경

#### 이전 (Before)
- 모든 데이터가 **localStorage**에만 저장
- 브라우저 캐시 삭제 시 데이터 손실
- 여러 기기에서 동기화 불가능

#### 이후 (After)
- **로그인 사용자**: Supabase 데이터베이스에 저장
- **게스트 사용자**: localStorage에 저장 (기존 방식 유지)
- **자동 마이그레이션**: 게스트 → 로그인 시 데이터 자동 이전

### 2. 새로운 테이블 구조

```
├── user_points        (사용자별 총 포인트)
├── point_history      (포인트 적립 내역)
├── attendance         (출석 체크 기록)
├── game_plays         (게임 플레이 내역)
└── brands             (브랜드/퀴즈 데이터)
```

## 📦 설정 방법

### 1. Supabase 프로젝트 설정

1. [Supabase 대시보드](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. **SQL Editor** 메뉴 선택
4. `supabase_schema.sql` 파일 내용 복사
5. SQL Editor에 붙여넣기 후 **RUN** 실행

### 2. 환경 변수 설정

`.env` 파일에 다음 내용 추가:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Google OAuth 설정

Supabase 대시보드:
1. **Authentication** → **Providers** → **Google**
2. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
3. Client ID, Client Secret 입력
4. Redirect URL 설정: `https://your-project.supabase.co/auth/v1/callback`

## 🔄 데이터 마이그레이션 플로우

### 게스트 사용자 → 로그인 사용자

```
1. 게스트로 앱 사용 (localStorage에 데이터 저장)
   ↓
2. Google 로그인 클릭
   ↓
3. 로그인 성공
   ↓
4. 자동으로 localStorage 데이터를 Supabase로 마이그레이션
   ↓
5. localStorage 데이터 정리
   ↓
6. 이후 모든 데이터는 Supabase에 저장
```

### 마이그레이션되는 데이터

- ✅ 총 포인트
- ✅ 포인트 내역 (최근 100개)
- ✅ 출석 기록
- ✅ 오늘의 게임 플레이 내역

## 📁 주요 파일 변경사항

### 새로 추가된 파일
- `src/lib/dataMigration.ts` - 데이터 마이그레이션 로직
- `supabase_schema.sql` - 데이터베이스 스키마

### 수정된 파일
- `src/context/PointsContext.tsx` - Supabase 연동
- `src/pages/LoginPage.tsx` - 로그인 후 자동 마이그레이션
- `src/pages/AttendancePage.tsx` - Supabase 출석 기록
- `src/pages/LandingPage.tsx` - 로그아웃 버튼 추가

## 🔐 보안 (Row Level Security)

모든 테이블에 RLS(Row Level Security) 정책이 적용되어 있습니다:

- 사용자는 **자신의 데이터만** 조회/수정 가능
- 브랜드 테이블은 **읽기 전용**
- 관리자 권한은 별도 설정 필요

## 🧪 테스트 방법

### 1. 게스트 모드 테스트
```
1. "비회원으로 먼저 둘러보기" 클릭
2. 게임 플레이 → 포인트 적립
3. 개발자 도구 → Application → localStorage 확인
```

### 2. 마이그레이션 테스트
```
1. 게스트로 게임 플레이
2. Google 로그인
3. Supabase 대시보드 → Table Editor 확인
4. 데이터가 정상적으로 이전되었는지 확인
```

### 3. 로그인 사용자 테스트
```
1. 로그인 상태에서 게임 플레이
2. 로그아웃 후 다시 로그인
3. 데이터가 유지되는지 확인
```

## 🐛 트러블슈팅

### Q: 로그인 후 데이터가 사라졌어요
A: 마이그레이션 실패일 수 있습니다. 브라우저 콘솔에서 에러 확인:
```javascript
console.log(localStorage.getItem('rewardle_points'))
```

### Q: RLS 에러가 발생해요
A: Supabase 대시보드에서 RLS 정책이 올바르게 설정되었는지 확인하세요.

### Q: 게스트 데이터를 복구할 수 있나요?
A: localStorage가 지워지지 않았다면 가능합니다. 로그인 시 자동으로 마이그레이션됩니다.

## 📊 데이터베이스 모니터링

Supabase 대시보드에서 실시간 확인 가능:

1. **Table Editor** - 데이터 조회/수정
2. **Database** → **Logs** - 쿼리 로그
3. **Authentication** → **Users** - 사용자 목록

## 🎯 다음 단계

- [ ] 관리자 대시보드에서 브랜드 추가/수정 기능
- [ ] 포인트 사용처 개발 (쿠폰, 리워드 등)
- [ ] 실시간 리더보드 추가
- [ ] 푸시 알림 연동

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. Supabase 프로젝트 상태
2. 환경 변수 설정
3. 브라우저 콘솔 에러 로그

---

**마이그레이션 완료!** 🎉

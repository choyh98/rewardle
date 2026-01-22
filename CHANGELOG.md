# 변경 이력 (Changelog)

## [2.0.0] - 2026-01-21

### 🚀 주요 변경사항 (Breaking Changes)

#### localStorage → Supabase 마이그레이션
- 모든 데이터 저장 로직을 Supabase 데이터베이스로 전환
- 게스트 사용자는 기존대로 localStorage 사용
- 로그인 사용자는 Supabase에 데이터 저장

### ✨ 새로운 기능

#### 인증 시스템
- Google OAuth 로그인 추가
- 게스트 모드 지원
- 자동 데이터 마이그레이션 (게스트 → 로그인)

#### 데이터 동기화
- 여러 기기에서 동일 계정 데이터 공유
- 실시간 포인트 업데이트
- 게임 플레이 기록 동기화
- 출석 체크 기록 동기화

#### 사용자 인터페이스
- 로그아웃 버튼 추가
- 게스트 사용자용 로그인 유도 배너
- 로딩 상태 개선

### 🔧 수정된 파일

#### 새로 추가된 파일
```
src/lib/dataMigration.ts         # 데이터 마이그레이션 로직
supabase_schema.sql              # 데이터베이스 스키마
MIGRATION_GUIDE.md               # 마이그레이션 가이드
TEST_CHECKLIST.md                # 테스트 체크리스트
ENV_SETUP.md                     # 환경 변수 설정 가이드
```

#### 수정된 파일
```
src/context/PointsContext.tsx    # Supabase 연동, 마이그레이션 로직
src/pages/LoginPage.tsx          # 자동 마이그레이션 추가
src/pages/AttendancePage.tsx     # Supabase 출석 기록
src/pages/LandingPage.tsx        # 로그아웃 버튼, 게스트 상태 표시
src/lib/supabase.ts              # 타입 정의 추가
README.md                        # 프로젝트 문서 업데이트
```

### 📊 데이터베이스 스키마

#### 새로운 테이블
- `user_points` - 사용자별 총 포인트
- `point_history` - 포인트 내역
- `attendance` - 출석 기록
- `game_plays` - 게임 플레이 기록
- `brands` - 브랜드 정보

#### RLS 정책
- 모든 테이블에 Row Level Security 적용
- 사용자는 자신의 데이터만 접근 가능

### 🔒 보안 개선

- Supabase RLS를 통한 데이터 보안
- 환경 변수를 통한 API 키 관리
- Google OAuth를 통한 안전한 인증

### 🐛 버그 수정

- 게임 플레이 횟수 카운트 정확도 개선
- 출석 체크 연속 일수 계산 오류 수정
- localStorage 데이터 손실 문제 해결

### ⚡ 성능 개선

- 브랜드 데이터 캐싱 (1시간)
- Supabase 쿼리 최적화
- 불필요한 리렌더링 방지

### 🎨 UI/UX 개선

- 로딩 상태 표시 개선
- 에러 메시지 명확화
- 게스트 사용자 안내 추가

## [1.0.0] - 2026-01-XX

### ✨ 초기 릴리즈

#### 기본 기능
- 워들 게임
- 사과 게임
- 포인트 시스템
- 출석 체크
- localStorage 기반 데이터 저장

---

## 마이그레이션 가이드

### v1.x → v2.0.0

기존 사용자 (v1.x)의 데이터는 자동으로 마이그레이션됩니다:

1. **게스트 사용자**
   - 기존 localStorage 데이터가 그대로 유지됩니다
   - 로그인 시 Supabase로 자동 마이그레이션

2. **새로운 설정 필요**
   - Supabase 프로젝트 생성
   - `.env` 파일에 환경 변수 추가
   - `supabase_schema.sql` 실행

자세한 내용은 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) 참고

## 호환성

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **브라우저**: Chrome, Firefox, Safari, Edge (최신 2개 버전)

## 알려진 이슈

- 출석 체크 연속 일수는 실제 날짜 기반으로만 테스트 가능
- 게스트 모드에서 브라우저 캐시 삭제 시 데이터 손실

## 다음 버전 계획 (v2.1.0)

- [ ] 포인트 사용처 추가 (쿠폰, 기프티콘)
- [ ] 실시간 리더보드
- [ ] 푸시 알림
- [ ] 관리자 대시보드 고도화
- [ ] 더 많은 게임 추가

# 리워들 전체 로직 브리핑

## 1. 앱 구조 & 라우팅

- **App.tsx**: `AuthProvider` → `PointsProvider` → `Router` → `Suspense`(lazy) → `Routes`
- **즉시 로드**: `LoginPage`, `LandingPage`
- **Lazy 로드**: `GamePage`, `AttendancePage`, `PointsHistoryPage`, `AdminDashboard`
- **공통**: `MigrationToast` (게스트→로그인 포인트 마이그레이션 안내)

---

## 2. 인증 (AuthContext)

### 2-1. 사용자 구분

- **로그인 사용자**: Supabase `session.user.id` → `user.id`, `user.isGuest = false`
- **게스트**: `localStorage.rewardle_guest_id` 없으면 `guest_${Date.now()}` 생성 후 저장 → `user.id`, `user.isGuest = true`

### 2-2. 로그인 시 (SIGNED_IN)

- `migrateGuestData(newUserId)` 호출
- **pointService.migrateGuestPoints(newUserId)**:
  - `user_points`에 해당 유저가 **이미 있으면** → 게스트 포인트 **버림**, localStorage만 정리
  - **신규 유저**면 → localStorage 포인트를 DB로 이전 후 localStorage 정리

### 2-3. 로그아웃 시

- `user`를 게스트로 전환 (새/기존 `rewardle_guest_id` 사용)

---

## 3. 포인트 & 게임 횟수 (PointsContext)

### 3-1. 데이터 소스

- **게스트**: `localStorage` (POINTS, HISTORY, DAILY_GAMES, GAME_HISTORY)
- **로그인**: Supabase (`user_points`, `point_history`, `game_plays`)

### 3-2. 로드 시점

- `user` 변경 시 `loadUserData()` 실행
  - 게스트 → `loadFromLocalStorage()`
  - 로그인 → `loadFromSupabase()` (실패 시 localStorage 폴백)

### 3-3. 일일 리셋 (useGameTimer)

- `nextResetTime`: 다음 날 **로컬 자정**
- `isNewDay`: 현재 시각 ≥ `nextResetTime`이면 true
- `isNewDay`일 때: `dailyGames` = 0, `gameHistory` 비움, 게스트면 localStorage도 갱신

### 3-4. 게임 횟수

- **상수**: `DAILY_GAME_LIMIT = 10` (constants)
- **계산**: `dailyGamesRemaining = 10 - dailyGames.count`
- **canPlayGame()**: 오늘 날짜가 같고 `dailyGames.count < 10`이면 true

### 3-5. 게임 완료 시 (recordGameCompletion)

- **로컬**: `dailyGames.count + 1`, `gameHistory`에 한 건 추가
- **게스트**: 위 값들을 localStorage에 저장
- **로그인**: `gameService.recordGameCompletion()` → RPC `start_game_session` + `complete_game_session` → DB `game_plays`에 저장

### 3-6. 오늘 플레이 조회 (로그인)

- **gameService.getTodayGamePlays(userId)**:
  - **로컬 “오늘 00:00”**을 `getStartOfTodayISO()`로 구해 ISO 문자열 생성
  - `game_plays`에서 `user_id = userId`, `created_at >= startOfToday` 조건으로 조회
  - `count`와 `history` 반환 → `dailyGames`, `gameHistory`에 반영

### 3-7. 포인트 추가 (addPoints)

- **게스트**: 로컬 state + localStorage 갱신
- **로그인**: `pointService.addPoints()` → RPC `secure_add_points` (일일 100P 한도 등 검증)

---

## 4. 브랜드 & 게임 매칭 (data/brands)

### 4-1. 브랜드 목록

- **fetchBrands()**: Supabase `brands` (is_active=true), 1시간 캐시
- Supabase row → `Brand` 형태로 변환 (mission_data / 레거시 placeQuiz 모두 처리)

### 4-2. 오늘 완료한 브랜드 (퀴즈 중복 방지)

- **localStorage**: `rewardle_completed_brands` = `{ date, ids: string[] }`
- 날짜가 바뀌면 ids 초기화
- 게임에서 포인트를 받으면 `markBrandAsCompleted(brandId)`로 해당 브랜드 id 추가

### 4-3. 기본 브랜드 선택 (getDefaultBrand)

- `fetchBrands()` 후 **오늘 완료한 브랜드 id 제외**
- **난이도** (Landing에서 선택한 값):
  - easy: 3~4글자
  - normal: 5글자
  - hard: 6글자 이상
- 남은 브랜드 중 **랜덤 1개** 반환, 없으면 null

### 4-4. getBrandById(id)

- `fetchBrands()` 후 id로 검색 (UUID/문자열 모두 가능)

---

## 5. 게임 페이지 (GamePage)

### 5-1. 진입 시

- **canPlayGame()** false면: 알림 후 `/home`으로 이동
- **getBrandById(brandId)** 로 브랜드 로드 (실패 시 알림 후 `/home`)
- `brandId`는 쿼리 `?brand=xxx`, 없으면 `aquagarden`

### 5-2. 게임 횟수 차감

- **게임 종료/홈으로 갈 때** `handleDeductPlay()` 한 번만 호출 (`hasRecorded` ref로 중복 방지)
- `recordGameCompletion(gameType, brand.id)` 호출 → 위 3-5 로직

### 5-3. 포인트 지급

- **handleComplete(earnedPoints)**:
  - earnedPoints > 0이면 `addPoints(earnedPoints, reason)` 호출
  - 동시에 `markBrandAsCompleted(brand.id)` 호출 (같은 브랜드 오늘 재선택 방지)

### 5-4. 게임 종류

- `type === 'wordle'` → WordleGame
- `type === 'apple'` → AppleGame  
- `type === 'shooting'` → ShootingWordle  
- 각 게임: 정답/클리어 시 5P, 추가 미션(퀴즈/길찾기) 완료 시 추가 5P

---

## 6. 미션 (퀴즈 / 길찾기)

### 6-1. 미션 데이터 (Brand)

- **mission.type**: `'quiz'` | `'walking'`
- **quiz**: question, answer, bonusPoints(5)
- **walking**: seoKeyword, startPoint, walkingTime, bicycleTime, quizQuestion, correctAnswer 등

### 6-2. 게임 클리어 후

- **퀴즈 미션**: MissionModal → 정답 시 `addPoints(5, …)` + (선택) missionService.completeMission
- **길찾기 미션**: WalkingMissionPage → 네이버 길찾기, 예상 시간 입력 후 정답 시 `addPoints(5, …)` + (선택) missionService.completeMission
- 길찾기 정답: 도보/자전거 중 **랜덤 1종**만 사용, ±2분 허용

---

## 7. 출석 (AttendancePage / attendanceService)

- **checkIn(userId)**: RPC `secure_check_attendance` 호출
- 서버에서 연속 출석 계산 후 포인트 지급
- **게스트**: 출석 데이터는 localStorage 등 로컬 처리 (서비스 코드는 동일 인터페이스)

---

## 8. 포인트 내역 & 교환 (PointsHistoryPage)

- **history**: PointsContext의 `history` (로그인 시 point_history, 게스트 시 localStorage)
- **페이지네이션**: 10개 단위로 페이지 분할
- **교환**: exchangeService로 온누리상품권 신청 (이름/전화번호 + 포인트 차감)

---

## 9. 보안 & RPC 요약

- **포인트**: `secure_add_points` (일일 100P 한도)
- **게임**: `start_game_session` → `complete_game_session` (일일 10회, 10초~5분 검증) → `game_plays` insert
- **출석**: `secure_check_attendance`
- **미션 완료**: `complete_mission`
- **직접 테이블 INSERT/UPDATE**는 RLS로 막고, 위 RPC로만 변경

---

## 10. 상수 요약 (data/constants)

- **DAILY_GAME_LIMIT**: 10
- **ATTENDANCE_MISSION_GOAL**: 3
- **STORAGE_KEYS**: rewardle_* 키들 (points, history, daily_games, game_history, completed_brands, guest_id, difficulty 등)
- **TIMERS**: DAILY_RESET_HOUR(0), TOOLTIP_DURATION(2000)

---

## 11. 랜딩 페이지 (LandingPage)

- **난이도**: easy / normal / hard → localStorage + getDefaultBrand(difficulty)에 반영
- **게임 카드 클릭**: `/game/wordle?brand=${defaultBrand.id}` 등으로 이동 (defaultBrand 없으면 비활성/안내)
- **다음 게임 가능까지**: nextResetTime까지 남은 시간 표시 (HH:MM:SS)
- **온보딩**: 최초 1회 `OnboardingTutorial`, 완료 시 `rewardle_onboarding_completed` 저장
- **신고/문의**: 모달에서 mailto 링크로 이메일 발송

---

이 문서는 현재 코드 기준 전체 로직을 한 번에 보기 위한 브리핑용입니다.  
세부 수치는 constants / Supabase RPC 정의와 동기화해 두었습니다.

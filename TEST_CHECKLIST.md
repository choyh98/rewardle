# 🧪 마이그레이션 테스트 체크리스트

## 📋 사전 준비

- [ ] Supabase 프로젝트 생성 완료
- [ ] `supabase_schema.sql` 실행 완료
- [ ] 환경 변수 설정 완료 (`.env`)
- [ ] Google OAuth 설정 완료

## 🎮 테스트 시나리오

### 1️⃣ 게스트 모드 테스트

**목표**: localStorage에 데이터가 정상적으로 저장되는지 확인

1. [ ] "비회원으로 먼저 둘러보기" 클릭
2. [ ] 사과 게임 플레이 → 포인트 획득
3. [ ] 워들 게임 플레이 → 포인트 획득
4. [ ] 총 3회 게임 플레이 완료
5. [ ] 출석 체크 완료 → 2P 획득
6. [ ] 적립 내역 확인

**확인 사항**:
```javascript
// 개발자 도구 Console에서 확인
console.log('Points:', localStorage.getItem('rewardle_points'));
console.log('History:', localStorage.getItem('rewardle_history'));
console.log('Daily Games:', localStorage.getItem('rewardle_daily_games'));
console.log('Guest ID:', localStorage.getItem('rewardle_guest_id'));
```

### 2️⃣ 로그인 & 마이그레이션 테스트

**목표**: 게스트 데이터가 Supabase로 자동 마이그레이션되는지 확인

1. [ ] 게스트 모드에서 포인트 적립 (10P 이상)
2. [ ] Google 로그인 클릭
3. [ ] 로그인 성공 후 `/home`으로 리다이렉트
4. [ ] 포인트가 유지되는지 확인
5. [ ] 적립 내역이 유지되는지 확인

**확인 사항**:
```sql
-- Supabase SQL Editor에서 확인
SELECT * FROM user_points ORDER BY created_at DESC;
SELECT * FROM point_history ORDER BY created_at DESC LIMIT 10;
SELECT * FROM attendance ORDER BY check_date DESC;
SELECT * FROM game_plays ORDER BY created_at DESC LIMIT 10;
```

**브라우저 Console 확인**:
```javascript
// localStorage가 정리되었는지 확인
console.log('Guest ID:', localStorage.getItem('rewardle_guest_id')); // null이어야 함
console.log('Points:', localStorage.getItem('rewardle_points')); // null이어야 함
```

### 3️⃣ 로그인 사용자 데이터 동기화 테스트

**목표**: Supabase 데이터가 정상적으로 저장/로드되는지 확인

1. [ ] 로그인 상태에서 게임 플레이 → 포인트 획득
2. [ ] 로그아웃
3. [ ] 다시 로그인
4. [ ] 포인트와 내역이 그대로 유지되는지 확인

**확인 사항**:
- 포인트가 유지됨
- 적립 내역이 유지됨
- 오늘의 게임 플레이 횟수가 정확함

### 4️⃣ 여러 기기 동기화 테스트

**목표**: 동일 계정으로 여러 기기에서 데이터 공유 확인

1. [ ] 기기 A에서 로그인 → 게임 플레이
2. [ ] 기기 B에서 동일 계정 로그인
3. [ ] 기기 A의 데이터가 기기 B에 표시되는지 확인

### 5️⃣ 일일 제한 테스트

**목표**: 게임 플레이 횟수 제한이 정상 작동하는지 확인

1. [ ] 게임을 10회 플레이
2. [ ] "오늘의 게임 참여 횟수를 모두 사용했습니다" 알림 표시
3. [ ] 게임 참여 불가능 상태 확인

**Supabase 확인**:
```sql
SELECT user_id, game_type, COUNT(*) as play_count
FROM game_plays
WHERE created_at >= CURRENT_DATE
GROUP BY user_id, game_type;
```

### 6️⃣ 출석 체크 테스트

**목표**: 출석 기록이 정상적으로 저장되는지 확인

#### 게스트 사용자
1. [ ] 게임 3회 플레이
2. [ ] 출석 체크 → 2P 획득
3. [ ] localStorage 확인:
```javascript
console.log('Last Check:', localStorage.getItem('rewardle_last_check'));
console.log('Streak:', localStorage.getItem('rewardle_attendance_streak'));
```

#### 로그인 사용자
1. [ ] 게임 3회 플레이
2. [ ] 출석 체크 → 2P 획득
3. [ ] Supabase 확인:
```sql
SELECT * FROM attendance 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY check_date DESC;
```

### 7️⃣ 연속 출석 보너스 테스트

**목표**: 연속 출석 시 보너스 포인트가 정확히 지급되는지 확인

⚠️ **참고**: 실제 날짜를 기반으로 하므로 완전한 테스트가 어려움

테스트 방법 (시뮬레이션):
1. [ ] 1일차: 출석 → 2P
2. [ ] 2일차: 출석 → 2P
3. [ ] 3일차: 출석 → 3P (2P + 1P 보너스)
4. [ ] 7일차: 출석 → 5P (2P + 3P 보너스)
5. [ ] 10일차: 출석 → 7P (2P + 5P 보너스)
6. [ ] 30일차: 출석 → 22P (2P + 20P 보너스)

## 🐛 에러 시나리오 테스트

### 네트워크 오류
1. [ ] 개발자 도구 → Network → Offline 체크
2. [ ] 게임 플레이 시도
3. [ ] 에러 처리 확인

### Supabase 연결 실패
1. [ ] 환경 변수에 잘못된 값 입력
2. [ ] 앱 실행
3. [ ] localStorage 폴백 작동 확인

### RLS 정책 오류
1. [ ] Supabase에서 RLS 정책 비활성화
2. [ ] 데이터 접근 시도
3. [ ] 에러 메시지 확인

## ✅ 최종 확인

- [ ] 게스트 모드 정상 작동
- [ ] 로그인 정상 작동
- [ ] 마이그레이션 정상 작동
- [ ] 데이터 동기화 정상 작동
- [ ] 일일 제한 정상 작동
- [ ] 출석 체크 정상 작동
- [ ] 로그아웃 정상 작동
- [ ] 여러 기기 동기화 정상 작동

## 📊 성능 확인

### 로딩 속도
- [ ] 초기 로딩 3초 이내
- [ ] 페이지 전환 1초 이내
- [ ] Supabase 쿼리 500ms 이내

### 캐싱 확인
```javascript
// brands.ts의 캐시 동작 확인
// 1시간 동안 Supabase 재호출 없어야 함
```

## 🔍 디버깅 팁

### Console 로그 확인
```javascript
// 마이그레이션 로그
// "🔄 Starting data migration to Supabase..."
// "✅ Points migrated: X"
// "✅ History migrated: X records"
// "✅ Migration completed successfully!"

// 캐시 로그
// "✅ Using cached brands data"
// "🔄 Fetching fresh brands data from Supabase"
```

### Supabase 로그 확인
1. Supabase Dashboard → Logs
2. API 호출 내역 확인
3. 에러 로그 확인

## 📝 테스트 완료 후

- [ ] 모든 테스트 통과
- [ ] 에러 없이 정상 작동
- [ ] 배포 준비 완료

---

**문제 발생 시**: `MIGRATION_GUIDE.md`의 트러블슈팅 섹션 참고

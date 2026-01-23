# 🗄️ Supabase 데이터베이스 설정 가이드

## 빠른 시작 (Quick Start)

### 1️⃣ SQL 파일 실행

1. **Supabase Dashboard** 접속
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor** 열기
   - 왼쪽 메뉴 → `SQL Editor` 클릭

3. **SQL 실행**
   - `supabase_complete_schema.sql` 파일 내용 전체 복사
   - SQL Editor에 붙여넣기
   - `Run` 버튼 클릭 ✅

---

## 📋 포함된 내용

### 테이블 (5개)
1. **brands** - 브랜드 정보
   - 워들 정답, 사과게임 단어, 슈팅워들 정답
   - 플레이스 퀴즈 정보
   - hint_image (선택사항, NULL 허용)

2. **user_points** - 사용자 포인트

3. **point_history** - 포인트 내역

4. **attendance** - 출석 체크 기록

5. **game_plays** - 게임 플레이 기록
   - game_type: 'wordle', 'apple', 'shooting' 지원

### RLS 정책
- ✅ 게스트 사용자 (`guest_*`) 지원
- ✅ 로그인 사용자 자신의 데이터만 접근
- ✅ 브랜드는 모든 사용자가 조회 가능

### 인덱스
- 성능 최적화를 위한 인덱스 자동 생성

---

## 🎯 다음 단계

### 1. 실제 브랜드 데이터 추가

**Supabase Dashboard → Table Editor → brands**

```sql
INSERT INTO brands (
    name, 
    wordle_answer, 
    apple_game_word, 
    shooting_wordle_answer, 
    hint_image, 
    place_quiz_question, 
    place_quiz_answer, 
    place_url
)
VALUES (
    '스타벅스',
    ARRAY['스', '타', '벅', '스'],
    '스타벅스',
    '스타벅스',
    'https://example.com/starbucks-hint.jpg',  -- 또는 NULL
    '스타벅스 강남점은 몇 층에 있나요?',
    '3',
    'https://place.map.kakao.com/12345'  -- 실제 카카오맵 URL
);
```

### 2. 환경 변수 확인

`.env` 파일에 Supabase 정보가 올바르게 설정되어 있는지 확인:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 앱 테스트

```bash
npm run dev
```

- 게임 플레이 → 포인트 지급 확인
- 출석 체크 → 연속 일수 확인
- Supabase Dashboard에서 데이터 저장 확인

---

## 🔧 문제 해결

### RLS 정책 오류

```sql
-- RLS 정책 확인
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- 특정 테이블의 정책만 확인
SELECT * FROM pg_policies WHERE tablename = 'user_points';
```

### 게스트 사용자 데이터 확인

```sql
-- 게스트 사용자 포인트 확인
SELECT * FROM user_points WHERE user_id LIKE 'guest_%';

-- 게스트 사용자 게임 기록
SELECT * FROM game_plays WHERE user_id LIKE 'guest_%';
```

### 데이터 전체 삭제 (리셋)

```sql
-- 모든 데이터 삭제 (테이블 구조는 유지)
TRUNCATE TABLE game_plays CASCADE;
TRUNCATE TABLE attendance CASCADE;
TRUNCATE TABLE point_history CASCADE;
TRUNCATE TABLE user_points CASCADE;
-- brands 테이블은 유지 (삭제하려면 주석 해제)
-- TRUNCATE TABLE brands CASCADE;
```

---

## 📊 데이터 확인 쿼리

### 활성 브랜드 목록
```sql
SELECT name, is_active FROM brands ORDER BY created_at DESC;
```

### 오늘 게임 플레이 통계
```sql
SELECT 
    game_type, 
    COUNT(*) as play_count 
FROM game_plays 
WHERE created_at >= CURRENT_DATE 
GROUP BY game_type;
```

### 사용자별 포인트 순위
```sql
SELECT 
    user_id, 
    points 
FROM user_points 
ORDER BY points DESC 
LIMIT 10;
```

---

## ⚠️ 중요 참고사항

1. **데이터 백업**
   - `supabase_complete_schema.sql`을 실행하면 기존 데이터가 모두 삭제됩니다
   - 기존 데이터가 있다면 먼저 백업하세요

2. **place_url 설정**
   - 카카오맵 플레이스 URL을 정확하게 입력하세요
   - 예: `https://place.map.kakao.com/실제ID`

3. **hint_image**
   - 힌트 이미지가 필요 없으면 `NULL`로 설정 가능
   - 이미지 URL은 공개 접근 가능한 URL이어야 함

4. **game_type**
   - 'wordle', 'apple', 'shooting' 세 가지만 허용
   - 다른 값은 CHECK 제약으로 거부됨

---

## 🚀 완료!

이제 Supabase 데이터베이스가 완전히 설정되었습니다.

**다음 작업:**
- [ ] 실제 브랜드 데이터 추가
- [ ] 환경 변수 확인
- [ ] 앱에서 게임 플레이 테스트
- [ ] 포인트 지급 확인
- [ ] 출석 체크 테스트

문제가 발생하면 `QA_TEST_GUIDE.md`를 참고하세요! 📖

# 🚀 배포 가이드

## 최근 수정사항 (2026-01-22)

### 수정된 버그들
1. ✅ Supabase 테이블에 게임 플레이 기록이 저장되지 않던 문제 수정
2. ✅ 게임 완료 후 추가 미션 팝업이 표시되지 않던 문제 수정
3. ✅ RLS 정책 개선 (게스트 사용자 지원)

### 변경된 파일
- `src/context/PointsContext.tsx`
- `src/pages/GamePage.tsx`
- `src/components/games/AppleGame.tsx`
- `supabase_schema.sql`

---

## 📋 배포 전 체크리스트

### 1. Supabase 데이터베이스 업데이트

Supabase SQL Editor에서 다음 SQL을 실행하여 RLS 정책을 업데이트하세요:

```sql
-- ============================================
-- RLS 정책 업데이트 (게스트 사용자 지원)
-- ============================================

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own points" ON user_points;
DROP POLICY IF EXISTS "Users can insert own points" ON user_points;
DROP POLICY IF EXISTS "Users can update own points" ON user_points;
DROP POLICY IF EXISTS "Users can view own history" ON point_history;
DROP POLICY IF EXISTS "Users can insert own history" ON point_history;
DROP POLICY IF EXISTS "Users can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Users can insert own attendance" ON attendance;
DROP POLICY IF EXISTS "Users can view own game plays" ON game_plays;
DROP POLICY IF EXISTS "Users can insert own game plays" ON game_plays;

-- 2. user_points 새 정책
CREATE POLICY "Users can view own points"
    ON user_points FOR SELECT
    USING (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

CREATE POLICY "Users can insert own points"
    ON user_points FOR INSERT
    WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

CREATE POLICY "Users can update own points"
    ON user_points FOR UPDATE
    USING (auth.uid()::text = user_id OR user_id LIKE 'guest_%')
    WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

-- 3. point_history 새 정책
CREATE POLICY "Users can view own history"
    ON point_history FOR SELECT
    USING (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

CREATE POLICY "Users can insert own history"
    ON point_history FOR INSERT
    WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

-- 4. attendance 새 정책
CREATE POLICY "Users can view own attendance"
    ON attendance FOR SELECT
    USING (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

CREATE POLICY "Users can insert own attendance"
    ON attendance FOR INSERT
    WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

-- 5. game_plays 새 정책
CREATE POLICY "Users can view own game plays"
    ON game_plays FOR SELECT
    USING (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

CREATE POLICY "Users can insert own game plays"
    ON game_plays FOR INSERT
    WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'guest_%');
```

### 2. Git 커밋 및 푸시

터미널(CMD 또는 Git Bash)에서 실행:

```bash
# 변경사항 확인
git status

# 모든 변경사항 스테이징
git add .

# 커밋 생성
git commit -m "fix: Supabase 데이터 저장 및 게임 완료 팝업 버그 수정

- brand_id를 recordGameCompletion에 전달하여 game_plays 테이블에 정상 저장
- 사과 게임 완료 시 중복 처리 방지
- RLS 정책 개선 (게스트 사용자 지원)"

# 원격 저장소에 푸시
git push origin main
```

### 3. Vercel 배포

#### 방법 1: Vercel CLI 사용

```bash
# Vercel CLI 설치 (처음 한 번만)
npm install -g vercel

# 배포
vercel --prod
```

#### 방법 2: Vercel 대시보드 사용

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. "Deployments" 탭에서 자동 배포 확인
   - GitHub 연동 시 `git push` 후 자동 배포됨
4. 배포 완료 확인

---

## ✅ 배포 후 테스트

### 1. 기본 기능 테스트
- [ ] 로그인 (Google OAuth)
- [ ] 게스트 모드
- [ ] 워들 게임 플레이
- [ ] 사과 게임 플레이

### 2. 버그 수정 확인
- [ ] 게임 10회 플레이 후 Supabase `game_plays` 테이블 확인
  - 로그인 사용자: 10개의 레코드가 생성되어야 함
  - 게스트 사용자: localStorage에 저장됨
  
- [ ] **중요!** 게임 참여 횟수가 1회 남았을 때:
  1. 사과 게임 시작
  2. 글자를 모두 수집하여 게임 완료
  3. "정답입니다! 5포인트가 적립되었습니다" 팝업 확인
  4. "추가미션하고 5P 더 받기" 버튼 클릭
  5. 추가 미션 팝업이 정상적으로 표시되는지 확인

### 3. Supabase 테이블 확인
로그인 사용자로 테스트 후 다음 테이블 확인:
- `user_points` - 포인트 누적
- `point_history` - 포인트 내역
- `game_plays` - 게임 플레이 기록 (★ 이전에 비어있던 테이블)
- `attendance` - 출석 기록

---

## 🔧 문제 해결

### 배포 후에도 데이터가 저장되지 않는다면?

1. **Supabase RLS 정책 확인**
   - Supabase 대시보드 → Authentication → Policies
   - 위의 SQL이 정상 실행되었는지 확인

2. **브라우저 캐시 삭제**
   - F12 → Application → Clear storage
   - 페이지 새로고침 (Ctrl + Shift + R)

3. **환경 변수 확인**
   - Vercel 대시보드 → Settings → Environment Variables
   - `VITE_SUPABASE_URL` 확인
   - `VITE_SUPABASE_ANON_KEY` 확인

4. **브라우저 콘솔 확인**
   - F12 → Console 탭
   - 에러 메시지 확인

### 게임 완료 팝업이 안 뜨는 경우

1. 브라우저 캐시 완전 삭제
2. 시크릿 모드에서 테스트
3. F12 콘솔에서 에러 확인

---

## 📞 지원

문제가 지속되면 다음 정보와 함께 문의:
- 브라우저 콘솔 에러 메시지
- Supabase 테이블 스크린샷
- 재현 방법

---

**배포 완료!** 🎉

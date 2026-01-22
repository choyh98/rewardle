-- ============================================
-- 리워들 RLS 정책 업데이트
-- 실행 날짜: 2026-01-22
-- ============================================
-- 이 SQL을 Supabase SQL Editor에서 실행하세요
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

-- ============================================
-- 완료!
-- ============================================
-- 정책이 성공적으로 업데이트되었습니다.
-- 이제 앱에서 게임 플레이 기록이 정상적으로 저장됩니다.

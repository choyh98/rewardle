-- ============================================
-- RLS 정책 수정 (임시 - 모든 로그인 사용자 접근 허용)
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own points" ON user_points;
DROP POLICY IF EXISTS "Users can insert own points" ON user_points;
DROP POLICY IF EXISTS "Users can update own points" ON user_points;

DROP POLICY IF EXISTS "Users can view own history" ON point_history;
DROP POLICY IF EXISTS "Users can insert own history" ON point_history;

DROP POLICY IF EXISTS "Users can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Users can insert own attendance" ON attendance;

DROP POLICY IF EXISTS "Users can view own game plays" ON game_plays;
DROP POLICY IF EXISTS "Users can insert own game plays" ON game_plays;

-- ============================================
-- 새로운 정책 (인증된 사용자면 모두 접근 가능)
-- ============================================

-- user_points: 인증된 사용자 모두 접근 가능
CREATE POLICY "Authenticated users can view points"
    ON user_points FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Authenticated users can insert points"
    ON user_points FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update points"
    ON user_points FOR UPDATE
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- point_history: 인증된 사용자 모두 접근 가능
CREATE POLICY "Authenticated users can view history"
    ON point_history FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Authenticated users can insert history"
    ON point_history FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- attendance: 인증된 사용자 모두 접근 가능
CREATE POLICY "Authenticated users can view attendance"
    ON attendance FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Authenticated users can insert attendance"
    ON attendance FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- game_plays: 인증된 사용자 모두 접근 가능
CREATE POLICY "Authenticated users can view game plays"
    ON game_plays FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Authenticated users can insert game plays"
    ON game_plays FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- ============================================
-- 완료!
-- ============================================
-- Supabase Dashboard → SQL Editor에서 이 파일을 실행하세요.

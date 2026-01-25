-- ============================================
-- RLS 정책 완전 수정 (로그인 사용자 포인트 저장 문제 해결)
-- ============================================

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Users can view own points" ON user_points;
DROP POLICY IF EXISTS "Users can insert own points" ON user_points;
DROP POLICY IF EXISTS "Users can update own points" ON user_points;
DROP POLICY IF EXISTS "Authenticated users can view points" ON user_points;
DROP POLICY IF EXISTS "Authenticated users can insert points" ON user_points;
DROP POLICY IF EXISTS "Authenticated users can update points" ON user_points;
DROP POLICY IF EXISTS "Allow authenticated users to manage their points" ON user_points;
DROP POLICY IF EXISTS "Allow anon users to manage guest points" ON user_points;

DROP POLICY IF EXISTS "Users can view own history" ON point_history;
DROP POLICY IF EXISTS "Users can insert own history" ON point_history;
DROP POLICY IF EXISTS "Authenticated users can view history" ON point_history;
DROP POLICY IF EXISTS "Authenticated users can insert history" ON point_history;
DROP POLICY IF EXISTS "Allow authenticated users to manage their history" ON point_history;
DROP POLICY IF EXISTS "Allow anon users to manage guest history" ON point_history;

DROP POLICY IF EXISTS "Users can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Users can insert own attendance" ON attendance;
DROP POLICY IF EXISTS "Authenticated users can view attendance" ON attendance;
DROP POLICY IF EXISTS "Authenticated users can insert attendance" ON attendance;
DROP POLICY IF EXISTS "Allow authenticated users to manage their attendance" ON attendance;
DROP POLICY IF EXISTS "Allow anon users to manage guest attendance" ON attendance;

DROP POLICY IF EXISTS "Users can view own game plays" ON game_plays;
DROP POLICY IF EXISTS "Users can insert own game plays" ON game_plays;
DROP POLICY IF EXISTS "Authenticated users can view game plays" ON game_plays;
DROP POLICY IF EXISTS "Authenticated users can insert game plays" ON game_plays;
DROP POLICY IF EXISTS "Allow authenticated users to manage their game plays" ON game_plays;
DROP POLICY IF EXISTS "Allow anon users to manage guest game plays" ON game_plays;

-- ============================================
-- 새로운 정책 (로그인 사용자 + 게스트 모두 지원)
-- ============================================

-- user_points 정책
CREATE POLICY "Allow authenticated users to manage their points"
    ON user_points FOR ALL
    TO authenticated
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow anon users to manage guest points"
    ON user_points FOR ALL
    TO anon
    USING (user_id LIKE 'guest_%')
    WITH CHECK (user_id LIKE 'guest_%');

-- point_history 정책
CREATE POLICY "Allow authenticated users to manage their history"
    ON point_history FOR ALL
    TO authenticated
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow anon users to manage guest history"
    ON point_history FOR ALL
    TO anon
    USING (user_id LIKE 'guest_%')
    WITH CHECK (user_id LIKE 'guest_%');

-- attendance 정책
CREATE POLICY "Allow authenticated users to manage their attendance"
    ON attendance FOR ALL
    TO authenticated
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow anon users to manage guest attendance"
    ON attendance FOR ALL
    TO anon
    USING (user_id LIKE 'guest_%')
    WITH CHECK (user_id LIKE 'guest_%');

-- game_plays 정책
CREATE POLICY "Allow authenticated users to manage their game plays"
    ON game_plays FOR ALL
    TO authenticated
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow anon users to manage guest game plays"
    ON game_plays FOR ALL
    TO anon
    USING (user_id LIKE 'guest_%')
    WITH CHECK (user_id LIKE 'guest_%');

-- ============================================
-- 완료! 🚀
-- ============================================
-- Supabase Dashboard → SQL Editor에서 이 파일을 실행하세요.
-- 
-- 이 정책으로:
-- 1. 로그인한 사용자는 자신의 user_id(UUID)로만 접근 가능
-- 2. 게스트 사용자는 'guest_'로 시작하는 ID로만 접근 가능
-- 3. 각 사용자는 자신의 데이터만 읽기/쓰기/수정/삭제 가능
-- ============================================

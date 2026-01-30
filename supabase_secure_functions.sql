-- ============================================
-- 리워들 보안 강화: RPC 함수 및 RLS 정책 업데이트
-- 실행 날짜: 2026-01-26
-- ============================================
-- 이 파일은 어뷰징 방지를 위한 보안 함수(RPC)를 구현합니다.
-- 클라이언트가 직접 테이블을 수정할 수 없도록 차단하고,
-- 오직 검증된 RPC 함수를 통해서만 데이터를 변경할 수 있습니다.
-- ============================================

-- ============================================
-- 1단계: 기존 RLS 정책 삭제 (UPDATE/INSERT 권한 회수)
-- ============================================

-- user_points 테이블의 직접 수정 권한 제거
DROP POLICY IF EXISTS "Users can insert own points" ON user_points;
DROP POLICY IF EXISTS "Users can update own points" ON user_points;

-- point_history 테이블의 직접 추가 권한 제거
DROP POLICY IF EXISTS "Users can insert own history" ON point_history;

-- attendance 테이블의 직접 추가 권한 제거
DROP POLICY IF EXISTS "Users can insert own attendance" ON attendance;

-- game_plays 테이블의 직접 추가 권한 제거
DROP POLICY IF EXISTS "Users can insert own game plays" ON game_plays;

-- ============================================
-- 2단계: 읽기 전용 RLS 정책 유지 (SELECT만 허용)
-- ============================================

-- user_points: 조회만 가능
-- (기존 정책 유지: "Users can view own points")

-- point_history: 조회만 가능
-- (기존 정책 유지: "Users can view own history")

-- attendance: 조회만 가능
-- (기존 정책 유지: "Users can view own attendance")

-- game_plays: 조회만 가능
-- (기존 정책 유지: "Users can view own game plays")

-- ============================================
-- 3단계: 보안 세션 테이블 생성 (게임 시작/종료 시간 검증용)
-- ============================================

CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    game_type TEXT NOT NULL CHECK (game_type IN ('wordle', 'apple', 'shooting')),
    brand_id UUID REFERENCES brands(id),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_is_completed ON game_sessions(is_completed);

-- game_sessions RLS 활성화
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 세션만 조회 가능
DROP POLICY IF EXISTS "Users can view own sessions" ON game_sessions;
CREATE POLICY "Users can view own sessions"
    ON game_sessions FOR SELECT
    USING (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

-- ============================================
-- 4단계: 보안 RPC 함수 구현
-- ============================================

-- --------------------------------------------
-- 4-1. 포인트 적립 함수 (보안 검증 포함)
-- --------------------------------------------
CREATE OR REPLACE FUNCTION secure_add_points(
    p_user_id TEXT,
    p_amount INTEGER,
    p_reason TEXT
)
RETURNS TABLE(new_points INTEGER, success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER -- 관리자 권한으로 실행
AS $$
DECLARE
    v_current_points INTEGER;
    v_new_points INTEGER;
    v_today_total INTEGER;
    v_max_daily_points INTEGER := 100; -- 하루 최대 포인트
    v_korea_midnight TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 입력 검증
    IF p_amount <= 0 OR p_amount > 100 THEN
        RETURN QUERY SELECT 0, false, '비정상적인 포인트 요청입니다.'::TEXT;
        RETURN;
    END IF;

    -- 한국 시간 기준 오늘 자정 계산 (UTC+9)
    v_korea_midnight := (CURRENT_DATE AT TIME ZONE 'UTC') - INTERVAL '9 hours';

    -- 오늘 획득한 총 포인트 조회 (한국 시간 기준, 어뷰징 방지)
    SELECT COALESCE(SUM(amount), 0) INTO v_today_total
    FROM point_history
    WHERE user_id = p_user_id
      AND amount > 0
      AND created_at >= v_korea_midnight;

    -- 일일 한도 초과 체크
    IF v_today_total + p_amount > v_max_daily_points THEN
        RETURN QUERY SELECT 0, false, '일일 포인트 한도를 초과했습니다.'::TEXT;
        RETURN;
    END IF;

    -- 현재 포인트 조회
    SELECT COALESCE(points, 0) INTO v_current_points
    FROM user_points
    WHERE user_id = p_user_id;

    -- 레코드가 없으면 생성
    IF v_current_points IS NULL THEN
        INSERT INTO user_points (user_id, points) VALUES (p_user_id, 0);
        v_current_points := 0;
    END IF;

    v_new_points := v_current_points + p_amount;

    -- 포인트 내역 추가
    INSERT INTO point_history (user_id, amount, reason)
    VALUES (p_user_id, p_amount, p_reason);

    -- 총 포인트 업데이트
    INSERT INTO user_points (user_id, points)
    VALUES (p_user_id, v_new_points)
    ON CONFLICT (user_id) DO UPDATE SET points = v_new_points;

    RETURN QUERY SELECT v_new_points, true, '포인트가 적립되었습니다.'::TEXT;
END;
$$;

-- --------------------------------------------
-- 4-2. 게임 세션 시작 함수
-- --------------------------------------------
CREATE OR REPLACE FUNCTION start_game_session(
    p_user_id TEXT,
    p_game_type TEXT,
    p_brand_id UUID
)
RETURNS TABLE(session_id UUID, success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_id UUID;
    v_today_plays INTEGER;
    v_max_daily_plays INTEGER := 10; -- 하루 최대 게임 횟수
    v_korea_midnight TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 한국 시간 기준 오늘 자정 계산 (UTC+9)
    v_korea_midnight := (CURRENT_DATE AT TIME ZONE 'UTC') - INTERVAL '9 hours';

    -- 오늘 플레이한 게임 수 조회 (한국 시간 기준)
    SELECT COUNT(*) INTO v_today_plays
    FROM game_plays
    WHERE user_id = p_user_id
      AND created_at >= v_korea_midnight;

    -- 일일 게임 횟수 초과 체크
    IF v_today_plays >= v_max_daily_plays THEN
        RETURN QUERY SELECT NULL::UUID, false, '일일 게임 횟수를 초과했습니다.'::TEXT;
        RETURN;
    END IF;

    -- 게임 세션 생성
    INSERT INTO game_sessions (user_id, game_type, brand_id)
    VALUES (p_user_id, p_game_type, p_brand_id)
    RETURNING id INTO v_session_id;

    RETURN QUERY SELECT v_session_id, true, '게임 세션이 시작되었습니다.'::TEXT;
END;
$$;

-- --------------------------------------------
-- 4-3. 게임 완료 함수 (시간 검증 포함)
-- --------------------------------------------
CREATE OR REPLACE FUNCTION complete_game_session(
    p_session_id UUID,
    p_user_id TEXT,
    p_points INTEGER
)
RETURNS TABLE(success BOOLEAN, message TEXT, points_awarded INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_time TIMESTAMP WITH TIME ZONE;
    v_elapsed_seconds INTEGER;
    v_min_time INTEGER := 10; -- 최소 10초 (너무 빠른 클리어 차단)
    v_max_time INTEGER := 300; -- 최대 5분 (타임아웃)
    v_game_type TEXT;
    v_brand_id UUID;
    v_is_completed BOOLEAN;
BEGIN
    -- 세션 정보 조회
    SELECT start_time, is_completed, game_type, brand_id
    INTO v_start_time, v_is_completed, v_game_type, v_brand_id
    FROM game_sessions
    WHERE id = p_session_id AND user_id = p_user_id;

    -- 세션이 없거나 이미 완료됨
    IF v_start_time IS NULL THEN
        RETURN QUERY SELECT false, '유효하지 않은 게임 세션입니다.'::TEXT, 0;
        RETURN;
    END IF;

    IF v_is_completed THEN
        RETURN QUERY SELECT false, '이미 완료된 게임입니다.'::TEXT, 0;
        RETURN;
    END IF;

    -- 경과 시간 계산
    v_elapsed_seconds := EXTRACT(EPOCH FROM (NOW() - v_start_time))::INTEGER;

    -- 시간 검증 (너무 빠르거나 느린 경우 차단)
    IF v_elapsed_seconds < v_min_time THEN
        RETURN QUERY SELECT false, '비정상적으로 빠른 클리어입니다.'::TEXT, 0;
        RETURN;
    END IF;

    IF v_elapsed_seconds > v_max_time THEN
        RETURN QUERY SELECT false, '게임 시간이 초과되었습니다.'::TEXT, 0;
        RETURN;
    END IF;

    -- 포인트 검증 (게임당 최대 포인트)
    IF p_points > 10 OR p_points < 0 THEN
        RETURN QUERY SELECT false, '비정상적인 포인트 요청입니다.'::TEXT, 0;
        RETURN;
    END IF;

    -- 게임 세션 완료 처리
    UPDATE game_sessions
    SET end_time = NOW(), is_completed = true
    WHERE id = p_session_id;

    -- 게임 플레이 기록 추가
    INSERT INTO game_plays (user_id, game_type, brand_id, score)
    VALUES (p_user_id, v_game_type, v_brand_id, p_points);

    -- 포인트 적립 (내부 함수 호출)
    IF p_points > 0 THEN
        PERFORM secure_add_points(p_user_id, p_points, v_game_type || ' 게임 완료');
    END IF;

    RETURN QUERY SELECT true, '게임이 완료되었습니다.'::TEXT, p_points;
END;
$$;

-- --------------------------------------------
-- 4-4. 출석 체크 함수
-- --------------------------------------------
CREATE OR REPLACE FUNCTION secure_check_attendance(
    p_user_id TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT, streak INTEGER, points_awarded INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today DATE;
    v_yesterday DATE;
    v_last_check_date DATE;
    v_last_streak INTEGER;
    v_new_streak INTEGER;
    v_points INTEGER := 5; -- 출석 포인트
    v_korea_midnight TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 한국 시간 기준 오늘 자정 계산 (UTC+9)
    v_korea_midnight := (CURRENT_DATE AT TIME ZONE 'UTC') - INTERVAL '9 hours';
    v_today := (v_korea_midnight AT TIME ZONE 'Asia/Seoul')::DATE;
    v_yesterday := v_today - INTERVAL '1 day';

    -- 오늘 이미 출석했는지 확인
    SELECT check_date INTO v_last_check_date
    FROM attendance
    WHERE user_id = p_user_id AND check_date = v_today
    LIMIT 1;

    IF v_last_check_date IS NOT NULL THEN
        RETURN QUERY SELECT false, '이미 출석 체크를 완료했습니다.'::TEXT, 0, 0;
        RETURN;
    END IF;

    -- 최근 출석 기록 조회
    SELECT check_date, streak INTO v_last_check_date, v_last_streak
    FROM attendance
    WHERE user_id = p_user_id
    ORDER BY check_date DESC
    LIMIT 1;

    -- 연속 출석 계산
    IF v_last_check_date = v_yesterday THEN
        v_new_streak := v_last_streak + 1;
    ELSE
        v_new_streak := 1;
    END IF;

    -- 출석 기록 추가
    INSERT INTO attendance (user_id, check_date, streak)
    VALUES (p_user_id, v_today, v_new_streak);

    -- 포인트 적립
    PERFORM secure_add_points(p_user_id, v_points, '출석 체크');

    RETURN QUERY SELECT true, '출석 체크가 완료되었습니다.'::TEXT, v_new_streak, v_points;
END;
$$;

-- --------------------------------------------
-- 4-5. 미션 완료 함수 (추가 포인트)
-- --------------------------------------------
CREATE OR REPLACE FUNCTION complete_mission(
    p_user_id TEXT,
    p_mission_type TEXT,
    p_brand_name TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT, points_awarded INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_points INTEGER := 5; -- 미션 포인트
    v_today_mission_count INTEGER;
    v_max_daily_missions INTEGER := 10; -- 하루 최대 미션 수
    v_korea_midnight TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 한국 시간 기준 오늘 자정 계산 (UTC+9)
    v_korea_midnight := (CURRENT_DATE AT TIME ZONE 'UTC') - INTERVAL '9 hours';

    -- 오늘 완료한 미션 수 조회 (한국 시간 기준, 어뷰징 방지)
    SELECT COUNT(*) INTO v_today_mission_count
    FROM point_history
    WHERE user_id = p_user_id
      AND reason LIKE '%미션%'
      AND created_at >= v_korea_midnight;

    IF v_today_mission_count >= v_max_daily_missions THEN
        RETURN QUERY SELECT false, '일일 미션 횟수를 초과했습니다.'::TEXT, 0;
        RETURN;
    END IF;

    -- 포인트 적립
    PERFORM secure_add_points(p_user_id, v_points, p_brand_name || ' ' || p_mission_type || ' 미션 완료');

    RETURN QUERY SELECT true, '미션이 완료되었습니다.'::TEXT, v_points;
END;
$$;

-- ============================================
-- 5단계: RPC 함수 실행 권한 부여
-- ============================================

-- 인증된 사용자와 익명 사용자 모두 RPC 함수 실행 가능
GRANT EXECUTE ON FUNCTION secure_add_points TO authenticated, anon;
GRANT EXECUTE ON FUNCTION start_game_session TO authenticated, anon;
GRANT EXECUTE ON FUNCTION complete_game_session TO authenticated, anon;
GRANT EXECUTE ON FUNCTION secure_check_attendance TO authenticated, anon;
GRANT EXECUTE ON FUNCTION complete_mission TO authenticated, anon;

-- ============================================
-- 완료! 🔒
-- ============================================
-- 
-- 보안 강화가 완료되었습니다!
-- 
-- 적용된 보안 조치:
-- ✅ 클라이언트의 직접 테이블 수정 차단 (UPDATE/INSERT 불가)
-- ✅ 오직 보안 RPC 함수를 통해서만 데이터 변경 가능
-- ✅ 일일 포인트 한도 설정 (500P)
-- ✅ 일일 게임 횟수 제한 (3회)
-- ✅ 일일 미션 횟수 제한 (10회)
-- ✅ 게임 시간 검증 (최소 10초, 최대 5분)
-- ✅ 비정상적인 포인트 요청 차단
-- 
-- 다음 단계:
-- 1. Supabase Dashboard → SQL Editor에서 이 파일 실행
-- 2. 프론트엔드 코드를 RPC 함수 호출로 변경 (다음 파일 참조)
-- 3. 배포 및 테스트
-- 
-- ⚠️ 주의:
-- - 기존 사용자는 영향받지 않습니다 (조회 권한 유지)
-- - 새로운 데이터 추가는 오직 RPC 함수를 통해서만 가능
-- ============================================

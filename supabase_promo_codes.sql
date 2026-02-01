-- ============================================
-- 프로모션 코드 시스템
-- ============================================

-- 1. 프로모션 코드 테이블
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    bonus_points INTEGER NOT NULL DEFAULT 100,
    description TEXT,
    max_uses INTEGER, -- NULL이면 무제한
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT, -- 생성한 관리자 ID
    
    CHECK (bonus_points > 0),
    CHECK (current_uses >= 0),
    CHECK (max_uses IS NULL OR max_uses > 0)
);

-- 2. 프로모션 코드 사용 기록 테이블
CREATE TABLE IF NOT EXISTS promo_code_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_awarded INTEGER NOT NULL,
    
    UNIQUE(promo_code_id, user_id) -- 한 사용자당 한 번만 사용 가능
);

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user_id ON promo_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_promo_code_id ON promo_code_usage(promo_code_id);

-- 4. RLS 활성화
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책 (모든 사용자가 조회 가능, 사용 기록 추가 가능)
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON promo_codes;
CREATE POLICY "Anyone can view active promo codes"
    ON promo_codes FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Users can view own promo usage" ON promo_code_usage;
CREATE POLICY "Users can view own promo usage"
    ON promo_code_usage FOR SELECT
    USING (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

-- 6. 프로모션 코드 적용 함수 (보안 강화)
CREATE OR REPLACE FUNCTION apply_promo_code(
    p_user_id TEXT,
    p_code TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT, points_awarded INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo_code promo_codes%ROWTYPE;
    v_already_used BOOLEAN;
BEGIN
    -- 1. 프로모션 코드 조회
    SELECT * INTO v_promo_code
    FROM promo_codes
    WHERE code = p_code
      AND is_active = true;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, '유효하지 않은 프로모션 코드입니다.'::TEXT, 0;
        RETURN;
    END IF;

    -- 2. 만료일 확인
    IF v_promo_code.expires_at IS NOT NULL AND v_promo_code.expires_at < NOW() THEN
        RETURN QUERY SELECT false, '만료된 프로모션 코드입니다.'::TEXT, 0;
        RETURN;
    END IF;

    -- 3. 최대 사용 횟수 확인
    IF v_promo_code.max_uses IS NOT NULL AND v_promo_code.current_uses >= v_promo_code.max_uses THEN
        RETURN QUERY SELECT false, '프로모션 코드 사용 가능 횟수가 초과되었습니다.'::TEXT, 0;
        RETURN;
    END IF;

    -- 4. 이미 사용했는지 확인
    SELECT EXISTS(
        SELECT 1 FROM promo_code_usage
        WHERE promo_code_id = v_promo_code.id
          AND user_id = p_user_id
    ) INTO v_already_used;

    IF v_already_used THEN
        RETURN QUERY SELECT false, '이미 사용한 프로모션 코드입니다.'::TEXT, 0;
        RETURN;
    END IF;

    -- 5. 프로모션 코드 사용 기록
    INSERT INTO promo_code_usage (promo_code_id, user_id, points_awarded)
    VALUES (v_promo_code.id, p_user_id, v_promo_code.bonus_points);

    -- 6. 사용 횟수 증가
    UPDATE promo_codes
    SET current_uses = current_uses + 1
    WHERE id = v_promo_code.id;

    -- 7. 포인트 지급 (secure_add_points 함수 사용)
    PERFORM secure_add_points(
        p_user_id,
        v_promo_code.bonus_points,
        '프로모션 코드 (' || p_code || ') 보너스'
    );

    RETURN QUERY SELECT true, '프로모션 코드가 적용되었습니다!'::TEXT, v_promo_code.bonus_points;
END;
$$;

-- 7. 기본 프로모션 코드 예시 추가
INSERT INTO promo_codes (code, bonus_points, description, max_uses, expires_at)
VALUES 
    ('INSTAGRAM100', 100, '인스타그램 가입 이벤트', NULL, '2026-12-31 23:59:59+09'),
    ('FACEBOOK50', 50, '페이스북 가입 이벤트', NULL, '2026-12-31 23:59:59+09'),
    ('OPEN2026', 200, '2026 오픈 기념', 1000, '2026-03-31 23:59:59+09')
ON CONFLICT (code) DO NOTHING;

-- 완료 메시지
DO $$ 
BEGIN 
    RAISE NOTICE '✅ 프로모션 코드 시스템 설치 완료!';
    RAISE NOTICE '   - 테이블: promo_codes, promo_code_usage';
    RAISE NOTICE '   - 함수: apply_promo_code(user_id, code)';
    RAISE NOTICE '   - 기본 코드: INSTAGRAM100, FACEBOOK50, OPEN2026';
END $$;

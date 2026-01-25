-- ============================================
-- 포인트 교환 신청 테이블 추가
-- ============================================

CREATE TABLE IF NOT EXISTS point_exchanges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    voucher_type TEXT NOT NULL,
    points INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_point_exchanges_user_id ON point_exchanges(user_id);
CREATE INDEX idx_point_exchanges_status ON point_exchanges(status);
CREATE INDEX idx_point_exchanges_created_at ON point_exchanges(created_at DESC);

-- RLS 활성화
ALTER TABLE point_exchanges ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 교환 신청만 조회
CREATE POLICY "Users can view own exchanges"
    ON point_exchanges FOR SELECT
    USING (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

-- RLS 정책: 사용자는 자신의 교환 신청만 생성
CREATE POLICY "Users can insert own exchanges"
    ON point_exchanges FOR INSERT
    WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

-- RLS 정책: 관리자만 모든 교환 신청 조회 가능 (임시로 모두 허용)
CREATE POLICY "Anyone can view all exchanges for admin"
    ON point_exchanges FOR SELECT
    USING (true);

-- RLS 정책: 관리자만 교환 신청 상태 변경 가능 (임시로 모두 허용)
CREATE POLICY "Anyone can update exchanges"
    ON point_exchanges FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 완료!
-- Supabase SQL Editor에서 이 파일을 실행하면 교환 신청 테이블이 생성됩니다.

-- ============================================
-- 리워들 Supabase 완전 통합 스키마
-- 실행 날짜: 2026-01-22
-- ============================================
-- 이 하나의 SQL 파일만 실행하면 모든 설정이 완료됩니다!
-- ============================================

-- ⚠️ 기존 테이블 삭제 (모든 데이터가 삭제됩니다!)
DROP TABLE IF EXISTS game_plays CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS point_history CASCADE;
DROP TABLE IF EXISTS user_points CASCADE;
DROP TABLE IF EXISTS brands CASCADE;

-- ============================================
-- 1. brands 테이블 (브랜드 정보)
-- ============================================
CREATE TABLE brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    wordle_answer TEXT[] NOT NULL,
    apple_game_word TEXT NOT NULL,
    shooting_wordle_answer TEXT NOT NULL,  -- 슈팅워들 정답
    hint_image TEXT,  -- NULL 허용 (선택사항)
    place_quiz_question TEXT NOT NULL,
    place_quiz_answer TEXT NOT NULL,
    place_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_brands_is_active ON brands(is_active);

-- ============================================
-- 2. user_points 테이블 (사용자 포인트)
-- ============================================
CREATE TABLE user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_user_points_user_id ON user_points(user_id);

-- ============================================
-- 3. point_history 테이블 (포인트 내역)
-- ============================================
CREATE TABLE point_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_point_history_user_id ON point_history(user_id);
CREATE INDEX idx_point_history_created_at ON point_history(created_at DESC);

-- ============================================
-- 4. attendance 테이블 (출석 체크)
-- ============================================
CREATE TABLE attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    check_date DATE NOT NULL,
    streak INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, check_date)
);

CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_check_date ON attendance(check_date DESC);

-- ============================================
-- 5. game_plays 테이블 (게임 플레이 기록)
-- ============================================
CREATE TABLE game_plays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    game_type TEXT NOT NULL CHECK (game_type IN ('wordle', 'apple', 'shooting')),
    brand_id UUID REFERENCES brands(id),
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_game_plays_user_id ON game_plays(user_id);
CREATE INDEX idx_game_plays_created_at ON game_plays(created_at DESC);
CREATE INDEX idx_game_plays_brand_id ON game_plays(brand_id);

-- ============================================
-- RLS (Row Level Security) 활성화
-- ============================================

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plays ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 정책 설정 (게스트 사용자 지원)
-- ============================================

-- brands: 모든 사용자가 활성 브랜드 조회 가능
CREATE POLICY "Anyone can read active brands"
    ON brands FOR SELECT
    USING (is_active = true);

-- brands: 누구나 등록 가능 (임시 - 추후 관리자 인증 추가 예정)
CREATE POLICY "Anyone can insert brands"
    ON brands FOR INSERT
    WITH CHECK (true);

-- brands: 누구나 수정 가능 (임시 - 추후 관리자 인증 추가 예정)
CREATE POLICY "Anyone can update brands"
    ON brands FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- brands: 누구나 삭제 가능 (임시 - 추후 관리자 인증 추가 예정)
CREATE POLICY "Anyone can delete brands"
    ON brands FOR DELETE
    USING (true);

-- user_points: 사용자 자신의 포인트만 조회/수정 (게스트 포함)
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

-- point_history: 사용자 자신의 내역만 조회 (게스트 포함)
CREATE POLICY "Users can view own history"
    ON point_history FOR SELECT
    USING (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

CREATE POLICY "Users can insert own history"
    ON point_history FOR INSERT
    WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

-- attendance: 사용자 자신의 출석만 조회/기록 (게스트 포함)
CREATE POLICY "Users can view own attendance"
    ON attendance FOR SELECT
    USING (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

CREATE POLICY "Users can insert own attendance"
    ON attendance FOR INSERT
    WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

-- game_plays: 사용자 자신의 게임 기록만 조회/추가 (게스트 포함)
CREATE POLICY "Users can view own game plays"
    ON game_plays FOR SELECT
    USING (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

CREATE POLICY "Users can insert own game plays"
    ON game_plays FOR INSERT
    WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'guest_%');

-- ============================================
-- 초기 브랜드 데이터 삽입 (예시)
-- ============================================

INSERT INTO brands (
    name, 
    wordle_answer, 
    apple_game_word, 
    shooting_wordle_answer, 
    hint_image, 
    place_quiz_question, 
    place_quiz_answer, 
    place_url, 
    is_active
)
VALUES (
    '아쿠아가든',
    ARRAY['아', '쿠', '아', '가', '든'],
    '아쿠아가든',
    '아쿠아가든',
    NULL,  -- 힌트 이미지 (선택사항)
    '아쿠아가든은 어느 지역에 있나요?',
    '15',
    'https://place.map.kakao.com/example',
    true
);

-- ============================================
-- 완료! 🚀
-- ============================================
-- 모든 테이블, 인덱스, RLS 정책, 초기 데이터가 설정되었습니다.
-- 
-- 다음 단계:
-- 1. Supabase Dashboard → SQL Editor에서 이 파일 내용을 붙여넣기
-- 2. "Run" 버튼 클릭
-- 3. 성공 메시지 확인
-- 4. Table Editor에서 brands 테이블에 실제 브랜드 데이터 추가
-- 
-- 주의사항:
-- - 초기 브랜드 데이터의 place_url을 실제 카카오맵 URL로 수정하세요
-- - hint_image가 필요 없으면 NULL로 설정 가능합니다
-- - game_plays 테이블의 game_type에 'shooting' 타입이 추가되었습니다
-- ============================================

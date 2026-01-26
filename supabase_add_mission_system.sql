-- ============================================
-- 추가미션 시스템 확장 SQL
-- ============================================
-- brands 테이블에 미션 관련 컬럼 추가
-- ============================================

-- 1. place_url을 nullable로 변경 (도보 미션에서는 선택사항)
ALTER TABLE brands 
ALTER COLUMN place_url DROP NOT NULL;

-- 2. 기존 place_quiz 컬럼을 nullable로 변경 (도보 미션 지원)
ALTER TABLE brands 
ALTER COLUMN place_quiz_question DROP NOT NULL;

ALTER TABLE brands 
ALTER COLUMN place_quiz_answer DROP NOT NULL;

-- 3. mission_type 컬럼 추가 (quiz, walking, hybrid)
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS mission_type TEXT DEFAULT 'quiz' CHECK (mission_type IN ('quiz', 'walking', 'hybrid'));

-- 4. mission_data 컬럼 추가 (JSONB로 유연하게)
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS mission_data JSONB;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_brands_mission_type ON brands(mission_type);

-- ============================================
-- 기존 데이터 마이그레이션
-- ============================================
-- 기존 placeQuiz 데이터를 mission_data로 이동

UPDATE brands
SET 
    mission_type = 'quiz',
    mission_data = jsonb_build_object(
        'type', 'quiz',
        'quiz', jsonb_build_object(
            'question', place_quiz_question,
            'answer', place_quiz_answer,
            'bonusPoints', 5
        ),
        'bonusPoints', 5
    )
WHERE mission_data IS NULL;

-- ============================================
-- mission_data 구조 예시
-- ============================================

-- 퀴즈 미션:
-- {
--   "type": "quiz",
--   "quiz": {
--     "question": "이 매장의 아메리카노 가격은?",
--     "answer": "4500",
--     "bonusPoints": 5
--   },
--   "bonusPoints": 5
-- }

-- 도보 미션:
-- {
--   "type": "walking",
--   "walking": {
--     "seoKeyword": "성북동 수제버터바 맛집",
--     "startPoint": "한성대입구역 6번출구",
--     "walkingTime": "8분",
--     "quizQuestion": "출발지에서 매장까지 도보로 몇 분 걸릴까요?",
--     "correctAnswer": "8분",
--     "storeAddress": "서울시 성북구 ..."
--   },
--   "bonusPoints": 20
-- }

-- 하이브리드 미션 (둘 다):
-- {
--   "type": "hybrid",
--   "quiz": {
--     "question": "시그니처 메뉴는?",
--     "answer": "잠봉뵈르",
--     "bonusPoints": 5
--   },
--   "walking": {
--     "seoKeyword": "압구정 로데오 프렌치 카페",
--     "startPoint": "압구정로데오역 5번출구",
--     "walkingTime": "3분",
--     "quizQuestion": "도보로 몇 분?",
--     "correctAnswer": "3분",
--     "storeAddress": "서울시 강남구 ..."
--   },
--   "bonusPoints": 25
-- }

-- ============================================
-- 코멘트 추가
-- ============================================
COMMENT ON COLUMN brands.mission_type IS '미션 타입: quiz(퀴즈), walking(도보), hybrid(둘 다)';
COMMENT ON COLUMN brands.mission_data IS '미션 데이터 (JSONB): 퀴즈/도보 미션 정보';

-- ============================================
-- 확인 쿼리
-- ============================================

-- 모든 브랜드의 미션 타입 확인
-- SELECT id, name, mission_type, mission_data FROM brands;

-- 퀴즈 미션만 조회
-- SELECT * FROM brands WHERE mission_type = 'quiz';

-- 도보 미션만 조회
-- SELECT * FROM brands WHERE mission_type = 'walking';

-- ============================================
-- 완료! 🚀
-- ============================================

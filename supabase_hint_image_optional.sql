-- ============================================
-- brands 테이블의 hint_image 컬럼을 NULL 허용으로 변경
-- ============================================

-- 기존 NOT NULL 제약 조건 제거
ALTER TABLE brands 
ALTER COLUMN hint_image DROP NOT NULL;

-- 완료! 이제 hint_image는 선택사항입니다 ✅

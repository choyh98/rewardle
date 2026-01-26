// ===== 게임 관련 상수 =====
export const DECOY_CHARS = [
    '지', '사', '구', '어', '기', '저', '서', '주', '바',
    '정', '직', '누', '김', '축', '빔', '린', '카', '페',
    '수', '도', '멍', '가', '든', '리', '스', '트', '팩', '토',
    '월', '드', '빌',
    '커', '피', '디', '쿠', '키', '베', '이',
    '포', '인', '워', '프', '캐', '시', '티', '크', '런', '워', '아'
];

export const DAILY_GAME_LIMIT = 10;
export const ATTENDANCE_MISSION_GOAL = 3;

// ===== LocalStorage Keys =====
export const STORAGE_KEYS = {
    // 포인트 & 게임
    POINTS: 'rewardle_points',
    HISTORY: 'rewardle_history',
    DAILY_GAMES: 'rewardle_daily_games',
    GAME_HISTORY: 'rewardle_game_history',
    COMPLETED_BRANDS: 'rewardle_completed_brands',
    
    // 출석
    LAST_CHECK: 'rewardle_last_check',
    ATTENDANCE_STREAK: 'rewardle_attendance_streak',
    
    // 인증
    GUEST_ID: 'rewardle_guest_id',
    
    // 설정
    DIFFICULTY: 'rewardle_difficulty',
    ONBOARDING_COMPLETED: 'rewardle_onboarding_completed'
} as const;

// ===== 포인트 보상 =====
export const POINTS = {
    GAME_WIN: 10,
    ATTENDANCE: 5,
    MISSION_COMPLETE: 15
} as const;

// ===== 타이머 =====
export const TIMERS = {
    DAILY_RESET_HOUR: 0, // 자정
    TOOLTIP_DURATION: 2000 // 2초
} as const;

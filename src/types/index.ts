// ============================================
// 공통 타입 정의
// ============================================

// 사용자
export interface User {
    id: string;
    isGuest: boolean;
}

// 포인트
export interface PointHistory {
    date: string;
    reason: string;
    amount: number;
}

// 게임
export type GameType = 'wordle' | 'apple' | 'shooting';

export interface GameHistory {
    date: string;
    gameType: GameType;
}

export interface GameStats {
    totalGamesPlayed: number;
    dailyGamesRemaining: number;
    canPlayGame: boolean;
}

// 출석
export interface AttendanceData {
    checked: boolean;
    streak: number;
    lastCheckDate: string;
}

// 브랜드/퀴즈
export interface QuizData {
    question: string;
    answer: string;
    bonusPoints: number;
}

// 미션 타입
export type MissionType = 'quiz' | 'walking' | 'hybrid';

// 도보 미션 데이터
export type TransportType = 'walking' | 'bicycle';

export interface WalkingMissionData {
    seoKeyword: string;          // AI가 찾은 SEO 키워드
    startPoint: string;           // 출발지 (예: 한성대입구역 6번출구)
    walkingTime: string;          // 도보 시간 (예: 8분)
    bicycleTime: string;          // 자전거 시간 (예: 4분)
    quizQuestion: string;         // 질문 (예: 도보로 몇 분 걸릴까요?)
    correctAnswer: string;        // 정답
    storeAddress?: string;        // 매장 실제 주소
}

// AI 분석 결과
export interface AIAnalysisResult {
    status: 'success' | 'fail';
    store_analysis: {
        summary: string;
        vibe: string;
    };
    seo_strategy: {
        target_keywords: string[];
        competitiveness: string;
    };
    user_mission: {
        start_point: string;
        selected_keyword: string;
        quiz_question: string;
        correct_answer: string;
    };
    actual_address: string;
    reasoning: string;
}

// 통합 미션 데이터
export interface MissionData {
    type: MissionType;
    quiz?: QuizData;              // 퀴즈 미션
    walking?: WalkingMissionData; // 도보 미션
    bonusPoints: number;
}

export interface Brand {
    id: string;
    name: string;
    wordleAnswer: string[];
    hintImage: string;
    placeQuiz: QuizData;          // 레거시 (호환성)
    placeUrl: string;
    appleGameWord: string;
    mission?: MissionData;        // 새로운 미션 시스템
}

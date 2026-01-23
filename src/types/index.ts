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

export interface Brand {
    id: string;
    name: string;
    wordleAnswer: string[];
    hintImage: string;
    placeQuiz: QuizData;
    placeUrl: string;
    appleGameWord: string;
}

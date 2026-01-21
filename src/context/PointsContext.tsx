import React, { createContext, useContext, useState, useEffect } from 'react';

interface PointsContextType {
    points: number;
    addPoints: (amount: number, reason: string) => void;
    history: Array<{ date: string; reason: string; amount: number }>;
    totalGamesPlayed: number;
    recordGameCompletion: (gameType: 'wordle' | 'apple') => void;
    canPlayGame: () => boolean;
    dailyGamesRemaining: number;
    gameHistory: Array<{ date: string; gameType: 'wordle' | 'apple' }>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const PointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [points, setPoints] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('rewardle_points');
            return saved ? parseInt(saved) : 0;
        } catch (error) {
            console.error('Failed to load points:', error);
            return 0;
        }
    });

    const [history, setHistory] = useState<Array<{ date: string; reason: string; amount: number }>>(() => {
        try {
            const saved = localStorage.getItem('rewardle_history');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load history:', error);
            return [];
        }
    });

    // 일일 게임 플레이 횟수 관리
    const [dailyGames, setDailyGames] = useState<{ date: string; count: number }>(() => {
        try {
            const saved = localStorage.getItem('rewardle_daily_games');
            if (saved) {
                const data = JSON.parse(saved);
                const today = new Date().toDateString();
                // 날짜가 바뀌면 초기화
                if (data.date === today) {
                    return data;
                }
            }
        } catch (error) {
            console.error('Failed to load daily games:', error);
        }
        return { date: new Date().toDateString(), count: 0 };
    });

    // 게임별 참여 내역 관리
    const [gameHistory, setGameHistory] = useState<Array<{ date: string; gameType: 'wordle' | 'apple' }>>(() => {
        try {
            const saved = localStorage.getItem('rewardle_game_history');
            if (saved) {
                const data = JSON.parse(saved);
                const today = new Date().toDateString();
                // 오늘 날짜의 기록만 유지
                return data.filter((item: { date: string }) => item.date === today);
            }
        } catch (error) {
            console.error('Failed to load game history:', error);
        }
        return [];
    });

    // totalGamesPlayed는 dailyGames.count와 동기화
    const totalGamesPlayed = dailyGames.count;

    const DAILY_GAME_LIMIT = 10;

    useEffect(() => {
        try {
            localStorage.setItem('rewardle_points', points.toString());
        } catch (error) {
            console.error('Failed to save points:', error);
        }
    }, [points]);

    useEffect(() => {
        try {
            localStorage.setItem('rewardle_history', JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }, [history]);

    useEffect(() => {
        try {
            localStorage.setItem('rewardle_daily_games', JSON.stringify(dailyGames));
        } catch (error) {
            console.error('Failed to save daily games:', error);
        }
    }, [dailyGames]);

    useEffect(() => {
        try {
            localStorage.setItem('rewardle_game_history', JSON.stringify(gameHistory));
        } catch (error) {
            console.error('Failed to save game history:', error);
        }
    }, [gameHistory]);

    const addPoints = (amount: number, reason: string) => {
        setPoints(prev => prev + amount);
        // 0 포인트는 히스토리에 추가하지 않음
        if (amount > 0) {
            setHistory(prev => [{ date: new Date().toISOString(), reason, amount }, ...prev]);
        }
    };

    const canPlayGame = () => {
        const today = new Date().toDateString();
        if (dailyGames.date !== today) {
            return true; // 새로운 날이면 플레이 가능
        }
        return dailyGames.count < DAILY_GAME_LIMIT;
    };

    const recordGameCompletion = (gameType: 'wordle' | 'apple') => {
        const today = new Date().toDateString();
        
        // 게임 내역에 추가
        setGameHistory(prev => [...prev, { date: today, gameType }]);
        
        if (dailyGames.date !== today) {
            // 새로운 날이면 초기화
            setDailyGames({ date: today, count: 1 });
        } else {
            // 같은 날이면 카운트 증가
            setDailyGames(prev => ({ ...prev, count: prev.count + 1 }));
        }
    };

    const dailyGamesRemaining = Math.max(0, DAILY_GAME_LIMIT - (dailyGames.date === new Date().toDateString() ? dailyGames.count : 0));

    return (
        <PointsContext.Provider value={{ 
            points, 
            addPoints, 
            history, 
            totalGamesPlayed, 
            recordGameCompletion,
            canPlayGame,
            dailyGamesRemaining,
            gameHistory
        }}>
            {children}
        </PointsContext.Provider>
    );
};

export const usePoints = () => {
    const context = useContext(PointsContext);
    if (!context) throw new Error('usePoints must be used within PointsProvider');
    return context;
};

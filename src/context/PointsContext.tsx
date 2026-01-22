import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { pointsService, gameService } from '../lib/services';
import type { PointHistory, GameType, GameHistory } from '../types';

interface PointsContextType {
    points: number;
    addPoints: (amount: number, reason: string) => void;
    history: PointHistory[];
    totalGamesPlayed: number;
    recordGameCompletion: (gameType: GameType, brandId?: string) => void;
    canPlayGame: () => boolean;
    dailyGamesRemaining: number;
    gameHistory: GameHistory[];
    isLoading: boolean;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

const DAILY_GAME_LIMIT = 10;

export const PointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [points, setPoints] = useState<number>(0);
    const [history, setHistory] = useState<PointHistory[]>([]);
    const [dailyGames, setDailyGames] = useState<{ date: string; count: number }>({ 
        date: new Date().toDateString(), 
        count: 0 
    });
    const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);

    const totalGamesPlayed = dailyGames.count;

    // 사용자 데이터 로드
    useEffect(() => {
        if (!user) return;

        const loadUserData = async () => {
            setIsLoading(true);
            try {
                if (user.isGuest) {
                    await loadFromLocalStorage();
                } else {
                    await loadFromSupabase();
                }
            } catch (error) {
                console.error('Failed to load user data:', error);
                await loadFromLocalStorage();
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [user]);

    // localStorage에서 데이터 로드
    const loadFromLocalStorage = async () => {
        try {
            const savedPoints = localStorage.getItem('rewardle_points');
            const savedHistory = localStorage.getItem('rewardle_history');
            const savedDailyGames = localStorage.getItem('rewardle_daily_games');
            const savedGameHistory = localStorage.getItem('rewardle_game_history');

            setPoints(savedPoints ? parseInt(savedPoints) : 0);
            setHistory(savedHistory ? JSON.parse(savedHistory) : []);

            if (savedDailyGames) {
                const data = JSON.parse(savedDailyGames);
                const today = new Date().toDateString();
                setDailyGames(data.date === today ? data : { date: today, count: 0 });
            }

            if (savedGameHistory) {
                const data = JSON.parse(savedGameHistory);
                const today = new Date().toDateString();
                setGameHistory(data.filter((item: GameHistory) => item.date === today));
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    };

    // Supabase에서 데이터 로드
    const loadFromSupabase = async () => {
        if (!user || user.isGuest) return;

        try {
            // 포인트 가져오기
            const userPoints = await pointsService.getUserPoints(user.id);
            setPoints(userPoints);

            // 포인트 내역 가져오기
            const historyData = await pointsService.getPointHistory(user.id);
            setHistory(historyData);

            // 게임 플레이 내역 가져오기
            const gameData = await gameService.getTodayGamePlays(user.id);
            const todayString = new Date().toDateString();
            setDailyGames({ date: todayString, count: gameData.count });
            setGameHistory(gameData.history);
        } catch (error) {
            console.error('Failed to load from Supabase:', error);
            throw error;
        }
    };

    // 포인트 추가
    const addPoints = async (amount: number, reason: string) => {
        if (amount <= 0 || !user) return;

        const newPoints = points + amount;
        setPoints(newPoints);
        const newHistoryItem = { date: new Date().toISOString(), reason, amount };
        setHistory(prev => [newHistoryItem, ...prev]);

        if (user.isGuest) {
            // 게스트: localStorage에 저장
            try {
                localStorage.setItem('rewardle_points', newPoints.toString());
                localStorage.setItem('rewardle_history', JSON.stringify([newHistoryItem, ...history]));
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
            }
        } else {
            // 로그인 사용자: Supabase에 저장
            try {
                await pointsService.addPoints(user.id, amount, reason, points);
            } catch (error) {
                console.error('Failed to save points to Supabase:', error);
            }
        }
    };

    // 게임 완료 기록
    const recordGameCompletion = async (gameType: GameType, brandId?: string) => {
        if (!user) return;

        const today = new Date().toDateString();
        
        // 로컬 상태 업데이트
        setGameHistory(prev => [...prev, { date: today, gameType }]);
        
        if (dailyGames.date !== today) {
            setDailyGames({ date: today, count: 1 });
        } else {
            setDailyGames(prev => ({ ...prev, count: prev.count + 1 }));
        }

        if (user.isGuest) {
            // 게스트: localStorage에 저장
            try {
                const newDailyGames = dailyGames.date !== today 
                    ? { date: today, count: 1 }
                    : { ...dailyGames, count: dailyGames.count + 1 };
                
                localStorage.setItem('rewardle_daily_games', JSON.stringify(newDailyGames));
                localStorage.setItem('rewardle_game_history', JSON.stringify([...gameHistory, { date: today, gameType }]));
            } catch (error) {
                console.error('Failed to save game completion to localStorage:', error);
            }
        } else {
            // 로그인 사용자: Supabase에 저장
            try {
                await gameService.recordGameCompletion(user.id, gameType, brandId);
            } catch (error) {
                console.error('Failed to save game completion to Supabase:', error);
            }
        }
    };

    const canPlayGame = () => {
        const today = new Date().toDateString();
        if (dailyGames.date !== today) {
            return true;
        }
        return dailyGames.count < DAILY_GAME_LIMIT;
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
            gameHistory,
            isLoading
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

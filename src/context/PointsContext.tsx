import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useGameTimer } from '../hooks/useGameTimer';
import { pointService } from '../services/pointService';
import { gameService } from '../services/gameService';
import { STORAGE_KEYS, DAILY_GAME_LIMIT } from '../data/constants';
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
    nextResetTime: Date | null;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const PointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { nextResetTime, isNewDay } = useGameTimer();
    
    const [isLoading, setIsLoading] = useState(true);
    const [points, setPoints] = useState<number>(0);
    const [history, setHistory] = useState<PointHistory[]>([]);
    const [dailyGames, setDailyGames] = useState<{ date: string; count: number }>({
        date: new Date().toDateString(),
        count: 0
    });
    const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);

    const totalGamesPlayed = dailyGames.count;
    const dailyGamesRemaining = Math.max(0, DAILY_GAME_LIMIT - dailyGames.count);

    // 새로운 날 체크 및 초기화
    useEffect(() => {
        if (isNewDay) {
            const today = new Date().toDateString();
            setDailyGames({ date: today, count: 0 });
            setGameHistory([]);
            
            if (user?.isGuest) {
                localStorage.setItem(STORAGE_KEYS.DAILY_GAMES, JSON.stringify({ date: today, count: 0 }));
                localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify([]));
            }
        }
    }, [isNewDay, user]);

    // localStorage에서 데이터 로드
    const loadFromLocalStorage = useCallback(async () => {
        try {
            const savedPoints = localStorage.getItem(STORAGE_KEYS.POINTS);
            const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
            const savedDailyGames = localStorage.getItem(STORAGE_KEYS.DAILY_GAMES);
            const savedGameHistory = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);

            const loadedPoints = savedPoints ? parseInt(savedPoints) : 0;
            console.log('localStorage에서 포인트 로드:', loadedPoints);
            setPoints(loadedPoints);
            setHistory(savedHistory ? JSON.parse(savedHistory) : []);

            if (savedDailyGames) {
                const data = JSON.parse(savedDailyGames);
                const today = new Date().toDateString();
                if (data.date === today) {
                    setDailyGames(data);
                } else {
                    setDailyGames({ date: today, count: 0 });
                }
            }

            if (savedGameHistory) {
                const data = JSON.parse(savedGameHistory);
                const today = new Date().toDateString();
                setGameHistory(data.filter((item: GameHistory) => item.date === today));
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    }, []);

    // Supabase에서 데이터 로드
    const loadFromSupabase = useCallback(async () => {
        if (!user || user.isGuest) return;

        try {
            const userPoints = await pointService.getUserPoints(user.id);
            console.log('DB에서 로드한 포인트:', userPoints);
            setPoints(userPoints);

            const historyData = await pointService.getPointHistory(user.id);
            setHistory(historyData);

            const gameData = await gameService.getTodayGamePlays(user.id);
            const todayString = new Date().toDateString();
            setDailyGames({ date: todayString, count: gameData.count });
            setGameHistory(gameData.history);
        } catch (error) {
            console.error('Failed to load from Supabase:', error);
            throw error;
        }
    }, [user]);

    // 사용자 데이터 로드
    useEffect(() => {
        if (!user) return;

        const loadUserData = async () => {
            setIsLoading(true);
            try {
                if (user.isGuest) {
                    await loadFromLocalStorage();
                } else {
                    try {
                        console.log('로그인 사용자 데이터 로드 시작:', user.id);
                        await loadFromSupabase();
                        console.log('Supabase에서 포인트 로드 완료');
                    } catch (supabaseError) {
                        console.error('Supabase load failed, falling back to localStorage:', supabaseError);
                        await loadFromLocalStorage();
                    }
                }
            } catch (error) {
                console.error('Failed to load user data:', error);
                await loadFromLocalStorage();
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [user?.id, user?.isGuest, loadFromLocalStorage, loadFromSupabase]);

    // 포인트 추가
    const addPoints = useCallback(async (amount: number, reason: string) => {
        if (amount <= 0 || !user) return;

        const previousPoints = points;
        const previousHistory = history;
        const newPoints = points + amount;
        const newHistoryItem = { date: new Date().toISOString(), reason, amount };

        // 낙관적 업데이트
        setPoints(newPoints);
        setHistory(prev => [newHistoryItem, ...prev]);

        if (user.isGuest) {
            try {
                localStorage.setItem(STORAGE_KEYS.POINTS, newPoints.toString());
                localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([newHistoryItem, ...previousHistory]));
                console.log('게스트 포인트 저장 완료:', newPoints);
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                setPoints(previousPoints);
                setHistory(previousHistory);
            }
        } else {
            try {
                console.log('Supabase에 포인트 저장 시작:', { userId: user.id, previousPoints, amount, newPoints });
                const updatedPoints = await pointService.addPoints(user.id, amount, reason);
                console.log('Supabase 저장 완료. 반환된 포인트:', updatedPoints);
                setPoints(updatedPoints);
            } catch (error: any) {
                console.error('포인트 저장 실패:', error);
                setPoints(previousPoints);
                setHistory(previousHistory);
                alert(`포인트 저장에 실패했습니다.\n에러: ${error?.message || '알 수 없는 오류'}`);
            }
        }
    }, [user, points, history]);

    // 게임 완료 기록
    const recordGameCompletion = useCallback(async (gameType: GameType, brandId?: string) => {
        if (!user) return;

        const today = new Date().toDateString();
        const newCount = dailyGames.date !== today ? 1 : dailyGames.count + 1;

        setGameHistory(prev => [...prev, { date: today, gameType }]);

        const newDailyGames = dailyGames.date !== today
            ? { date: today, count: 1 }
            : { ...dailyGames, count: newCount };

        setDailyGames(newDailyGames);

        if (user.isGuest) {
            try {
                localStorage.setItem(STORAGE_KEYS.DAILY_GAMES, JSON.stringify(newDailyGames));
                localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify([...gameHistory, { date: today, gameType }]));
            } catch (error) {
                console.error('Failed to save game completion to localStorage:', error);
            }
        } else {
            try {
                await gameService.recordGameCompletion(user.id, gameType, brandId);
            } catch (error) {
                console.error('Failed to save game completion to Supabase:', error);
            }
        }
    }, [user, dailyGames, gameHistory]);

    const canPlayGame = useCallback(() => {
        const today = new Date().toDateString();
        if (dailyGames.date !== today) {
            return true;
        }
        return dailyGames.count < DAILY_GAME_LIMIT;
    }, [dailyGames]);

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
            isLoading,
            nextResetTime
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

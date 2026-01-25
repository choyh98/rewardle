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
    nextResetTime: Date | null;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

const DAILY_GAME_LIMIT = 10;

export const PointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [points, setPoints] = useState<number>(0);
    const [history, setHistory] = useState<PointHistory[]>([]);
    const [dailyGames, setDailyGames] = useState<{ date: string; count: number; resetTime?: string }>({ 
        date: new Date().toDateString(), 
        count: 0 
    });
    const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
    const [nextResetTime, setNextResetTime] = useState<Date | null>(null);

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
                    try {
                        await loadFromSupabase();
                    } catch (supabaseError) {
                        console.error('Supabase load failed, falling back to localStorage:', supabaseError);
                        // Supabase 실패 시 localStorage로 fallback (포인트 유지)
                        await loadFromLocalStorage();
                    }
                }
            } catch (error) {
                console.error('Failed to load user data:', error);
                // 최종 fallback
                await loadFromLocalStorage();
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.isGuest]); // user 객체 전체가 아닌 id와 isGuest만 의존

    // 24시간 타이머 관리 및 자동 초기화
    useEffect(() => {
        const checkAndResetGames = () => {
            const today = new Date().toDateString();
            
            // 날짜가 바뀌면 게임 횟수와 기록만 초기화 (포인트는 유지)
            if (dailyGames.date !== today) {
                const newDailyGames = { date: today, count: 0 };
                setDailyGames(newDailyGames);
                setGameHistory([]);
                setNextResetTime(null);
                
                // localStorage 업데이트 (포인트는 건드리지 않음)
                if (user?.isGuest) {
                    localStorage.setItem('rewardle_daily_games', JSON.stringify(newDailyGames));
                    localStorage.setItem('rewardle_game_history', JSON.stringify([]));
                    localStorage.removeItem('rewardle_reset_time');
                    // 포인트와 히스토리는 유지
                }
            }
            
            // resetTime이 있고 24시간이 지났으면 초기화
            if (dailyGames.resetTime) {
                const resetTime = new Date(dailyGames.resetTime);
                if (resetTime <= new Date()) {
                    // 24시간이 지났으므로 게임 횟수만 초기화
                    const newDailyGames = { date: today, count: 0 };
                    setDailyGames(newDailyGames);
                    setNextResetTime(null);
                    
                    if (user?.isGuest) {
                        localStorage.setItem('rewardle_daily_games', JSON.stringify(newDailyGames));
                        localStorage.removeItem('rewardle_reset_time');
                    }
                } else {
                    // 아직 24시간이 안 지났으면 타이머 유지
                    setNextResetTime(resetTime);
                }
            }
        };

        // 초기 체크
        checkAndResetGames();

        // 1분마다 체크
        const interval = setInterval(checkAndResetGames, 60000);
        
        return () => clearInterval(interval);
    }, [dailyGames, user]);

    // localStorage에서 데이터 로드
    const loadFromLocalStorage = async () => {
        try {
            const savedPoints = localStorage.getItem('rewardle_points');
            const savedHistory = localStorage.getItem('rewardle_history');
            const savedDailyGames = localStorage.getItem('rewardle_daily_games');
            const savedGameHistory = localStorage.getItem('rewardle_game_history');

            // 포인트 로드 (기존 포인트가 있으면 유지)
            const loadedPoints = savedPoints ? parseInt(savedPoints) : 0;
            console.log('localStorage에서 포인트 로드:', loadedPoints);
            setPoints(loadedPoints);
            setHistory(savedHistory ? JSON.parse(savedHistory) : []);

            if (savedDailyGames) {
                const data = JSON.parse(savedDailyGames);
                const today = new Date().toDateString();
                if (data.date === today) {
                    setDailyGames(data);
                    // resetTime이 있으면 설정
                    if (data.resetTime) {
                        setNextResetTime(new Date(data.resetTime));
                    }
                } else {
                    // 날짜가 다르면 게임 횟수만 초기화 (포인트는 유지)
                    setDailyGames({ date: today, count: 0 });
                    setNextResetTime(null);
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
        const newCount = dailyGames.date !== today ? 1 : dailyGames.count + 1;
        
        // 로컬 상태 업데이트
        setGameHistory(prev => [...prev, { date: today, gameType }]);
        
        // 게임 횟수가 10이 되면 24시간 후 초기화 시간 설정
        let resetTime: string | undefined = undefined;
        if (newCount === DAILY_GAME_LIMIT) {
            const reset = new Date();
            reset.setHours(reset.getHours() + 24);
            resetTime = reset.toISOString();
            setNextResetTime(reset);
        }
        
        const newDailyGames = dailyGames.date !== today 
            ? { date: today, count: 1, resetTime }
            : { ...dailyGames, count: newCount, resetTime: resetTime || dailyGames.resetTime };
        
        setDailyGames(newDailyGames);

        if (user.isGuest) {
            // 게스트: localStorage에 저장
            try {
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

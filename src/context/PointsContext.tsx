import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PointsContextType {
    points: number;
    addPoints: (amount: number, reason: string) => void;
    history: Array<{ date: string; reason: string; amount: number }>;
    totalGamesPlayed: number;
    recordGameCompletion: (gameType: 'wordle' | 'apple', brandId?: string) => void;
    canPlayGame: () => boolean;
    dailyGamesRemaining: number;
    gameHistory: Array<{ date: string; gameType: 'wordle' | 'apple' }>;
    isLoading: boolean;
    userId: string | null;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const PointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [points, setPoints] = useState<number>(0);
    const [history, setHistory] = useState<Array<{ date: string; reason: string; amount: number }>>([]);
    const [dailyGames, setDailyGames] = useState<{ date: string; count: number }>({ date: new Date().toDateString(), count: 0 });
    const [gameHistory, setGameHistory] = useState<Array<{ date: string; gameType: 'wordle' | 'apple' }>>([]);

    const DAILY_GAME_LIMIT = 10;
    const totalGamesPlayed = dailyGames.count;

    // 사용자 ID 가져오기 (Supabase Auth 또는 게스트)
    useEffect(() => {
        const initUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUserId(session.user.id);
                } else {
                    // 게스트 사용자
                    let guestId = localStorage.getItem('rewardle_guest_id');
                    if (!guestId) {
                        guestId = `guest_${Date.now()}`;
                        localStorage.setItem('rewardle_guest_id', guestId);
                    }
                    setUserId(guestId);
                }
            } catch (error) {
                console.error('Failed to initialize user:', error);
                // 폴백: 게스트 사용자
                let guestId = localStorage.getItem('rewardle_guest_id');
                if (!guestId) {
                    guestId = `guest_${Date.now()}`;
                    localStorage.setItem('rewardle_guest_id', guestId);
                }
                setUserId(guestId);
            }
        };
        initUser();
    }, []);

    // 사용자 데이터 로드
    useEffect(() => {
        if (!userId) return;

        const loadUserData = async () => {
            setIsLoading(true);
            try {
                // 게스트 사용자는 localStorage 사용
                if (userId.startsWith('guest_')) {
                    await loadFromLocalStorage();
                } else {
                    // 로그인 사용자는 Supabase 사용
                    await loadFromSupabase();
                }
            } catch (error) {
                console.error('Failed to load user data:', error);
                // 에러 시 localStorage 폴백
                await loadFromLocalStorage();
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [userId]);

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
                setGameHistory(data.filter((item: { date: string }) => item.date === today));
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    };

    // Supabase에서 데이터 로드
    const loadFromSupabase = async () => {
        if (!userId || userId.startsWith('guest_')) return;

        try {
            // 1. 사용자 포인트 가져오기
            const { data: userPoints, error: pointsError } = await supabase
                .from('user_points')
                .select('points')
                .eq('user_id', userId)
                .single();

            if (pointsError) {
                if (pointsError.code === 'PGRST116') {
                    // 레코드가 없으면 생성
                    await supabase.from('user_points').insert({ user_id: userId, points: 0 });
                    setPoints(0);
                } else {
                    throw pointsError;
                }
            } else {
                setPoints(userPoints?.points || 0);
            }

            // 2. 포인트 내역 가져오기 (최근 100개)
            const { data: historyData, error: historyError } = await supabase
                .from('point_history')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(100);

            if (historyError) throw historyError;
            
            setHistory(
                (historyData || []).map(item => ({
                    date: item.created_at,
                    reason: item.reason,
                    amount: item.amount
                }))
            );

            // 3. 오늘의 게임 플레이 내역 가져오기
            const today = new Date().toISOString().split('T')[0];
            const { data: gamePlays, error: gamesError } = await supabase
                .from('game_plays')
                .select('*')
                .eq('user_id', userId)
                .gte('created_at', today)
                .order('created_at', { ascending: false });

            if (gamesError) throw gamesError;

            const todayString = new Date().toDateString();
            setDailyGames({ date: todayString, count: gamePlays?.length || 0 });
            setGameHistory(
                (gamePlays || []).map(item => ({
                    date: todayString,
                    gameType: item.game_type as 'wordle' | 'apple'
                }))
            );

        } catch (error) {
            console.error('Failed to load from Supabase:', error);
            throw error;
        }
    };

    // 포인트 추가 (Supabase 또는 localStorage)
    const addPoints = async (amount: number, reason: string) => {
        if (amount <= 0) return;

        const newPoints = points + amount;
        setPoints(newPoints);
        const newHistoryItem = { date: new Date().toISOString(), reason, amount };
        setHistory(prev => [newHistoryItem, ...prev]);

        if (userId?.startsWith('guest_')) {
            // 게스트: localStorage에 저장
            try {
                localStorage.setItem('rewardle_points', newPoints.toString());
                localStorage.setItem('rewardle_history', JSON.stringify([newHistoryItem, ...history]));
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
            }
        } else if (userId) {
            // 로그인 사용자: Supabase에 저장
            try {
                // 1. 포인트 내역 추가
                await supabase.from('point_history').insert({
                    user_id: userId,
                    amount,
                    reason
                });

                // 2. 총 포인트 업데이트 (최신 값 사용)
                await supabase
                    .from('user_points')
                    .upsert({ 
                        user_id: userId, 
                        points: newPoints 
                    });
            } catch (error) {
                console.error('Failed to save points to Supabase:', error);
            }
        }
    };

    // 게임 완료 기록
    const recordGameCompletion = async (gameType: 'wordle' | 'apple', brandId?: string) => {
        const today = new Date().toDateString();
        
        // 로컬 상태 업데이트
        setGameHistory(prev => [...prev, { date: today, gameType }]);
        
        if (dailyGames.date !== today) {
            setDailyGames({ date: today, count: 1 });
        } else {
            setDailyGames(prev => ({ ...prev, count: prev.count + 1 }));
        }

        if (userId?.startsWith('guest_')) {
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
        } else if (userId) {
            // 로그인 사용자: Supabase에 저장
            try {
                await supabase.from('game_plays').insert({
                    user_id: userId,
                    game_type: gameType,
                    brand_id: brandId || null,
                    score: 0
                });
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
            userId
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

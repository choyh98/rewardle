import { useState, useEffect, useCallback } from 'react';
import { pointService } from '../services/pointService';
import { gameService } from '../services/gameService';
import { STORAGE_KEYS } from '../data/constants';
import type { PointHistory, GameHistory } from '../types';

interface UsePointSyncProps {
    userId: string;
    isGuest: boolean;
}

interface UsePointSyncReturn {
    points: number;
    history: PointHistory[];
    gameHistory: GameHistory[];
    dailyGamesRemaining: number;
    isLoading: boolean;
    error: string | null;
    addPoints: (amount: number, reason: string) => Promise<void>;
    recordGame: (gameType: string, brandId?: string) => Promise<void>;
    refreshData: () => Promise<void>;
}

/**
 * 로컬/Supabase 포인트 동기화 로직 관리
 */
export const usePointSync = ({ userId, isGuest }: UsePointSyncProps): UsePointSyncReturn => {
    const [points, setPoints] = useState(0);
    const [history, setHistory] = useState<PointHistory[]>([]);
    const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
    const [dailyGamesRemaining, setDailyGamesRemaining] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 게스트 모드: localStorage에서 데이터 로드
    const loadGuestData = useCallback(() => {
        try {
            // 포인트
            const savedPoints = localStorage.getItem(STORAGE_KEYS.POINTS);
            setPoints(savedPoints ? parseInt(savedPoints) : 0);

            // 히스토리
            const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
            setHistory(savedHistory ? JSON.parse(savedHistory) : []);

            // 게임 히스토리
            const savedGameHistory = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
            if (savedGameHistory) {
                const parsed = JSON.parse(savedGameHistory);
                const today = new Date().toDateString();
                const todayGames = parsed.filter((item: GameHistory) => item.date === today);
                setGameHistory(todayGames);
                setDailyGamesRemaining(Math.max(0, 10 - todayGames.length));
            } else {
                setGameHistory([]);
                setDailyGamesRemaining(10);
            }
        } catch (err) {
            console.error('Failed to load guest data:', err);
            setError('게스트 데이터 로드 실패');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 로그인 모드: Supabase에서 데이터 로드
    const loadUserData = useCallback(async () => {
        try {
            setIsLoading(true);
            
            // 포인트 & 히스토리
            const [userPoints, pointHistory, gameData] = await Promise.all([
                pointService.getUserPoints(userId),
                pointService.getPointHistory(userId),
                gameService.getTodayGamePlays(userId)
            ]);

            setPoints(userPoints);
            setHistory(pointHistory);
            setGameHistory(gameData.history);
            setDailyGamesRemaining(Math.max(0, 10 - gameData.count));
        } catch (err) {
            console.error('Failed to load user data:', err);
            setError('사용자 데이터 로드 실패');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // 초기 데이터 로드
    useEffect(() => {
        if (isGuest) {
            loadGuestData();
        } else {
            loadUserData();
        }
    }, [isGuest, loadGuestData, loadUserData]);

    // 포인트 추가
    const addPoints = useCallback(async (amount: number, reason: string) => {
        try {
            if (isGuest) {
                // 게스트: localStorage 업데이트
                const newPoints = points + amount;
                setPoints(newPoints);
                localStorage.setItem(STORAGE_KEYS.POINTS, newPoints.toString());

                const newHistoryItem: PointHistory = {
                    date: new Date().toISOString(),
                    reason,
                    amount
                };
                const newHistory = [newHistoryItem, ...history];
                setHistory(newHistory);
                localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
            } else {
                // 로그인: Supabase 업데이트
                const newPoints = await pointService.addPoints(userId, amount, reason);
                setPoints(newPoints);
                
                // 히스토리 새로고침
                const newHistory = await pointService.getPointHistory(userId);
                setHistory(newHistory);
            }
        } catch (err) {
            console.error('Failed to add points:', err);
            throw err;
        }
    }, [isGuest, points, history, userId]);

    // 게임 기록
    const recordGame = useCallback(async (gameType: string, brandId?: string) => {
        try {
            const newGameItem: GameHistory = {
                date: new Date().toDateString(),
                gameType: gameType as any
            };

            if (isGuest) {
                // 게스트: localStorage 업데이트
                const allGames = [...gameHistory, newGameItem];
                setGameHistory(allGames);
                localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(allGames));
                setDailyGamesRemaining(Math.max(0, 10 - allGames.length));
            } else {
                // 로그인: Supabase 업데이트
                await gameService.recordGameCompletion(userId, gameType as any, brandId);
                const gameData = await gameService.getTodayGamePlays(userId);
                setGameHistory(gameData.history);
                setDailyGamesRemaining(Math.max(0, 10 - gameData.count));
            }
        } catch (err) {
            console.error('Failed to record game:', err);
            throw err;
        }
    }, [isGuest, gameHistory, userId]);

    // 데이터 새로고침
    const refreshData = useCallback(async () => {
        if (isGuest) {
            loadGuestData();
        } else {
            await loadUserData();
        }
    }, [isGuest, loadGuestData, loadUserData]);

    return {
        points,
        history,
        gameHistory,
        dailyGamesRemaining,
        isLoading,
        error,
        addPoints,
        recordGame,
        refreshData
    };
};

import { useState, useEffect, useCallback } from 'react';
import type { Brand, GameType } from '../types';
import { usePoints } from '../context/PointsContext';
import { markBrandAsCompleted } from '../data/brands';

interface UseGameOptions {
    brand: Brand | null;
    gameType: GameType;
    onBack: () => void;
}

export const useGame = ({ brand, gameType, onBack }: UseGameOptions) => {
    const { addPoints, recordGameCompletion } = usePoints();
    const [gameCompleted, setGameCompleted] = useState(false);

    // 게임 도중 페이지를 떠날 때 횟수 차감 (뒤로가기 등)
    useEffect(() => {
        if (!brand || gameCompleted) return;

        return () => {
            if (!gameCompleted) {
                recordGameCompletion(gameType, brand.id);
            }
        };
    }, [brand, gameCompleted, gameType, recordGameCompletion]);

    // 게임 완료 핸들러
    const handleComplete = useCallback((earnedPoints: number) => {
        if (!brand || gameCompleted) return;
        
        const gameTypeName = gameType === 'wordle' ? '워들 게임' : '사과 게임';
        
        // 게임 완료 시점에 횟수 차감
        recordGameCompletion(gameType, brand.id);
        setGameCompleted(true);
        
        if (earnedPoints > 0) {
            addPoints(earnedPoints, `${brand.name} ${gameTypeName} 완료`);
            // 포인트를 받았을 때만 퀴즈 완료로 기록
            markBrandAsCompleted(brand.id);
        }
    }, [brand, gameCompleted, gameType, recordGameCompletion, addPoints]);

    return {
        handleComplete,
        handleBack: onBack,
        gameCompleted
    };
};

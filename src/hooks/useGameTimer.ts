import { useState, useEffect } from 'react';

interface UseGameTimerReturn {
    nextResetTime: Date | null;
    timeRemaining: string;
    isNewDay: boolean;
}

/**
 * 24시간 게임 리셋 타이머 관리
 */
export const useGameTimer = (): UseGameTimerReturn => {
    const [nextResetTime, setNextResetTime] = useState<Date | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<string>('');

    useEffect(() => {
        const calculateNextReset = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            return tomorrow;
        };

        setNextResetTime(calculateNextReset());
    }, []);

    useEffect(() => {
        if (!nextResetTime) {
            setTimeRemaining('');
            return;
        }

        const updateTimer = () => {
            const now = new Date().getTime();
            const resetTime = new Date(nextResetTime).getTime();
            const distance = resetTime - now;

            if (distance < 0) {
                // 자정이 지나면 새로운 리셋 시간 계산
                const newResetTime = new Date(nextResetTime);
                newResetTime.setDate(newResetTime.getDate() + 1);
                setNextResetTime(newResetTime);
                setTimeRemaining('');
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeRemaining(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [nextResetTime]);

    // 새로운 날인지 확인
    const isNewDay = () => {
        if (!nextResetTime) return false;
        return new Date().getTime() >= new Date(nextResetTime).getTime();
    };

    return {
        nextResetTime,
        timeRemaining,
        isNewDay: isNewDay()
    };
};

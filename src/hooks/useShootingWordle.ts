import { useState, useEffect, useCallback, useRef } from 'react';

export type GameState = 'idle' | 'playing' | 'success' | 'fail';

interface Projectile {
    id: number;
    x: number;
    y: number;
    row: number;
}

interface ShootingWordleOptions {
    targetWord: string;
    onComplete: (points: number) => void;
    duration?: number;
}

export const useShootingWordle = ({ targetWord, onComplete, duration = 60 }: ShootingWordleOptions) => {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [timeLeft, setTimeLeft] = useState(duration);
    const [currentStep, setCurrentStep] = useState(0);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const [cannonX] = useState(50);
    const [hitEffect, setHitEffect] = useState<{ x: number, y: number } | null>(null);

    const targetChars = targetWord.split('');
    const gameLoopRef = useRef<number | null>(null);
    const lastProjectileId = useRef(0);

    const startGame = useCallback(() => {
        setGameState('playing');
        setTimeLeft(duration);
        setCurrentStep(0);
        setProjectiles([]);
    }, [duration]);

    const lastFireTime = useRef(0);
    const FIRE_COOLDOWN = 300;

    const fireProjectile = useCallback(() => {
        if (gameState !== 'playing') return;

        const now = Date.now();
        if (now - lastFireTime.current < FIRE_COOLDOWN) return;
        lastFireTime.current = now;

        lastProjectileId.current += 1;
        const newProjectile: Projectile = {
            id: lastProjectileId.current,
            x: cannonX,
            y: 90,
            row: -1
        };
        setProjectiles((prev) => [...prev, newProjectile]);
    }, [cannonX, gameState]);

    // Game Loop for projectiles
    useEffect(() => {
        if (gameState !== 'playing') return;

        const update = () => {
            setProjectiles((prev) => {
                const updated = prev
                    .map((p) => ({ ...p, y: p.y - 2.4 }))
                    .filter((p) => p.y > 0);
                return updated;
            });
            gameLoopRef.current = requestAnimationFrame(update);
        };

        gameLoopRef.current = requestAnimationFrame(update);
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState]);

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setGameState('fail');
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);

    const checkHit = useCallback((projectileId: number, charX: number, row: number, char: string, charY: number) => {
        if (gameState !== 'playing') return;

        const targetChar = targetChars[currentStep];
        if (char === targetChar && row === currentStep) {
            setProjectiles((prev) => prev.filter((p) => p.id !== projectileId));

            // 글자의 실제 위치(Y)에서 터지도록 수정
            setHitEffect({ x: charX, y: charY });
            setTimeout(() => setHitEffect(null), 500);

            if (currentStep + 1 === targetChars.length) {
                // 마지막 글자: 먼저 currentStep을 증가시켜 초록불 표시 후 성공 처리
                setCurrentStep((prev) => prev + 1);
                setTimeout(() => {
                    setGameState('success');
                    onComplete(5);
                }, 400); // 초록불 보여줄 시간
            } else {
                setCurrentStep((prev) => prev + 1);
            }
        }
    }, [currentStep, gameState, onComplete, targetChars]);

    return {
        gameState,
        timeLeft,
        currentStep,
        projectiles,
        startGame,
        fireProjectile,
        checkHit,
        hitEffect,
        targetChars
    };
};

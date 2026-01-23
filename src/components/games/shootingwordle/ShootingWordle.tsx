import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Target, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShootingWordle } from '../../../hooks/useShootingWordle';
import { ShootingWordleHelpModal } from './modals/ShootingWordleHelpModal';
import { ShootingWordleSuccessModal } from './modals/ShootingWordleSuccessModal';
import { ShootingWordleFailModal } from './modals/ShootingWordleFailModal';
import { ShootingWordleMissionModal } from './modals/ShootingWordleMissionModal';
import { usePoints } from '../../../context/PointsContext';
import type { Brand } from '../../../data/brands';

interface ShootingWordleProps {
    brand: Brand;
    onComplete: (points: number) => void;
    onBack: () => void;
    onDeductPlay: () => void;
}

const ExplosionEffect: React.FC<{ x: number, y: number, isSuccess: boolean }> = ({ x, y, isSuccess }) => {
    const particleCount = 12;
    const particles = Array.from({ length: particleCount });
    const color = isSuccess ? '#28c52d' : '#ff6b6b';

    return (
        <div className="absolute pointer-events-none z-50" style={{ left: `${x}%`, top: `${y}%` }}>
            <AnimatePresence>
                {/* Main Burst */}
                <motion.div
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute size-10 rounded-full blur-md"
                    style={{ backgroundColor: color, transform: 'translate(-50%, -50%)' }}
                />
                {/* Particles */}
                {particles.map((_, i) => {
                    const angle = (i * 360) / particleCount;
                    const distance = 60 + Math.random() * 40;
                    const destX = Math.cos((angle * Math.PI) / 180) * distance;
                    const destY = Math.sin((angle * Math.PI) / 180) * distance;

                    return (
                        <motion.div
                            key={i}
                            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                            animate={{ x: destX, y: destY, scale: 0, opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute size-3 rounded-full shadow-sm"
                            style={{ backgroundColor: color, transform: 'translate(-50%, -50%)' }}
                        />
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

const ShootingWordle: React.FC<ShootingWordleProps> = ({ brand, onComplete, onBack, onDeductPlay }) => {
    const { addPoints } = usePoints();
    const {
        gameState,
        timeLeft,
        currentStep,
        projectiles,
        startGame,
        fireProjectile,
        checkHit,
        hitEffect,
        targetChars
    } = useShootingWordle({
        targetWord: brand.shootingWordleAnswer,
        onComplete: (pts) => onComplete(pts),
        duration: 60
    });

    const [showHelp, setShowHelp] = useState(false);
    const [showMission, setShowMission] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Stable character generation and row parameters
    const stableRowData = useMemo(() => {
        const charPool = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하', '거', '너', '더', '러', '머', '버', '서', '어', '저', '처', '커', '터', '퍼', '허'];

        return targetChars.map((targetChar, idx) => {
            let availablePool = charPool.filter(c => c !== targetChar);
            const shuffledPool = [...availablePool].sort(() => Math.random() - 0.5);
            const rowElements = [targetChar, ...shuffledPool.slice(0, 11)];
            const characters = rowElements.sort(() => Math.random() - 0.5);

            return {
                characters,
                speed: 8 + (idx % 3), // 더욱 느리게! (숫자가 클수록 느려짐)
                delay: -(idx * 0.5) // delay를 줄여서 자연스럽게
            };
        });
    }, [brand.shootingWordleAnswer]); // targetChars 대신 정답 문자열 직접 감지

    const handleAction = () => {
        if (gameState === 'playing') {
            fireProjectile();
        }
    };

    const handleMissionSubmit = (userAnswer: string): boolean => {
        if (userAnswer === brand.placeQuiz.answer) {
            addPoints(5, `${brand.name} 슈팅 추가 미션 완료`);
            return true;
        }
        return false;
    };

    const progress = (timeLeft / 60) * 100;
    const fixedCannonX = 50;

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-screen bg-gradient-to-b from-[#f5e6d3] to-[#ffcccb] overflow-hidden relative touch-none select-none"
            onClick={handleAction}
        >
            <header className="flex items-center justify-between px-4 py-3 z-30">
                <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="bg-white flex items-center gap-2 rounded-full px-3 h-[44px]">
                        <div className="bg-[#ff5656] rounded-full size-[30px] flex items-center justify-center">
                            <span className="text-white text-[18px]">⏱</span>
                        </div>
                        <p className="text-[18px] text-gray-800 font-bold min-w-[30px]">{timeLeft}</p>
                    </div>

                    <div className="bg-white/80 w-[100px] h-[12px] rounded-full overflow-hidden shadow-inner border border-white/50">
                        <motion.div
                            className="h-full bg-[#ff5656]"
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <button
                    onClick={() => setShowHelp(true)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                    <HelpCircle size={28} className="text-gray-700" />
                </button>
            </header>

            <div className="flex justify-center gap-2.5 p-4 z-20">
                {targetChars.map((char, i) => (
                    <div
                        key={i}
                        className={`w-11 h-14 rounded-xl flex items-center justify-center text-[22px] font-black transition-all duration-300 shadow-md ${
                            i < currentStep
                                ? 'bg-[#28c52d] text-white scale-100'
                                : i === currentStep && gameState === 'playing'
                                    ? 'bg-[#ff6b6b] text-white animate-pulse border-2 border-white scale-110'
                                    : 'bg-white/60 text-gray-400'
                            }`}
                    >
                        {char}
                    </div>
                ))}
            </div>

            <div className="flex-1 relative overflow-hidden flex flex-col items-center pt-2 pb-24 px-0">
                <AnimatePresence mode="popLayout">
                    {gameState !== 'success' && targetChars.map((targetChar, idx) => (
                        idx >= currentStep && (
                            <motion.div
                                key={idx}
                                layout
                                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, x: 200 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                className="w-full"
                            >
                                <ConveyorRow
                                    id={idx}
                                    targetChar={targetChar}
                                    isActive={idx === currentStep}
                                    characters={stableRowData[idx].characters}
                                    projectiles={projectiles.filter(p => {
                                        // Pass projectiles that are roughly in the top half of the arena
                                        // CharItem will handle the precise vertical collision check
                                        return idx === currentStep && p.y < 50;
                                    })}
                                    onHit={(pid, x, y, char) => checkHit(pid, x, idx, char, y)}
                                    speed={stableRowData[idx].speed}
                                    delay={stableRowData[idx].delay}
                                    direction={idx % 2 === 0 ? 'right' : 'left'}
                                />
                            </motion.div>
                        )
                    ))}
                </AnimatePresence>

                {projectiles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute w-3 h-8 bg-[#ff6b6b] rounded-full shadow-lg z-10 border-2 border-white/30"
                        style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translateX(-50%)' }}
                    />
                ))}

                <AnimatePresence>
                    {hitEffect && (
                        <ExplosionEffect
                            key={`${hitEffect.x}-${hitEffect.y}`}
                            x={hitEffect.x}
                            y={hitEffect.y}
                            isSuccess={true}
                        />
                    )}
                </AnimatePresence>
            </div>

            <div
                className="absolute bottom-12 z-20"
                style={{ left: `${fixedCannonX}%`, transform: 'translateX(-50%)' }}
            >
                <div className="relative flex flex-col items-center">
                    <div className="w-6 h-12 bg-gray-600 rounded-t-full border-x-4 border-gray-700 shadow-lg" />
                    <div className="w-20 h-10 bg-gray-800 rounded-2xl -mt-2 border-b-4 border-gray-900 shadow-xl flex items-center justify-center">
                        <div className="size-4 bg-[#ff6b6b] rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            {gameState === 'idle' && (
                <div className="absolute inset-0 bg-white flex flex-col items-center justify-between px-8 py-16 z-50">
                    <div className="w-full flex justify-between">
                        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={32} className="text-gray-700" />
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowHelp(true);
                            }} 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <HelpCircle size={32} className="text-gray-700" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <div className="bg-white p-8 rounded-[40px] shadow-2xl rotate-3 relative">
                            <Target size={120} className="text-[#ff6b6b]" />
                        </div>
                        <div className="text-center">
                            <h2 className="font-black italic text-[60px] text-[#b90000] leading-tight drop-shadow-sm">슈팅워들</h2>
                            <p className="text-[18px] text-gray-700 font-bold mt-2">브랜드 이름을 명중시키세요!</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            onDeductPlay();
                            startGame();
                        }}
                        className="bg-[#ff6b6b] h-[70px] rounded-[24px] w-full hover:bg-[#ff5252] active:scale-95 transition-all shadow-xl"
                    >
                        <span className="font-black italic text-[32px] text-white tracking-widest">시작</span>
                    </button>
                </div>
            )}

            {showHelp && <ShootingWordleHelpModal onClose={() => setShowHelp(false)} />}
            {gameState === 'success' && !showMission && (
                <ShootingWordleSuccessModal
                    onStartMission={() => setShowMission(true)}
                    onGoHome={() => { onDeductPlay(); onBack(); }}
                />
            )}
            {showMission && (
                <ShootingWordleMissionModal
                    question={brand.placeQuiz.question}
                    placeUrl={brand.placeUrl}
                    bonusPoints={5}
                    onHome={() => { onDeductPlay(); onBack(); }}
                    onSubmit={handleMissionSubmit}
                />
            )}
            {gameState === 'fail' && (
                <ShootingWordleFailModal
                    onRetry={() => { onDeductPlay(); window.location.reload(); }}
                    onGoHome={() => { onDeductPlay(); onBack(); }}
                />
            )}

            <style>{`
                @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0%); } }
                @keyframes scrollLeft { from { transform: translateX(0%); } to { transform: translateX(-50%); } }
                .conveyor-row-right { animation: scrollRight linear infinite; }
                .conveyor-row-left { animation: scrollLeft linear infinite; }
            `}</style>
        </div>
    );
};

interface Projectile {
    id: number;
    x: number;
    y: number;
    row: number;
}

interface ConveyorRowProps {
    id: number;
    targetChar: string;
    isActive: boolean;
    characters: string[];
    projectiles: Projectile[];
    onHit: (pid: number, x: number, y: number, char: string) => void;
    speed: number;
    delay: number;
    direction: 'left' | 'right';
}

const ConveyorRow: React.FC<ConveyorRowProps> = ({ id, targetChar, isActive, characters, projectiles, onHit, speed, delay, direction }) => {
    const displayChars = [...characters, ...characters];

    return (
        <div className={`relative h-16 w-full flex items-center border-y border-white/5 overflow-hidden ${isActive ? 'bg-white/40 shadow-inner' : 'opacity-20'}`}>
            <div
                className={`flex gap-6 px-4 ${direction === 'right' ? 'conveyor-row-right' : 'conveyor-row-left'} whitespace-nowrap`}
                style={{ animationDuration: `${speed}s`, animationDelay: `${delay}s` }}
            >
                {displayChars.map((char, i) => (
                    <CharItem
                        key={i}
                        char={char}
                        isActive={isActive}
                        projectiles={projectiles}
                        onHit={(pid, x, y) => onHit(pid, x, y, char)}
                    />
                ))}
            </div>
        </div>
    );
};

interface CharItemProps {
    char: string;
    isActive: boolean;
    projectiles: Projectile[];
    onHit: (pid: number, x: number, y: number) => void;
}

const CharItem: React.FC<CharItemProps> = ({ char, isActive, projectiles, onHit }) => {
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!itemRef.current || projectiles.length === 0 || !isActive) return;
        const rect = itemRef.current.getBoundingClientRect();
        const container = itemRef.current.closest('.flex-1');
        if (!container) return;
        const containerRect = container.getBoundingClientRect();

        const centerX = ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100;
        const boxWidthPercent = (rect.width / containerRect.width) * 100;

        // Vertical hit zone in container percentage
        const boxTop = ((rect.top - containerRect.top) / containerRect.height) * 100;
        const boxBottom = ((rect.bottom - containerRect.top) / containerRect.height) * 100;
        const centerY = (boxTop + boxBottom) / 2; // 글자의 중심 Y 위치

        projectiles.forEach(p => {
            // Precise hit detection: projectile center must be within X bounds (+ buffer) AND Y bounds
            // Increased horizontal tolerance slightly per user request
            const toleranceBuffer = 0.8;
            const halfBox = (boxWidthPercent / 2) + toleranceBuffer;
            const isInsideX = Math.abs(p.x - centerX) < halfBox;
            const isInsideY = p.y >= boxTop && p.y <= boxBottom;

            if (isInsideX && isInsideY) {
                onHit(p.id, centerX, centerY); // centerY 전달
            }
        });
    }, [projectiles, onHit, isActive]);

    return (
        <div
            ref={itemRef}
            className="size-10 rounded-[12px] flex items-center justify-center text-[20px] font-black shadow-sm transition-all duration-300 bg-white text-gray-400"
        >
            {char}
        </div>
    );
};

export default ShootingWordle;

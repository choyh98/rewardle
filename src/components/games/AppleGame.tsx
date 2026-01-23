import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Brand } from '../../data/brands';
import appleImage from '../../assets/apple.png';
import { usePoints } from '../../context/PointsContext';
import { AppleHelpModal } from './apple/AppleHelpModal';
import { AppleSuccessModal } from './apple/AppleSuccessModal';
import { AppleMissionModal } from './apple/AppleMissionModal';
import { AppleFailModal } from './apple/AppleFailModal';

const MaterialSymbolsHelpRounded = () => (
    <svg className="size-full" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#666" opacity="0.9" />
        <path d="M24 34c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm1.5-6.5v-1c0-1.375.5-2.625 1.5-3.625 1-1 1.5-2.25 1.5-3.875 0-2.625-2.125-4.75-4.75-4.75S18.5 16.375 18.5 19h3c0-1.125.875-2 2-2s2 .875 2 2c0 .875-.375 1.625-1 2.25-1.25 1.25-2 2.875-2 4.75v1h3z" fill="white" />
    </svg>
);

interface AppleGameProps {
    brand: Brand;
    onComplete: (points: number) => void;
    onBack: () => void;
    onDeductPlay: () => void; // 게임 횟수 차감 콜백
}

interface Cell {
    row: number;
    col: number;
    value: number;
    syllable?: string;
    isRemoved: boolean;
}

// Start Screen Component
const StartScreen: React.FC<{ onStart: () => void; onShowHelp: () => void; onBack: () => void }> = ({ onStart, onShowHelp, onBack }) => {
    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-[#fff0db] to-[#ffbdbd] items-center justify-between px-[27px] py-[42px]">
            <div className="flex items-center justify-between w-full">
                <button onClick={onBack} className="p-2"><ArrowLeft size={24} /></button>
                <button
                    onClick={onShowHelp}
                    className="size-[48px] hover:scale-110 active:scale-95 transition-transform"
                >
                    <MaterialSymbolsHelpRounded />
                </button>
            </div>

            {/* Apple Image */}
            <div className="flex items-center justify-center">
                <img src={appleImage} alt="사과" loading="lazy" className="w-[280px] h-[280px] object-contain" />
            </div>

            {/* Title */}
            <div className="relative w-full">
                <div className="flex flex-col items-center">
                    <p className="font-black italic text-[64px] text-[#b90000] text-shadow-[3px_4px_1.3px_rgba(0,0,0,0.1)] tracking-[3.84px] leading-none">
                        사과게임
                    </p>
                </div>
            </div>

            {/* Start Button */}
            <button
                onClick={onStart}
                className="bg-[#ff6b6b] h-[62px] rounded-[17px] w-full hover:bg-[#ff5252] active:bg-[#e05555] transition-colors"
            >
                <p className="font-black italic text-[32px] text-white tracking-[1.92px]">시작</p>
            </button>
        </div>
    );
};

// Game Screen Component  
const GameScreen: React.FC<AppleGameProps & { onShowHelp: () => void }> = ({ brand, onComplete, onBack, onDeductPlay, onShowHelp }) => {
    const { addPoints } = usePoints(); // Context에서 직접 addPoints 가져오기
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(120);
    const [collectedSyllables, setCollectedSyllables] = useState<string[]>([]);
    const [selection, setSelection] = useState<Cell[]>([]);
    const [startCell, setStartCell] = useState<Cell | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [showWordComplete, setShowWordComplete] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState('');
    const [quizResult, setQuizResult] = useState<{ correct: boolean } | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState(false); // 퀴즈 제출 여부 추적
    const [hintCells, setHintCells] = useState<Cell[]>([]); // 힌트로 빛나는 셀들
    const [lastMoveTime, setLastMoveTime] = useState<number>(Date.now()); // 마지막 움직임 시간
    const [gameCompleted, setGameCompleted] = useState(false);
    const [lastRevealScore, setLastRevealScore] = useState(0);
    const [flyingSyllables, setFlyingSyllables] = useState<Array<{ syllable: string; id: number; fromX: number; fromY: number }>>([]); 
    const [gridScale, setGridScale] = useState(1); // 보드판 확대/축소

    const targetSyllables = brand.appleGameWord.split('');

    useEffect(() => {
        const newGrid: Cell[][] = [];
        const syllablesToPlace = [...targetSyllables];

        // 빈 그리드 먼저 생성 (임시로 0으로 채움)
        for (let r = 0; r < 12; r++) {
            const row: Cell[] = [];
            for (let c = 0; c < 8; c++) {
                row.push({
                    row: r,
                    col: c,
                    value: 0,
                    isRemoved: false
                });
            }
            newGrid.push(row);
        }

        // 음절 배치 - 전체 그리드에 랜덤하게 배치 (초기에는 숨김)
        const syllablePositions: Array<{ row: number; col: number }> = [];
        syllablesToPlace.forEach(s => {
            let placed = false;
            while (!placed) {
                const r = Math.floor(Math.random() * 12); // 전체 행 사용
                const c = Math.floor(Math.random() * 8);
                if (!newGrid[r][c].syllable) {
                    newGrid[r][c].syllable = s;
                    syllablePositions.push({ row: r, col: c });
                    placed = true;
                }
            }
        });

        // 숫자 배치 - 난이도 조정 (합이 10이 나올 확률 더욱 증가)
        const numbers: number[] = [];
        const numberPairs = [
            { num: 5, count: 24 },  // 5+5=10 (더 증가!)
            { num: 4, count: 16 },  // 4+6=10 (더 증가!)
            { num: 6, count: 16 },  // 6+4=10 (더 증가!)
            { num: 3, count: 10 },  // 3+7=10
            { num: 7, count: 10 },  // 7+3=10
            { num: 2, count: 6 },   // 2+8=10
            { num: 8, count: 6 },   // 8+2=10
            { num: 1, count: 2 },   // 1+9=10 (더 감소)
            { num: 9, count: 2 }    // 9+1=10 (더 감소)
        ];

        numberPairs.forEach(({ num, count }) => {
            for (let i = 0; i < count; i++) {
                numbers.push(num);
            }
        });

        // 배열 섞기
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        // 모든 칸에 숫자 채우기
        let numberIndex = 0;
        for (let r = 0; r < 12; r++) {
            for (let c = 0; c < 8; c++) {
                if (numberIndex < numbers.length) {
                    newGrid[r][c].value = numbers[numberIndex++];
                } else {
                    // 숫자가 모자라면 5로 채우기
                    newGrid[r][c].value = 5;
                }
            }
        }

        setGrid(newGrid);
    }, [brand]);

    useEffect(() => {
        if (timeLeft > 0 && !isFinished) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isFinished && !gameCompleted && !showQuiz) {
            // 퀴즈 중이 아닐 때만 시간 종료 처리
            setIsFinished(true);
            setGameCompleted(true);
            
            // 글자를 다 모았는지 확인
            const allSyllablesCollected = targetSyllables.every(ts =>
                collectedSyllables.filter(cs => cs === ts).length >= targetSyllables.filter(s => s === ts).length
            );
            
            // 글자를 다 모았으면 5P, 1개라도 못 모았으면 0P
            onComplete(allSyllablesCollected ? 5 : 0);
        }
    }, [timeLeft, isFinished, gameCompleted, onComplete, collectedSyllables, targetSyllables, showQuiz]);

    // 20초 동안 움직임이 없으면 힌트 제공
    useEffect(() => {
        if (isFinished || grid.length === 0) return;

        const hintTimer = setTimeout(() => {
            // 합이 10이 되는 셀 조합 찾기
            const foundHint = findHintCombination();
            if (foundHint) {
                setHintCells(foundHint);
                // 3초 후 힌트 자동 제거
                setTimeout(() => {
                    setHintCells([]);
                }, 3000);
            }
        }, 20000); // 20초 후 힌트 표시

        return () => clearTimeout(hintTimer);
    }, [lastMoveTime, isFinished, grid]);

    // 합이 10이 되는 조합 찾기
    const findHintCombination = (): Cell[] | null => {
        for (let r1 = 0; r1 < grid.length; r1++) {
            for (let c1 = 0; c1 < grid[r1].length; c1++) {
                const cell1 = grid[r1][c1];
                if (cell1.isRemoved) continue;

                // 같은 행이나 열, 또는 직사각형 영역에서 합이 10이 되는 조합 찾기
                for (let r2 = 0; r2 < grid.length; r2++) {
                    for (let c2 = 0; c2 < grid[r2].length; c2++) {
                        const minRow = Math.min(r1, r2);
                        const maxRow = Math.max(r1, r2);
                        const minCol = Math.min(c1, c2);
                        const maxCol = Math.max(c1, c2);

                        const cells: Cell[] = [];
                        let sum = 0;

                        for (let r = minRow; r <= maxRow; r++) {
                            for (let c = minCol; c <= maxCol; c++) {
                                const cell = grid[r][c];
                                if (!cell.isRemoved) {
                                    cells.push(cell);
                                    sum += cell.value;
                                }
                            }
                        }

                        if (sum === 10 && cells.length > 0) {
                            return cells;
                        }
                    }
                }
            }
        }
        return null;
    };

    const handleStart = (cell: Cell) => {
        if (isFinished || cell.isRemoved) return;
        setIsSelecting(true);
        setStartCell(cell);
        setSelection([cell]);
    };

    const handleEnter = (cell: Cell) => {
        if (!isSelecting || isFinished || !startCell) return;
        if (cell.isRemoved) return;

        // 같은 셀이면 시작 셀만 선택
        if (startCell.row === cell.row && startCell.col === cell.col) {
            setSelection([startCell]);
            return;
        }

        // 시작점과 현재 셀로 직사각형 영역의 모든 셀 선택
        const minRow = Math.min(startCell.row, cell.row);
        const maxRow = Math.max(startCell.row, cell.row);
        const minCol = Math.min(startCell.col, cell.col);
        const maxCol = Math.max(startCell.col, cell.col);

        const newSelection: Cell[] = [];
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (grid[r] && grid[r][c]) {
                    const targetCell = grid[r][c];
                    if (!targetCell.isRemoved) {
                        newSelection.push(targetCell);
                    }
                }
            }
        }

        // 최소 1개 이상의 셀이 선택되어야 함
        if (newSelection.length > 0) {
            setSelection(newSelection);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSelecting) return;

        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element) {
            const cellDiv = element.closest('[data-row]');
            if (cellDiv) {
                const row = cellDiv.getAttribute('data-row');
                const col = cellDiv.getAttribute('data-col');
                if (row !== null && col !== null) {
                    const cell = grid[parseInt(row)][parseInt(col)];
                    if (cell && !cell.isRemoved) {
                        handleEnter(cell);
                    }
                }
            }
        }
    };

    const handleEnd = useCallback(() => {
        if (!isSelecting) return;
        setIsSelecting(false);
        setStartCell(null);

        const sum = selection.reduce((acc, c) => acc + c.value, 0);
        if (sum === 10) {
            const newGrid = [...grid];
            const newSyllables = [...collectedSyllables];
            const newFlying: Array<{ syllable: string; id: number; fromX: number; fromY: number }> = [];

            selection.forEach(c => {
                newGrid[c.row][c.col].isRemoved = true;
                if (c.syllable) {
                    newSyllables.push(c.syllable);
                    
                    // 애니메이션용 위치 계산
                    const cellElement = document.querySelector(`[data-row="${c.row}"][data-col="${c.col}"]`);
                    if (cellElement) {
                        const rect = cellElement.getBoundingClientRect();
                        newFlying.push({
                            syllable: c.syllable,
                            id: Date.now() + Math.random(),
                            fromX: rect.left + rect.width / 2,
                            fromY: rect.top + rect.height / 2
                        });
                    }
                }
            });

            // 날아가는 애니메이션 시작
            if (newFlying.length > 0) {
                setFlyingSyllables(prev => [...prev, ...newFlying]);
                setTimeout(() => {
                    setFlyingSyllables(prev => prev.filter(f => !newFlying.find(nf => nf.id === f.id)));
                }, 800);
            }

            const newScore = score + selection.length;
            setGrid(newGrid);
            setScore(newScore);
            setCollectedSyllables(newSyllables);
            setHintCells([]); // 정답을 맞췄으므로 힌트 제거
            setLastMoveTime(Date.now()); // 타이머 리셋

            // 4점마다 확률로 글자 자동 획득 (점수에 따라 확률 증가)
            if (Math.floor(newScore / 4) > Math.floor(lastRevealScore / 4)) {
                setLastRevealScore(newScore);
                
                // 아직 획득하지 않은 글자들 찾기
                const remainingSyllables = targetSyllables.filter((ts, idx) => 
                    collectedSyllables.filter(cs => cs === ts).length < targetSyllables.filter((s, i) => s === ts && i <= idx).length
                );

                // 점수에 따라 확률 증가: 20점 미만 30%, 20점 이상 60%
                let probability = 0.3; // 기본 30%
                if (newScore >= 20) {
                    probability = 0.6; // 60%
                }

                // 확률에 따라 글자 하나 자동 획득
                if (remainingSyllables.length > 0 && Math.random() < probability) {
                    const randomSyllable = remainingSyllables[Math.floor(Math.random() * remainingSyllables.length)];
                    newSyllables.push(randomSyllable);
                    setCollectedSyllables(newSyllables);
                    
                    // 화면 중앙에서 글자 모으기 칸으로 날아가는 애니메이션
                    const flyingItem = {
                        syllable: randomSyllable,
                        id: Date.now() + Math.random(),
                        fromX: window.innerWidth / 2,
                        fromY: window.innerHeight / 2
                    };
                    setFlyingSyllables(prev => [...prev, flyingItem]);
                    setTimeout(() => {
                        setFlyingSyllables(prev => prev.filter(f => f.id !== flyingItem.id));
                    }, 800);
                }
            }

            const allDone = targetSyllables.every(ts =>
                newSyllables.filter(ns => ns === ts).length >= targetSyllables.filter(s => s === ts).length
            );
            if (allDone && !showWordComplete && !gameCompleted && !isFinished) {
                setShowWordComplete(true);
                setGameCompleted(true); // 게임 완료 마킹
                setIsFinished(true); // 타이머 중지
                onComplete(5); // 5P 즉시 지급
            }
        } else {
            // 합이 10이 아니면 선택만 초기화 (보드 안 깨짐)
            setLastMoveTime(Date.now());
        }
        setSelection([]);
    }, [isSelecting, selection, grid, collectedSyllables, targetSyllables, showWordComplete, score, lastRevealScore, gameCompleted, onComplete]);

    const handleQuizSubmit = () => {
        // 성공했으면 중복 방지 (실패는 다시 시도 가능)
        if (quizSubmitted && quizResult?.correct) return;
        
        const correct = quizAnswer.trim() === brand.placeQuiz.answer;
        if (correct) {
            setQuizSubmitted(true);
            setIsFinished(true); // 타이머 중지
            addPoints(5, `${brand.name} 사과 추가 미션 완료`); // 사과 추가미션 5P
            setQuizResult({ correct });
        } else {
            // 실패 시 인라인 메시지만 표시 (워들 게임처럼)
            setQuizResult({ correct: false });
            setQuizAnswer(''); // 입력값 초기화
            setTimeout(() => setQuizResult(null), 2000); // 2초 후 메시지 숨김
        }
    };

    const progress = ((120 - timeLeft) / 120) * 100;

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-[#f5e6d3] to-[#ffcccb] overflow-hidden relative touch-none" onMouseUp={handleEnd} onTouchEnd={handleEnd} onTouchMove={handleTouchMove}>
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-2.5">
                <button onClick={onBack} className="p-2"><ArrowLeft size={24} /></button>
                <div className="flex items-center gap-2.5">
                    {/* Timer */}
                    <div className="bg-white flex items-center gap-2 rounded-full px-2.5 h-[44px] shadow-sm">
                        <div className="bg-[#FF5656] rounded-full size-[32px] flex items-center justify-center">
                            <span className="text-white text-[20px]">⏱</span>
                        </div>
                        <p className="text-[18px] text-black font-semibold pr-2">{timeLeft}</p>
                    </div>
                    {/* Score */}
                    <div className="bg-white flex items-center gap-0.5 rounded-full pl-1 pr-2.5 h-[44px] shadow-sm">
                        <img src={appleImage} alt="" loading="lazy" className="w-[60px] h-[60px] object-contain -ml-2" />
                        <p className="text-[18px] text-black font-semibold">{score}</p>
                    </div>
                </div>
                {/* Help button */}
                <button
                    onClick={onShowHelp}
                    className="size-[44px] hover:scale-110 active:scale-95 transition-transform"
                >
                    <MaterialSymbolsHelpRounded />
                </button>
            </header>

            {/* Progress Bar */}
            <div className="px-4 pb-3">
                <div className="bg-white h-[12px] rounded-full overflow-hidden relative shadow-sm">
                    <div
                        className="absolute bg-[#ff5656] h-full left-0 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Syllable Tracker */}
            <div className="px-4 pb-3 flex items-center justify-center gap-2">
                <div className="syllable-tracker bg-white/90 rounded-[14px] px-3.5 py-2 flex items-center gap-2 shadow-sm">
                    <span className="font-bold text-[12px] text-[#666]">글자 모으기:</span>
                    <div className="flex gap-1">
                        {targetSyllables.map((s, i) => {
                            const syllableIndex = targetSyllables.slice(0, i + 1).filter(ts => ts === s).length;
                            const collectedCount = collectedSyllables.filter(cs => cs === s).length;
                            const isRevealed = collectedCount >= syllableIndex;

                            return (
                                <div
                                    key={i}
                                    className={`w-[26px] h-[30px] rounded-[6px] flex items-center justify-center transition-all ${isRevealed ? 'bg-[#4a90e2] text-white' : 'bg-[#e5e5e5]'
                                        }`}
                                >
                                    {isRevealed && <span className="font-bold text-[14px]">{s}</span>}
                                </div>
                            );
                        })}
                    </div>
                    <span className="text-[11px] text-[#999]">
                        ({collectedSyllables.length}/{brand.appleGameWord.length})
                    </span>
                </div>
                
                {/* 확대/축소 버튼 */}
                <div className="flex gap-1 bg-white/90 rounded-[14px] px-2 py-2 shadow-sm">
                    <button
                        onClick={() => setGridScale(prev => Math.max(0.8, prev - 0.1))}
                        className="bg-[#ff6b6b] text-white font-bold rounded-[6px] size-[26px] flex items-center justify-center active:scale-95 transition-transform"
                        disabled={gridScale <= 0.8}
                    >
                        <span className="text-[16px]">-</span>
                    </button>
                    <button
                        onClick={() => setGridScale(prev => Math.min(1.2, prev + 0.1))}
                        className="bg-[#ff6b6b] text-white font-bold rounded-[6px] size-[26px] flex items-center justify-center active:scale-95 transition-transform"
                        disabled={gridScale >= 1.2}
                    >
                        <span className="text-[16px]">+</span>
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 flex items-center justify-center px-4 pt-2 pb-4 overflow-hidden">
                <div 
                    className="flex flex-col gap-[5px] transition-transform duration-200 origin-center"
                    style={{ transform: `scale(${gridScale})` }}
                >
                    {grid.map((row) => (
                        <div key={row[0]?.row} className="flex gap-[5px]">
                            {row.map((cell) => {
                                const isSelected = selection.some(s => s.row === cell.row && s.col === cell.col);
                                const isHint = hintCells.some(h => h.row === cell.row && h.col === cell.col);

                                return (
                                    <div
                                        key={`${cell.row}-${cell.col}`}
                                        onMouseDown={() => handleStart(cell)}
                                        onMouseEnter={() => handleEnter(cell)}
                                        onTouchStart={() => handleStart(cell)}
                                        data-row={cell.row}
                                        data-col={cell.col}
                                        className={`relative rounded-[10px] size-[36px] transition-all select-none overflow-hidden ${cell.isRemoved ? 'opacity-0' : 'cursor-pointer'
                                            } ${isSelected ? 'bg-[#ffd700] ring-2 ring-[#ff6b6b] scale-110' : isHint ? 'bg-[#ffd700] ring-2 ring-yellow-400 animate-pulse' : 'bg-white shadow-sm'
                                            }`}
                                    >
                                        {!cell.isRemoved && (
                                            <>
                                                {/* 사과 배경 이미지 */}
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <img src={appleImage} alt="" loading="lazy" className="w-full h-full object-cover" />
                                                </div>
                                                {/* 숫자 */}
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="font-black text-[20px] text-white relative z-10" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                                        {cell.value}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Flying Syllables Animation */}
            {flyingSyllables.map((flying) => {
                // 글자 모으기 칸의 위치 계산
                const targetElement = document.querySelector('.syllable-tracker');
                const targetRect = targetElement?.getBoundingClientRect();
                const toX = targetRect ? targetRect.left + targetRect.width / 2 : window.innerWidth / 2;
                const toY = targetRect ? targetRect.top + targetRect.height / 2 : 100;

                return (
                    <div
                        key={flying.id}
                        className="fixed pointer-events-none z-[100]"
                        style={{
                            left: flying.fromX,
                            top: flying.fromY,
                            animation: `flyToTarget 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                            '--target-x': `${toX - flying.fromX}px`,
                            '--target-y': `${toY - flying.fromY}px`,
                        } as React.CSSProperties}
                    >
                        <div className="bg-[#ff6b6b] rounded-full size-[32px] flex items-center justify-center shadow-lg">
                            <span className="font-bold text-[18px] text-white">{flying.syllable}</span>
                        </div>
                    </div>
                );
            })}

            {/* Word Complete Popup */}
            {showWordComplete && (
                <AppleSuccessModal
                    onStartMission={() => {
                        setShowWordComplete(false);
                        setShowQuiz(true);
                    }}
                    onGoHome={() => {
                        onDeductPlay();
                        onBack();
                    }}
                />
            )}

            {/* Quiz Popup */}
            {showQuiz && (
                <AppleMissionModal
                    brand={brand}
                    quizAnswer={quizAnswer}
                    quizResult={quizResult}
                    onAnswerChange={setQuizAnswer}
                    onSubmit={handleQuizSubmit}
                    onGoHome={() => {
                        onDeductPlay();
                        onBack();
                    }}
                />
            )}

            {/* Game Over */}
            {isFinished && !showWordComplete && !showQuiz && (
                <AppleFailModal
                    score={score}
                    onRetry={() => {
                        onDeductPlay();
                        window.location.reload();
                    }}
                    onGoHome={() => {
                        onDeductPlay();
                        onBack();
                    }}
                />
            )}
        </div>
    );
};

// Main Component
const AppleGame: React.FC<AppleGameProps> = ({ brand, onComplete, onBack, onDeductPlay }) => {
    const [gameState, setGameState] = useState<'start' | 'playing'>('start');
    const [showHelp, setShowHelp] = useState(false);

    return (
        <>
            {gameState === 'start' && (
                <StartScreen
                    onStart={() => setGameState('playing')}
                    onShowHelp={() => setShowHelp(true)}
                    onBack={onBack}
                />
            )}
            {gameState === 'playing' && (
                <GameScreen
                    brand={brand}
                    onComplete={onComplete}
                    onBack={onBack}
                    onDeductPlay={onDeductPlay}
                    onShowHelp={() => setShowHelp(true)}
                />
            )}
            {showHelp && <AppleHelpModal onClose={() => setShowHelp(false)} />}
        </>
    );
};

export default AppleGame;

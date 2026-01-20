import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { Brand } from '../../data/brands';
import appleImage from '../../assets/apple.png';
import { usePoints } from '../../context/PointsContext';

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
                <img src={appleImage} alt="사과" className="w-[280px] h-[280px] object-contain" />
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
const GameScreen: React.FC<AppleGameProps & { onShowHelp: () => void }> = ({ brand, onComplete, onBack, onShowHelp }) => {
    const { addPoints } = usePoints(); // Context에서 직접 addPoints 가져오기
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(120);
    const [collectedSyllables, setCollectedSyllables] = useState<string[]>([]);
    const [selection, setSelection] = useState<Cell[]>([]);
    const [startCell, setStartCell] = useState<Cell | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isStunned, setIsStunned] = useState(false);
    const [showWordComplete, setShowWordComplete] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState('');
    const [showQuizResult, setShowQuizResult] = useState(false);
    const [quizResult, setQuizResult] = useState<{ correct: boolean } | null>(null);
    const [hintCells, setHintCells] = useState<Cell[]>([]); // 힌트로 빛나는 셀들
    const [lastMoveTime, setLastMoveTime] = useState<number>(Date.now()); // 마지막 움직임 시간
    const [gameCompleted, setGameCompleted] = useState(false); // 게임 완료 여부 추적

    const targetSyllables = brand.appleGameWord.split('');

    useEffect(() => {
        const newGrid: Cell[][] = [];
        const syllablesToPlace = [...targetSyllables];

        // 숫자를 균등하게 분배하기 위한 배열 생성 (합이 10이 되는 조합 강화)
        const numbers: number[] = [];
        const totalCells = 12 * 8; // 96 cells
        
        // 합이 10이 되는 쌍: (1,9), (2,8), (3,7), (4,6), (5,5)
        // 이 숫자들을 조금 더 많이 배치 (자연스럽게)
        const easyPairs = [
            { num: 5, count: 13 },  // 5+5=10 (가장 쉬움)
            { num: 4, count: 12 },  // 4+6=10
            { num: 6, count: 12 },  // 6+4=10
            { num: 3, count: 11 },  // 3+7=10
            { num: 7, count: 11 },  // 7+3=10
            { num: 2, count: 10 },  // 2+8=10
            { num: 8, count: 10 },  // 8+2=10
            { num: 1, count: 9 },   // 1+9=10
            { num: 9, count: 9 }    // 9+1=10
        ];

        // 숫자 배열 생성
        easyPairs.forEach(({ num, count }) => {
            for (let i = 0; i < count; i++) {
                numbers.push(num);
            }
        });

        // 남은 칸이 있으면 랜덤하게 채우기
        while (numbers.length < totalCells) {
            numbers.push(Math.floor(Math.random() * 9) + 1);
        }

        // 배열을 섞기 (Fisher-Yates shuffle) - 티 안나게
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        // 그리드 생성
        let numberIndex = 0;
        for (let r = 0; r < 12; r++) {
            const row: Cell[] = [];
            for (let c = 0; c < 8; c++) {
                row.push({
                    row: r,
                    col: c,
                    value: numbers[numberIndex++],
                    isRemoved: false
                });
            }
            newGrid.push(row);
        }

        // 음절 배치 (기존과 동일)
        syllablesToPlace.forEach(s => {
            let placed = false;
            while (!placed) {
                const r = Math.floor(Math.random() * 12);
                const c = Math.floor(Math.random() * 8);
                if (!newGrid[r][c].syllable) {
                    newGrid[r][c].syllable = s;
                    placed = true;
                }
            }
        });

        setGrid(newGrid);
    }, [brand]);

    useEffect(() => {
        if (timeLeft > 0 && !isFinished) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isFinished && !gameCompleted) {
            setIsFinished(true);
            setGameCompleted(true);
            
            // 글자를 다 모았는지 확인
            const allSyllablesCollected = targetSyllables.every(ts =>
                collectedSyllables.filter(cs => cs === ts).length >= targetSyllables.filter(s => s === ts).length
            );
            
            // 글자를 다 모았으면 성공(5P), 아니면 실패(0P)
            onComplete(allSyllablesCollected ? 5 : 0);
        }
    }, [timeLeft, isFinished, gameCompleted, onComplete, collectedSyllables, targetSyllables]);

    // 20초 동안 움직임이 없으면 힌트 제공
    useEffect(() => {
        if (isFinished || grid.length === 0) return;

        const hintTimer = setInterval(() => {
            const timeSinceLastMove = Date.now() - lastMoveTime;
            
            if (timeSinceLastMove >= 20000) { // 20초 경과
                // 합이 10이 되는 셀 조합 찾기
                const foundHint = findHintCombination();
                if (foundHint) {
                    setHintCells(foundHint);
                }
            }
        }, 1000);

        return () => clearInterval(hintTimer);
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
        if (isFinished || cell.isRemoved || isStunned) return;
        setIsSelecting(true);
        setStartCell(cell);
        setSelection([cell]);
    };

    const handleEnter = (cell: Cell) => {
        if (!isSelecting || isFinished || isStunned || !startCell) return;
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

            selection.forEach(c => {
                newGrid[c.row][c.col].isRemoved = true;
                if (c.syllable) newSyllables.push(c.syllable);
            });

            setGrid(newGrid);
            setScore(prev => prev + selection.length);
            setCollectedSyllables(newSyllables);
            setHintCells([]); // 정답을 맞췄으므로 힌트 제거
            setLastMoveTime(Date.now()); // 타이머 리셋

            const allDone = targetSyllables.every(ts =>
                newSyllables.filter(ns => ns === ts).length >= targetSyllables.filter(s => s === ts).length
            );
            if (allDone && !showWordComplete) {
                setShowWordComplete(true);
                setScore(prev => prev + 3);
            }
        } else {
            setIsStunned(true);
            setLastMoveTime(Date.now()); // 실패해도 타이머 리셋
            setTimeout(() => setIsStunned(false), 1000);
        }
        setSelection([]);
    }, [isSelecting, selection, grid, collectedSyllables, targetSyllables, showWordComplete]);

    const handleQuizSubmit = () => {
        const correct = quizAnswer.trim() === brand.placeQuiz.answer;
        if (correct) {
            addPoints(5, `${brand.name} 사과 추가 미션 완료`); // 사과 추가미션 5P
        }
        setQuizResult({ correct });
        setShowQuiz(false);
        setShowQuizResult(true);
    };

    const progress = ((120 - timeLeft) / 120) * 100;

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-[#f5e6d3] to-[#ffcccb] overflow-hidden relative" onMouseUp={handleEnd} onTouchEnd={handleEnd} onTouchMove={handleTouchMove}>
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-2.5">
                <button onClick={onBack} className="p-2"><ArrowLeft size={24} /></button>
                <div className="flex items-center gap-2.5">
                    {/* Timer */}
                    <div className="bg-white flex items-center gap-2 rounded-full px-2.5 h-[44px] shadow-sm">
                        <div className="bg-[#FF5656] rounded-full size-[32px] flex items-center justify-center">
                            <span className="text-white text-lg">⏱</span>
                        </div>
                        <p className="text-[18px] text-black font-semibold pr-2">{timeLeft}</p>
                    </div>
                    {/* Score */}
                    <div className="bg-white flex items-center gap-2 rounded-full px-2.5 h-[44px] shadow-sm">
                        <img src={appleImage} alt="" className="w-[32px] h-[32px] object-contain" />
                        <p className="text-[18px] text-black font-semibold pr-1.5">{score}</p>
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
            <div className="px-4 pb-3 flex items-center justify-center">
                <div className="bg-white/90 rounded-[14px] px-3.5 py-2 flex items-center gap-2 shadow-sm">
                    <span className="font-bold text-[12px] text-[#666]">글자 모으기:</span>
                    <div className="flex gap-1">
                        {targetSyllables.map((s, i) => {
                            const syllableIndex = targetSyllables.slice(0, i + 1).filter(ts => ts === s).length;
                            const collectedCount = collectedSyllables.filter(cs => cs === s).length;
                            const isRevealed = collectedCount >= syllableIndex;

                            return (
                                <div
                                    key={i}
                                    className={`w-[26px] h-[30px] rounded-[6px] flex items-center justify-center transition-all ${isRevealed ? 'bg-[#4a90e2] text-white' : 'bg-[#e5e5e5] text-transparent'
                                        }`}
                                >
                                    <span className="font-bold text-[14px]">{isRevealed ? s : s}</span>
                                </div>
                            );
                        })}
                    </div>
                    <span className="text-[11px] text-[#999]">
                        ({collectedSyllables.length}/{brand.appleGameWord.length})
                    </span>
                </div>
            </div>

            {/* Grid */}
            <div className={`flex-1 flex items-start justify-center px-4 pt-2 pb-4 ${isStunned ? 'opacity-50' : ''}`}>
                <div className="flex flex-col gap-[5px]">
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
                                                    <img src={appleImage} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                {/* 숫자 */}
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="font-black text-[20px] text-white relative z-10" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                                        {cell.value}
                                                    </span>
                                                </div>
                                                {/* 음절 */}
                                                {cell.syllable && (
                                                    <div className="absolute top-[1px] right-[1px] bg-[#ff6b6b] rounded-full size-[14px] flex items-center justify-center z-20 shadow-sm pointer-events-none">
                                                        <span className="font-bold text-[9px] text-white leading-none">{cell.syllable}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {isStunned && (
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
                    <div className="bg-black/70 px-8 py-4 rounded-2xl">
                        <p className="font-black text-white text-3xl">틀렸습니다!</p>
                    </div>
                </div>
            )}

            {/* Word Complete Popup */}
            {showWordComplete && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
                    <div className="bg-white rounded-[24px] p-8 max-w-[350px] w-full animate-[bounce_0.5s_ease-out]">
                        <div className="flex flex-col items-center gap-6">
                            <div className="text-[64px]">🎉</div>
                            <h2 className="font-black text-[28px] text-[#ff6b6b] text-center">
                                글씨를 다 모았어요!
                            </h2>
                            <div className="bg-[#fff0db] rounded-[16px] px-6 py-4">
                                <p className="font-bold text-[32px] text-[#ff6b6b] text-center">
                                    "{brand.appleGameWord}"
                                </p>
                            </div>
                            <p className="text-[18px] text-[#666] text-center">
                                +3 보너스 포인트!
                            </p>
                            <button
                                onClick={() => {
                                    setShowWordComplete(false);
                                    setShowQuiz(true);
                                }}
                                className="bg-[#ff6b6b] h-[50px] rounded-[12px] text-white font-black text-[20px] hover:bg-[#ff5252] active:bg-[#e05555] transition-colors w-full"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz Popup */}
            {showQuiz && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
                    <div className="bg-white rounded-[24px] p-8 max-w-[400px] w-full relative">
                        <button
                            onClick={() => setShowQuiz(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#999] hover:text-[#333] transition-colors"
                        >
                            ✕
                        </button>

                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-3">
                                <div className="text-[32px]">🎯</div>
                                <h2 className="font-black text-[24px] text-[#ff6b6b]">
                                    추가 미션!
                                </h2>
                            </div>

                            <div className="bg-[#fff0db] rounded-[16px] p-4">
                                <p className="text-[18px] text-[#333] leading-relaxed">
                                    {brand.placeQuiz.question}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-[16px] text-[#666]">
                                    정답 입력
                                </label>
                                <input
                                    type="text"
                                    value={quizAnswer}
                                    onChange={(e) => setQuizAnswer(e.target.value)}
                                    className="border-2 border-[#e5e5e5] rounded-[12px] px-4 py-3 text-[18px] focus:border-[#ff6b6b] focus:outline-none"
                                    placeholder="숫자만 입력"
                                />
                            </div>

                            <div className="bg-[#f5f5f5] rounded-[12px] px-4 py-3">
                                <p className="text-[14px] text-[#666] text-center">
                                    정답시 +{brand.placeQuiz.bonusPoints} 보너스 포인트!
                                </p>
                            </div>

                            <a
                                href={brand.placeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white border-2 border-[#ff6b6b] h-[50px] rounded-[12px] text-[#ff6b6b] font-black text-[20px] hover:bg-[#fff5f5] active:bg-[#ffe5e5] transition-colors flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={18} /> 플레이스 보러가기
                            </a>

                            <button
                                onClick={handleQuizSubmit}
                                className="bg-[#ff6b6b] h-[50px] rounded-[12px] text-white font-black text-[20px] hover:bg-[#ff5252] active:bg-[#e05555] transition-colors"
                            >
                                제출하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz Result Popup */}
            {showQuizResult && quizResult && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
                    <div className="bg-white rounded-[24px] p-8 max-w-[350px] w-full">
                        <div className="flex flex-col items-center gap-6">
                            <div className="text-[64px]">{quizResult.correct ? '🎉' : '😅'}</div>
                            <h2 className={`font-black text-[28px] text-center ${quizResult.correct ? 'text-[#4caf50]' : 'text-[#ff6b6b]'}`}>
                                {quizResult.correct ? '정답입니다!' : '아쉬워요!'}
                            </h2>
                            {!quizResult.correct && (
                                <div className="bg-[#f5f5f5] rounded-[12px] px-4 py-3 w-full">
                                    <p className="text-[16px] text-[#666] text-center">
                                        정답: <span className="font-bold text-[#333]">{brand.placeQuiz.answer}</span>
                                    </p>
                                </div>
                            )}
                            {quizResult.correct && (
                                <p className="text-[18px] text-[#666] text-center">
                                    +{brand.placeQuiz.bonusPoints} 보너스 포인트!
                                </p>
                            )}
                            <button
                                onClick={onBack}
                                className="bg-[#ff6b6b] h-[50px] rounded-[12px] text-white font-black text-[20px] hover:bg-[#ff5252] active:bg-[#e05555] transition-colors w-full"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Over */}
            <AnimatePresence>
                {isFinished && !showWordComplete && !showQuiz && !showQuizResult && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
                        <div className="bg-white rounded-[24px] p-8 max-w-[350px] w-full">
                            <div className="flex flex-col items-center gap-6">
                                <div className="text-[64px]">⏰</div>
                                <h2 className="font-black text-[28px] text-[#ff6b6b] text-center">
                                    시간 종료!
                                </h2>
                                <p className="text-[24px] text-[#333] font-bold">
                                    최종 점수: {score}점
                                </p>
                                <button
                                    onClick={onBack}
                                    className="bg-[#ff6b6b] h-[50px] rounded-[12px] text-white font-black text-[20px] hover:bg-[#ff5252] transition-colors w-full"
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Help Modal Component
const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6" onClick={onClose}>
            <div className="bg-white rounded-[20px] p-6 max-w-[400px] w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-6">
                    <h2 className="font-black text-[24px] text-[#333]">게임 방법</h2>
                    <button
                        onClick={onClose}
                        className="text-[#999] hover:text-[#333] text-[28px] leading-none transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Step 1 */}
                    <div className="flex items-start gap-4">
                        <div className="bg-[#e5e5e5] rounded-full size-[40px] flex items-center justify-center shrink-0">
                            <span className="font-black text-[20px] text-[#666]">1</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="font-black text-[20px] text-[#333]">
                                사과에 적힌 숫자의 합이 '10'이 되면 완성!
                            </h3>
                            <p className="text-[16px] text-[#666] leading-relaxed">
                                숫자의 합이 '10'이 되는 사과를 찾아보세요.
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-[#e5e5e5]" />

                    {/* Step 2 */}
                    <div className="flex items-start gap-4">
                        <div className="bg-[#e5e5e5] rounded-full size-[40px] flex items-center justify-center shrink-0">
                            <span className="font-black text-[20px] text-[#666]">2</span>
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                            <h3 className="font-black text-[20px] text-[#333]">
                                드래그로 영역을 선택하세요!
                            </h3>
                            <p className="text-[16px] text-[#666] leading-relaxed">
                                1줄로 쭉, 2x2 정사각형 등 다양한 모양으로 선택할 수 있어요.
                            </p>

                            {/* 드래그 예시 애니메이션 */}
                            <div className="bg-gradient-to-br from-[#fff0db] to-[#ffe5e5] rounded-[12px] p-4 mt-2">
                                <div className="flex flex-col gap-4">
                                    {/* 1열 예시 */}
                                    <div className="flex flex-col gap-2">
                                        <span className="font-bold text-[14px] text-[#666]">
                                            1열로 쭉 (3+3+4 = 10)
                                        </span>
                                        <div className="flex gap-2">
                                            {[3, 3, 4].map((num, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    className="relative size-[50px] rounded-[8px] bg-white/80 flex items-center justify-center"
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                        backgroundColor: ["rgba(255, 255, 255, 0.8)", "rgba(255, 215, 0, 0.9)", "rgba(255, 255, 255, 0.8)"],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        delay: idx * 0.3,
                                                        repeat: Infinity,
                                                        repeatDelay: 2,
                                                    }}
                                                >
                                                    <img src={appleImage} alt="" className="absolute inset-0 w-full h-full object-contain opacity-20" />
                                                    <span className="absolute font-black text-[24px] text-[#ff6b6b] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                                                        {num}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2x2 예시 */}
                                    <div className="flex flex-col gap-2">
                                        <span className="font-bold text-[14px] text-[#666]">
                                            2x2 정사각형 (2+3+2+3 = 10)
                                        </span>
                                        <div className="flex flex-col gap-2">
                                            {[[2, 3], [2, 3]].map((row, rowIdx) => (
                                                <div key={rowIdx} className="flex gap-2">
                                                    {row.map((num, colIdx) => (
                                                        <motion.div
                                                            key={colIdx}
                                                            className="relative size-[50px] rounded-[8px] bg-white/80 flex items-center justify-center"
                                                            animate={{
                                                                scale: [1, 1.1, 1],
                                                                backgroundColor: ["rgba(255, 255, 255, 0.8)", "rgba(255, 215, 0, 0.9)", "rgba(255, 255, 255, 0.8)"],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                delay: 2 + (rowIdx * 2 + colIdx) * 0.2,
                                                                repeat: Infinity,
                                                                repeatDelay: 2,
                                                            }}
                                                        >
                                                            <img src={appleImage} alt="" className="absolute inset-0 w-full h-full object-contain opacity-20" />
                                                            <span className="absolute font-black text-[24px] text-[#ff6b6b] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                                                                {num}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-[#e5e5e5]" />

                    {/* Step 3 */}
                    <div className="flex items-start gap-4">
                        <div className="bg-[#e5e5e5] rounded-full size-[40px] flex items-center justify-center shrink-0">
                            <span className="font-black text-[20px] text-[#666]">3</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="font-black text-[20px] text-[#333]">
                                주어진 시간은 120초!
                            </h3>
                            <p className="text-[16px] text-[#666] leading-relaxed">
                                120초 동안 사과를 제거하여 가장 많은 점수를 얻어보세요.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="bg-[#ff6b6b] h-[50px] rounded-[12px] text-white font-black text-[20px] hover:bg-[#ff5252] active:bg-[#e05555] transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Component
const AppleGame: React.FC<AppleGameProps> = ({ brand, onComplete, onBack }) => {
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
                    onShowHelp={() => setShowHelp(true)}
                />
            )}
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </>
    );
};

export default AppleGame;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { Brand } from '../../data/brands';
import { usePoints } from '../../context/PointsContext';
import { DECOY_CHARS } from '../../data/constants';
import { getInitialConsonants } from '../../lib/hangulUtils';
import { WordleHelpModal } from './wordle/WordleHelpModal';
import { WordleSuccessModal } from './wordle/WordleSuccessModal';
import { WordleMissionModal } from './wordle/WordleMissionModal';
import { WordleFailModal } from './wordle/WordleFailModal';

const MaterialSymbolsHelpRounded = () => (
    <svg className="size-full" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#666" opacity="0.9" />
        <path d="M24 34c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm1.5-6.5v-1c0-1.375.5-2.625 1.5-3.625 1-1 1.5-2.25 1.5-3.875 0-2.625-2.125-4.75-4.75-4.75S18.5 16.375 18.5 19h3c0-1.125.875-2 2-2s2 .875 2 2c0 .875-.375 1.625-1 2.25-1.25 1.25-2 2.875-2 4.75v1h3z" fill="white" />
    </svg>
);

interface WordleGameProps {
    brand: Brand;
    onComplete: (points: number) => void;
    onBack: () => void;
    onDeductPlay: () => void; // 게임 횟수 차감 콜백
}

type CellState = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

interface Cell {
    char: string;
    state: CellState;
}

const WordleGame: React.FC<WordleGameProps> = ({ brand, onComplete, onBack, onDeductPlay }) => {
    const { addPoints } = usePoints(); // Context에서 직접 addPoints 가져오기
    const MAX_ATTEMPTS = 6; // 최대 시도 횟수
    const wordLength = brand.wordleAnswer.length; // 매장명 길이

    const [guesses, setGuesses] = useState<Cell[][]>(
        Array(MAX_ATTEMPTS).fill(null).map(() =>
            Array(wordLength).fill(null).map(() => ({ char: '', state: 'empty' }))
        )
    );
    const [currentRow, setCurrentRow] = useState(0);
    const [currentCol, setCurrentCol] = useState(0);
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
    const [showHelp, setShowHelp] = useState(false);
    const [shakeRow, setShakeRow] = useState<number | null>(null);
    const [tiles, setTiles] = useState<string[]>([]);
    const [keyStates, setKeyStates] = useState<Record<string, CellState>>({});
    const [showMission, setShowMission] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false); // 게임 완료 여부 추적

    useEffect(() => {
        const uniqueAnswerChars = [...new Set(brand.wordleAnswer)];
        const neededDecoys = 21 - uniqueAnswerChars.length;
        
        // DECOY_CHARS에서 정답에 포함되지 않은 글자만 선택
        const availableDecoys = DECOY_CHARS.filter(char => !uniqueAnswerChars.includes(char));
        const selectedDecoys = availableDecoys.slice(0, neededDecoys);
        
        const allChars = [...uniqueAnswerChars, ...selectedDecoys];
        setTiles(allChars.sort(() => Math.random() - 0.5));
    }, [brand]);

    const handleKeyPress = (char: string) => {
        if (gameState !== 'playing' || currentCol >= wordLength) return;
        const newGuesses = [...guesses];
        newGuesses[currentRow][currentCol] = { char, state: 'filled' };
        setGuesses(newGuesses);
        setCurrentCol(currentCol + 1);
    };

    const handleDelete = () => {
        if (gameState !== 'playing' || currentCol === 0) return;
        const newGuesses = [...guesses];
        newGuesses[currentRow][currentCol - 1] = { char: '', state: 'empty' };
        setGuesses(newGuesses);
        setCurrentCol(currentCol - 1);
    };

    const handleEnter = () => {
        if (gameState !== 'playing') return;
        if (currentCol !== wordLength) {
            setShakeRow(currentRow);
            setTimeout(() => setShakeRow(null), 500);
            return;
        }

        const currentGuess = guesses[currentRow].map(c => c.char);
        const newGuesses = [...guesses];
        const newKeyStates = { ...keyStates };
        const answerCopy = [...brand.wordleAnswer];
        const states: CellState[] = Array(wordLength).fill('absent');

        // First pass: correct positions
        currentGuess.forEach((char, i) => {
            if (char === brand.wordleAnswer[i]) {
                states[i] = 'correct';
                answerCopy[i] = '';
                newKeyStates[char] = 'correct';
            }
        });

        // Second pass: present but wrong position
        currentGuess.forEach((char, i) => {
            if (states[i] !== 'correct') {
                const idx = answerCopy.indexOf(char);
                if (idx !== -1) {
                    states[i] = 'present';
                    answerCopy[idx] = '';
                    if (newKeyStates[char] !== 'correct') newKeyStates[char] = 'present';
                } else {
                    if (!newKeyStates[char]) newKeyStates[char] = 'absent';
                }
            }
        });

        newGuesses[currentRow] = currentGuess.map((char, i) => ({ char, state: states[i] }));
        setGuesses(newGuesses);
        setKeyStates(newKeyStates);

        if (currentGuess.join('') === brand.wordleAnswer.join('')) {
            setTimeout(() => {
                setGameState('won');
                if (!gameCompleted) {
                    setGameCompleted(true);
                    onComplete(5); // 워들 게임 성공 5P
                }
            }, 500);
        } else if (currentRow === MAX_ATTEMPTS - 1) {
            setTimeout(() => {
                setGameState('lost');
                if (!gameCompleted) {
                    setGameCompleted(true);
                    onComplete(0); // 실패 시 0 포인트
                }
            }, 500);
        } else {
            setCurrentRow(currentRow + 1);
            setCurrentCol(0);
        }
    };

    const handleMissionSubmit = (userAnswer: string): boolean => {
        if (userAnswer === brand.placeQuiz.answer) {
            addPoints(5, `${brand.name} 워들 추가 미션 완료`);
            return true;
        }
        return false;
    };

    const getKeyColor = (char: string) => {
        const state = keyStates[char];
        if (state === 'correct') return 'bg-[#28c52d]';
        if (state === 'present') return 'bg-[#ff8800]';
        if (state === 'absent') return 'bg-[#787c7e]';
        return 'bg-[#d4d4d4]';
    };

    const getKeyTextColor = (char: string) => {
        const state = keyStates[char];
        if (state === 'correct' || state === 'present' || state === 'absent') return 'text-white';
        return 'text-black';
    };

    return (
        <div className="flex flex-col h-screen bg-[#f0f0f0] overflow-hidden relative">
            {/* Help button - Fixed top right */}
            <button
                onClick={() => setShowHelp(true)}
                className="absolute top-[20px] right-[20px] z-10 size-[48px] hover:scale-110 active:scale-95 transition-transform"
            >
                <MaterialSymbolsHelpRounded />
            </button>

            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3">
                <button onClick={onBack} className="p-2"><ArrowLeft size={24} /></button>
                <div className="w-10" />
            </header>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto flex flex-col">

                {/* Hint button/display */}
                <div className="flex items-center justify-center px-4 py-2">
                    {!showHint ? (
                        <button 
                            onClick={() => setShowHint(true)}
                            disabled={currentRow < 3} // 4번째 시도(index 3)부터 활성화
                            className={`bg-white flex gap-[10px] h-[32px] items-center justify-center px-4 rounded-[12px] shadow-[0px_0px_2px_0px_rgba(0,0,0,0.25)] transition-all ${
                                currentRow < 3 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:shadow-md'
                            }`}
                        >
                            <span className="text-[16px] font-medium text-[#121212]">
                                {currentRow < 3 ? `🔒 힌트 (${4 - currentRow}번 후)` : '💡 힌트 보기'}
                            </span>
                        </button>
                    ) : (
                        <div className="bg-white flex flex-col gap-[12px] items-center justify-center px-6 py-4 rounded-[12px] shadow-[0px_0px_2px_0px_rgba(0,0,0,0.25)] relative max-w-[300px]">
                            <button
                                onClick={() => setShowHint(false)}
                                className="absolute top-2 right-2 bg-gray-800 text-white rounded-full size-7 flex items-center justify-center hover:bg-gray-900 transition-colors shadow-md z-10"
                            >
                                <span className="text-lg font-bold leading-none">✕</span>
                            </button>
                            
                            {/* 사진 (있으면) */}
                            {brand.hintImage && (
                                <div className="relative w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                    <img 
                                        src={brand.hintImage} 
                                        alt="힌트 이미지" 
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                            
                            {/* 초성 */}
                            <div className="w-full">
                                <p className="font-bold text-[16px] text-[#ff6b6b] mb-2 text-center">정답 초성</p>
                                <div className="flex gap-2 justify-center flex-wrap">
                                    {getInitialConsonants(brand.wordleAnswer).map((chosung, idx) => (
                                        <div 
                                            key={idx}
                                            className="bg-gradient-to-br from-[#ff6b6b] to-[#ff8800] size-[40px] rounded-[8px] flex items-center justify-center shadow-md"
                                        >
                                            <span className="font-black text-[22px] text-white">{chosung}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Game Board */}
                <div className="flex flex-col items-center justify-center px-4 gap-2 py-4">
                    {guesses.map((row, rIdx) => (
                        <motion.div
                            key={rIdx}
                            animate={shakeRow === rIdx ? { x: [-5, 5, -5, 5, 0] } : {}}
                            className="flex gap-2"
                        >
                            {row.map((cell, cIdx) => {
                                let bgColor = 'bg-white';
                                let borderColor = 'border-[#d4d4d4]';
                                let textColor = 'text-black';

                                if (cell.state === 'correct') {
                                    bgColor = 'bg-[#28c52d]';
                                    borderColor = 'border-[#28c52d]';
                                    textColor = 'text-white';
                                } else if (cell.state === 'present') {
                                    bgColor = 'bg-[#ff8800]';
                                    borderColor = 'border-[#ff8800]';
                                    textColor = 'text-white';
                                } else if (cell.state === 'absent') {
                                    bgColor = 'bg-[#787c7e]';
                                    borderColor = 'border-[#787c7e]';
                                    textColor = 'text-white';
                                } else if (cell.state === 'filled') {
                                    borderColor = 'border-[#737373]';
                                }

                                return (
                                    <div
                                        key={cIdx}
                                        className={`${bgColor} relative rounded-[4px] size-[54px] transition-all duration-300 border-2 ${borderColor} flex items-center justify-center`}
                                    >
                                        {cell.char && (
                                            <p className={`font-semibold text-[24px] ${textColor}`}>{cell.char}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Keyboard */}
            <div className="flex flex-col gap-[6px] items-center px-4 pb-6 pt-2">
                {/* First 3 rows of 7 tiles */}
                {[0, 1, 2].map((rowIndex) => (
                    <div key={rowIndex} className="flex gap-[5px] items-center justify-center w-full">
                        {tiles.slice(rowIndex * 7, (rowIndex + 1) * 7).map((char, charIndex) => (
                            <button
                                key={`${rowIndex}-${charIndex}`}
                                onClick={() => handleKeyPress(char)}
                                disabled={gameState !== 'playing'}
                                className={`${getKeyColor(char)} flex items-center justify-center h-[50px] w-[45px] rounded-[6px] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <p className={`font-semibold text-[20px] ${getKeyTextColor(char)}`}>{char}</p>
                            </button>
                        ))}
                    </div>
                ))}

                {/* Bottom row with Enter, Delete buttons */}
                <div className="flex gap-[5px] items-center justify-center w-full">
                    <button
                        onClick={handleEnter}
                        disabled={gameState !== 'playing'}
                        className="bg-[#FF6B6B] flex items-center justify-center h-[58px] px-[24px] rounded-[6px] hover:bg-[#ff5252] active:scale-95 transition-all disabled:opacity-50"
                    >
                        <p className="font-bold text-[16px] text-white">확인</p>
                    </button>

                    {tiles.slice(21).map((char, charIndex) => (
                        <button
                            key={`3-${charIndex}`}
                            onClick={() => handleKeyPress(char)}
                            disabled={gameState !== 'playing'}
                            className={`${getKeyColor(char)} flex items-center justify-center h-[50px] w-[45px] rounded-[6px] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50`}
                        >
                            <p className={`font-semibold text-[20px] ${getKeyTextColor(char)}`}>{char}</p>
                        </button>
                    ))}

                    <button
                        onClick={handleDelete}
                        disabled={gameState !== 'playing'}
                        className="bg-[#FF6B6B] flex items-center justify-center h-[58px] px-[24px] rounded-[6px] hover:bg-[#ff5252] active:scale-95 transition-all disabled:opacity-50"
                    >
                        <p className="font-bold text-[18px] text-white">←</p>
                    </button>
                </div>
            </div>

            {/* Help modal */}
            {showHelp && <WordleHelpModal onClose={() => setShowHelp(false)} />}

            {/* Success modal */}
            {gameState === 'won' && !showMission && (
                <WordleSuccessModal
                    onStartMission={() => setShowMission(true)}
                    onGoHome={() => {
                        onDeductPlay();
                        onBack();
                    }}
                />
            )}

            {/* Mission modal */}
            {showMission && (
                <WordleMissionModal
                    question={brand.placeQuiz.question}
                    placeUrl={brand.placeUrl}
                    bonusPoints={5}
                    onHome={() => {
                        onDeductPlay();
                        onBack();
                    }}
                    onSubmit={handleMissionSubmit}
                />
            )}

            {/* Failed modal */}
            {gameState === 'lost' && (
                <WordleFailModal
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

export default WordleGame;

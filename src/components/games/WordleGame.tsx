import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { Brand } from '../../data/brands';
import { usePoints } from '../../context/PointsContext';

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
}

type CellState = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

interface Cell {
    char: string;
    state: CellState;
}

const DECOY_CHARS = [
    '지', '사', '구', '어', '기', '저', '서', '주', '바',
    '정', '직', '누', '김', '축', '빔', '린', '카', '페',
    '수', '도', '멍', '가', '든', '리', '스', '트', '팩', '토',
    '월', '드', '빌',
    '커', '피', '디', '쿠', '키', '베', '이', 
    '포', '인', '워', '프', '캐', '시', '티', '크', '런', '워','아'
];

const WordleGame: React.FC<WordleGameProps> = ({ brand, onComplete, onBack }) => {
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
    const [missionAnswer, setMissionAnswer] = useState('');
    const [missionResult, setMissionResult] = useState<'none' | 'success' | 'fail'>('none');
    const [showHint, setShowHint] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false); // 게임 완료 여부 추적

    useEffect(() => {
        const uniqueAnswerChars = [...new Set(brand.wordleAnswer)];
        const neededDecoys = 21 - uniqueAnswerChars.length;
        const allChars = [...uniqueAnswerChars, ...DECOY_CHARS.slice(0, neededDecoys)];
        setTiles(allChars.sort(() => Math.random() - 0.5));
    }, [brand]);

    // 게임 상태 초기화 함수
    const resetGame = () => {
        setGuesses(
            Array(MAX_ATTEMPTS).fill(null).map(() =>
                Array(wordLength).fill(null).map(() => ({ char: '', state: 'empty' }))
            )
        );
        setCurrentRow(0);
        setCurrentCol(0);
        setGameState('playing');
        setShowHelp(false);
        setShakeRow(null);
        setKeyStates({});
        setShowMission(false);
        setMissionAnswer('');
        setMissionResult('none');
        setShowHint(false);
        setGameCompleted(false);
        
        // 타일 다시 섞기
        const uniqueAnswerChars = [...new Set(brand.wordleAnswer)];
        const neededDecoys = 21 - uniqueAnswerChars.length;
        const allChars = [...uniqueAnswerChars, ...DECOY_CHARS.slice(0, neededDecoys)];
        setTiles(allChars.sort(() => Math.random() - 0.5));
    };

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

    const handleMissionSubmit = () => {
        if (missionAnswer === brand.placeQuiz.answer) {
            setMissionResult('success');
            addPoints(5, `${brand.name} 워들 추가 미션 완료`); // 워들 추가미션 5P
        } else {
            setMissionResult('fail');
        }
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
                            className="bg-white flex gap-[10px] h-[32px] items-center justify-center px-4 rounded-[12px] shadow-[0px_0px_2px_0px_rgba(0,0,0,0.25)] hover:shadow-md transition-shadow"
                        >
                            <span className="text-[16px] font-medium text-[#121212]">💡 힌트 보기</span>
                        </button>
                    ) : (
                        <div className="bg-white flex flex-col gap-[10px] h-[222px] items-center justify-center px-4 rounded-[12px] shadow-[0px_0px_2px_0px_rgba(0,0,0,0.25)] w-[201px] relative">
                            <button
                                onClick={() => setShowHint(false)}
                                className="absolute top-2 right-2 bg-gray-800 text-white rounded-full size-7 flex items-center justify-center hover:bg-gray-900 transition-colors shadow-md z-10"
                            >
                                <span className="text-lg font-bold leading-none">✕</span>
                            </button>
                            <div className="relative size-[173px] bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                                <img 
                                    src={brand.hintImage} 
                                    alt="힌트 이미지" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerHTML = '<span class="text-4xl">🏪</span>';
                                    }}
                                />
                            </div>
                            <p className="font-medium text-[16px] text-[#121212] text-center">힌트</p>
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
                        className="bg-[#d4d4d4] flex items-center justify-center h-[50px] px-[20px] rounded-[6px] hover:bg-[#c4c4c4] active:scale-95 transition-all disabled:opacity-50"
                    >
                        <p className="font-semibold text-[14px] text-black">확인</p>
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
                        className="bg-[#d4d4d4] flex items-center justify-center h-[50px] px-[20px] rounded-[6px] hover:bg-[#c4c4c4] active:scale-95 transition-all disabled:opacity-50"
                    >
                        <p className="font-semibold text-[14px] text-black">←</p>
                    </button>
                </div>
            </div>

            {/* Help modal - 디자인 폴더 스타일 적용 */}
            {showHelp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-[20px]" onClick={() => setShowHelp(false)}>
                    <div className="bg-white rounded-[20px] p-[32px] max-w-[360px] w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-[24px]">
                            <h2 className="font-bold text-[24px] text-[#121212]">게임 방법</h2>
                            <button
                                onClick={() => setShowHelp(false)}
                                className="text-[#737373] hover:text-[#121212] text-[28px] leading-none transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex flex-col gap-[24px] text-left">
                            {/* Step 1 */}
                            <div className="flex gap-[12px]">
                                <div className="bg-[#d4d4d4] rounded-full size-[36px] shrink-0 flex items-center justify-center">
                                    <span className="font-bold text-[18px] text-[#121212]">1</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-[18px] text-[#121212] mb-[8px]">
                                        숨겨진 5글자 가게명을 맞춰보세요!
                                    </p>
                                    <p className="font-normal text-[14px] text-[#737373]">
                                        6번의 기회 안에 정답을 맞추면 3포인트를 받을 수 있어요.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-[12px]">
                                <div className="bg-[#d4d4d4] rounded-full size-[36px] shrink-0 flex items-center justify-center">
                                    <span className="font-bold text-[18px] text-[#121212]">2</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-[18px] text-[#121212] mb-[8px]">
                                        색상으로 힌트를 확인하세요!
                                    </p>
                                    <p className="font-normal text-[14px] text-[#737373] mb-[12px]">
                                        글자를 입력하고 확인을 누르면 색상으로 정답 여부를 알려드려요.
                                    </p>

                                    {/* Visual example */}
                                    <div className="bg-[#fef6e8] rounded-[12px] p-[16px]">
                                        <div className="flex flex-col gap-[12px]">
                                            <div className="flex items-center gap-[8px]">
                                                <div className="bg-[#28c52d] size-[40px] rounded-[4px] flex items-center justify-center">
                                                    <span className="font-bold text-[20px] text-white">아</span>
                                                </div>
                                                <p className="font-normal text-[13px] text-[#121212]">
                                                    위치와 글자 정확!
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-[8px]">
                                                <div className="bg-[#ff8800] size-[40px] rounded-[4px] flex items-center justify-center">
                                                    <span className="font-bold text-[20px] text-white">쿠</span>
                                                </div>
                                                <p className="font-normal text-[13px] text-[#121212]">
                                                    글자는 맞지만 위치 틀림
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-[8px]">
                                                <div className="bg-[#787c7e] size-[40px] rounded-[4px] flex items-center justify-center">
                                                    <span className="font-bold text-[20px] text-white">지</span>
                                                </div>
                                                <p className="font-normal text-[13px] text-[#121212]">
                                                    답에 포함되지 않음
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-[12px]">
                                <div className="bg-[#d4d4d4] rounded-full size-[36px] shrink-0 flex items-center justify-center">
                                    <span className="font-bold text-[18px] text-[#121212]">3</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-[18px] text-[#121212] mb-[8px]">
                                        키보드에서 글자를 선택하세요!
                                    </p>
                                    <p className="font-normal text-[14px] text-[#737373]">
                                        같은 글자를 여러 번 클릭할 수 있어요. 5글자를 모두 입력한 후 확인 버튼을 눌러주세요.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowHelp(false)}
                                className="bg-[#ff6b6b] text-white font-bold text-[18px] py-[16px] px-[24px] rounded-[12px] hover:bg-[#ff5252] transition-colors mt-[8px] w-full"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success modal */}
            {gameState === 'won' && !showMission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-[16px] p-[32px] max-w-[320px] text-center">
                        <div className="mb-[20px]">
                            <div className="text-[48px] mb-[12px]">🎉</div>
                            <p className="font-bold text-[24px] text-[#28c52d] mb-[8px]">정답입니다!</p>
                            <p className="font-semibold text-[20px] text-[#121212]">5포인트가 적립되었습니다.</p>
                        </div>

                        <div className="flex flex-col gap-[12px]">
                            <button
                                onClick={() => setShowMission(true)}
                                className="bg-[#ff6b6b] text-white font-semibold text-[16px] py-[12px] px-[24px] rounded-[8px] hover:bg-[#ff5252] transition-colors touch-manipulation"
                            >
                                추가미션하고 5P 더 받기
                            </button>
                            <button
                                onClick={onBack}
                                className="text-[#737373] font-medium text-[14px] py-[8px] hover:text-[#121212] transition-colors touch-manipulation"
                            >
                                홈으로 가기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mission modal */}
            {showMission && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-[24px] p-8 max-w-[400px] w-full relative">
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
                                    value={missionAnswer}
                                    onChange={(e) => setMissionAnswer(e.target.value)}
                                    className="border-2 border-[#e5e5e5] rounded-[12px] px-4 py-3 text-[18px] focus:border-[#ff6b6b] focus:outline-none"
                                    placeholder="숫자만 입력"
                                />
                            </div>

                            <a
                                href={brand.placeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white border-2 border-[#ff6b6b] h-[50px] rounded-[12px] text-[#ff6b6b] font-black text-[20px] hover:bg-[#fff5f5] transition-colors flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={18} /> 플레이스 보러가기
                            </a>

                            <button
                                onClick={handleMissionSubmit}
                                className="bg-[#ff6b6b] h-[50px] rounded-[12px] text-white font-black text-[20px] hover:bg-[#ff5252] transition-colors"
                            >
                                제출하기
                            </button>

                            {missionResult !== 'none' && (
                                <div className={`text-center font-bold ${missionResult === 'success' ? 'text-[#4caf50]' : 'text-[#ff6b6b]'}`}>
                                    {missionResult === 'success' ? '정답입니다! 포인트가 적립되었습니다.' : '아쉬워요! 다시 도전해보세요.'}
                                </div>
                            )}
                            {missionResult === 'success' && (
                                <button onClick={onBack} className="w-full mt-2 h-12 text-[#737373] font-medium hover:text-[#121212] transition-colors">
                                    홈으로 돌아가기
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Failed modal */}
            {gameState === 'lost' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-[16px] p-[32px] max-w-[320px] text-center">
                        <div className="mb-[20px]">
                            <div className="text-[48px] mb-[12px]">💭</div>
                            <p className="font-bold text-[24px] text-[#ff8800] mb-[8px]">아쉬워요!</p>
                            <p className="font-normal text-[14px] text-[#737373]">다시 도전해보세요!</p>
                        </div>

                        <div className="flex flex-col gap-[12px]">
                            <button
                                onClick={resetGame}
                                className="bg-[#ff6b6b] text-white font-semibold text-[16px] py-[12px] px-[24px] rounded-[8px] hover:bg-[#ff5252] transition-colors"
                            >
                                다시 도전하기
                            </button>
                            <button
                                onClick={onBack}
                                className="text-[#737373] font-medium text-[14px] py-[8px] hover:text-[#121212] transition-colors touch-manipulation"
                            >
                                홈으로 가기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WordleGame;

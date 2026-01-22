import { useState, useEffect, useCallback } from 'react';
import { DECOY_CHARS } from '../data/constants';

export type CellState = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

export interface Cell {
    char: string;
    state: CellState;
}

interface UseWordleProps {
    answer: string[];
    maxAttempts?: number;
    onWin: () => void;
    onLose: () => void;
}

export const useWordle = ({ answer, maxAttempts = 6, onWin, onLose }: UseWordleProps) => {
    const wordLength = answer.length;
    const [guesses, setGuesses] = useState<Cell[][]>(
        Array(maxAttempts).fill(null).map(() =>
            Array(wordLength).fill(null).map(() => ({ char: '', state: 'empty' }))
        )
    );
    const [currentRow, setCurrentRow] = useState(0);
    const [currentCol, setCurrentCol] = useState(0);
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
    const [tiles, setTiles] = useState<string[]>([]);
    const [keyStates, setKeyStates] = useState<Record<string, CellState>>({});
    const [shakeRow, setShakeRow] = useState<number | null>(null);

    // Initialize tiles
    useEffect(() => {
        const uniqueAnswerChars = [...new Set(answer)];
        // 정답에 포함된 글자를 제외한 데코이 문자들 필터링
        const filteredDecoys = DECOY_CHARS.filter(char => !uniqueAnswerChars.includes(char));
        const neededDecoys = 21 - uniqueAnswerChars.length;
        const allChars = [...uniqueAnswerChars, ...filteredDecoys.slice(0, neededDecoys)];
        setTiles(allChars.sort(() => Math.random() - 0.5));
    }, [answer]);

    const handleKeyPress = useCallback((char: string) => {
        if (gameState !== 'playing' || currentCol >= wordLength) return;
        setGuesses(prev => {
            const newGuesses = [...prev];
            newGuesses[currentRow] = [...newGuesses[currentRow]];
            newGuesses[currentRow][currentCol] = { char, state: 'filled' };
            return newGuesses;
        });
        setCurrentCol(prev => prev + 1);
    }, [gameState, currentCol, wordLength, currentRow]);

    const handleDelete = useCallback(() => {
        if (gameState !== 'playing' || currentCol === 0) return;
        setGuesses(prev => {
            const newGuesses = [...prev];
            newGuesses[currentRow] = [...newGuesses[currentRow]];
            newGuesses[currentRow][currentCol - 1] = { char: '', state: 'empty' };
            return newGuesses;
        });
        setCurrentCol(prev => prev - 1);
    }, [gameState, currentCol, currentRow]);

    const handleEnter = useCallback(() => {
        if (gameState !== 'playing') return;
        if (currentCol !== wordLength) {
            setShakeRow(currentRow);
            setTimeout(() => setShakeRow(null), 500);
            return;
        }

        const currentGuess = guesses[currentRow].map(c => c.char);
        const newKeyStates = { ...keyStates };
        const answerCopy = [...answer];
        const states: CellState[] = Array(wordLength).fill('absent');

        // First pass: correct positions
        currentGuess.forEach((char, i) => {
            if (char === answer[i]) {
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

        setGuesses(prev => {
            const newGuesses = [...prev];
            newGuesses[currentRow] = currentGuess.map((char, i) => ({ char, state: states[i] }));
            return newGuesses;
        });
        setKeyStates(newKeyStates);

        if (currentGuess.join('') === answer.join('')) {
            setTimeout(() => {
                setGameState('won');
                onWin();
            }, 500);
        } else if (currentRow === maxAttempts - 1) {
            setTimeout(() => {
                setGameState('lost');
                onLose();
            }, 500);
        } else {
            setCurrentRow(prev => prev + 1);
            setCurrentCol(0);
        }
    }, [gameState, currentCol, wordLength, guesses, currentRow, answer, keyStates, maxAttempts, onWin, onLose]);

    return {
        guesses,
        currentRow,
        currentCol,
        gameState,
        tiles,
        keyStates,
        shakeRow,
        answer,
        handleKeyPress,
        handleDelete,
        handleEnter
    };
};

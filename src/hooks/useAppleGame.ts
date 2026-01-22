import { useState, useEffect, useCallback } from 'react';

export interface Cell {
    row: number;
    col: number;
    value: number;
    syllable?: string;
    isRemoved: boolean;
}

interface UseAppleGameProps {
    targetSyllables: string[];
    onComplete: (points: number) => void;
    isStarted?: boolean;
}

export const useAppleGame = ({ targetSyllables, onComplete, isStarted = false }: UseAppleGameProps) => {
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(120);
    const [collectedSyllables, setCollectedSyllables] = useState<string[]>([]);
    const [selection, setSelection] = useState<Cell[]>([]);
    const [startCell, setStartCell] = useState<Cell | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isStunned, setIsStunned] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [lastMoveTime, setLastMoveTime] = useState<number>(Date.now());
    const [lastRevealScore, setLastRevealScore] = useState(0);
    const [flyingSyllables, setFlyingSyllables] = useState<Array<{ syllable: string; id: number; fromX: number; fromY: number }>>([]);
    const [hintCells, setHintCells] = useState<Cell[]>([]);

    // Grid Initialization Logic
    useEffect(() => {
        const newGrid: Cell[][] = [];
        for (let r = 0; r < 12; r++) {
            const row: Cell[] = [];
            for (let c = 0; c < 8; c++) {
                row.push({ row: r, col: c, value: 0, isRemoved: false });
            }
            newGrid.push(row);
        }

        targetSyllables.forEach(s => {
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

        const numberPairs = [
            { num: 5, count: 14 }, { num: 4, count: 12 }, { num: 6, count: 12 },
            { num: 3, count: 12 }, { num: 7, count: 12 }, { num: 2, count: 10 },
            { num: 8, count: 10 }, { num: 1, count: 10 }, { num: 9, count: 10 }
        ];
        const numbers: number[] = [];
        numberPairs.forEach(({ num, count }) => { for (let i = 0; i < count; i++) numbers.push(num); });
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        let numIdx = 0;
        for (let r = 0; r < 12; r++) {
            for (let c = 0; c < 8; c++) {
                newGrid[r][c].value = numbers[numIdx++] || 5;
            }
        }
        setGrid(newGrid);
    }, [targetSyllables]);

    // Timer Logic
    useEffect(() => {
        if (isStarted && timeLeft > 0 && !isFinished) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (isStarted && timeLeft === 0 && !isFinished && !gameCompleted) {
            setIsFinished(true);
            setGameCompleted(true);
            // 시간 종료 시, 모든 글자를 모았는지 엄격히 확인
            const allSyllablesCollected = targetSyllables.every(ts =>
                collectedSyllables.filter(cs => cs === ts).length >= targetSyllables.filter(s => s === ts).length
            );
            // 무조건 5점이 아니라, 다 모았을 때만 5점, 아니면 0점
            onComplete(allSyllablesCollected ? 5 : 0);
        }
    }, [isStarted, timeLeft, isFinished, gameCompleted, onComplete, collectedSyllables, targetSyllables]);

    // Hint Logic
    const findHintCombination = useCallback(() => {
        for (let r1 = 0; r1 < grid.length; r1++) {
            for (let c1 = 0; c1 < grid[r1].length; c1++) {
                if (grid[r1][c1].isRemoved) continue;
                for (let r2 = 0; r2 < grid.length; r2++) {
                    for (let c2 = 0; c2 < grid[r2].length; c2++) {
                        const minR = Math.min(r1, r2), maxR = Math.max(r1, r2);
                        const minC = Math.min(c1, c2), maxC = Math.max(c1, c2);
                        const cells: Cell[] = [];
                        let sum = 0;
                        for (let r = minR; r <= maxR; r++) {
                            for (let c = minC; c <= maxC; c++) {
                                if (!grid[r][c].isRemoved) {
                                    cells.push(grid[r][c]);
                                    sum += grid[r][c].value;
                                }
                            }
                        }
                        if (sum === 10 && cells.length > 0) return cells;
                    }
                }
            }
        }
        return null;
    }, [grid]);

    useEffect(() => {
        if (isFinished || grid.length === 0) return;
        const hintTimer = setTimeout(() => {
            const hint = findHintCombination();
            if (hint) {
                setHintCells(hint);
                setTimeout(() => setHintCells([]), 3000);
            }
        }, 20000);
        return () => clearTimeout(hintTimer);
    }, [lastMoveTime, isFinished, grid, findHintCombination]);

    // Selection Handlers
    const handleStart = (cell: Cell) => {
        if (isFinished || cell.isRemoved || isStunned) return;
        setIsSelecting(true);
        setStartCell(cell);
        setSelection([cell]);
    };

    const handleEnter = (cell: Cell) => {
        if (!isSelecting || isFinished || isStunned || !startCell || cell.isRemoved) return;
        const minR = Math.min(startCell.row, cell.row), maxR = Math.max(startCell.row, cell.row);
        const minC = Math.min(startCell.col, cell.col), maxC = Math.max(startCell.col, cell.col);
        const newSel: Cell[] = [];
        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                if (!grid[r][c].isRemoved) newSel.push(grid[r][c]);
            }
        }
        if (newSel.length > 0) setSelection(newSel);
    };

    const handleEnd = useCallback(() => {
        if (!isSelecting) return;
        setIsSelecting(false);
        setStartCell(null);
        const sum = selection.reduce((acc, c) => acc + c.value, 0);
        if (sum === 10) {
            const newGrid = [...grid];
            const newSyllables = [...collectedSyllables];
            const newFlying: any[] = [];
            selection.forEach(c => {
                newGrid[c.row][c.col].isRemoved = true;
                if (c.syllable) {
                    newSyllables.push(c.syllable);
                    const el = document.querySelector(`[data-row="${c.row}"][data-col="${c.col}"]`);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        newFlying.push({ syllable: c.syllable, id: Date.now() + Math.random(), fromX: rect.left + rect.width / 2, fromY: rect.top + rect.height / 2 });
                    }
                }
            });

            if (newFlying.length > 0) {
                setFlyingSyllables(prev => [...prev, ...newFlying]);
                setTimeout(() => setFlyingSyllables(prev => prev.filter(f => !newFlying.find(nf => nf.id === f.id))), 800);
            }

            const newScore = score + selection.length;
            setGrid(newGrid);
            setScore(newScore);
            setCollectedSyllables(newSyllables);
            setHintCells([]);
            setLastMoveTime(Date.now());

            // Probability-based reveal logic
            if (Math.floor(newScore / 2) > Math.floor(lastRevealScore / 2)) {
                setLastRevealScore(newScore);
                const remaining = targetSyllables.filter((ts, i) => newSyllables.filter(cs => cs === ts).length < targetSyllables.filter((s, j) => s === ts && j <= i).length);
                const prob = newScore >= 20 ? 0.5 : (newScore >= 10 ? 0.4 : 0.3);
                if (remaining.length > 0 && Math.random() < prob) {
                    const randomS = remaining[Math.floor(Math.random() * remaining.length)];
                    newSyllables.push(randomS);
                    setCollectedSyllables(newSyllables);
                    const flyingItem = { syllable: randomS, id: Date.now() + Math.random(), fromX: window.innerWidth / 2, fromY: window.innerHeight / 2 };
                    setFlyingSyllables(prev => [...prev, flyingItem]);
                    setTimeout(() => setFlyingSyllables(prev => prev.filter(f => f.id !== flyingItem.id)), 800);
                }
            }

            const allDone = targetSyllables.every(ts => newSyllables.filter(ns => ns === ts).length >= targetSyllables.filter(s => s === ts).length);
            if (allDone && !gameCompleted && !isFinished) {
                setGameCompleted(true);
                setIsFinished(true);
                onComplete(5);
            }
        } else {
            setIsStunned(true);
            setLastMoveTime(Date.now());
            setTimeout(() => setIsStunned(false), 1000);
        }
        setSelection([]);
    }, [isSelecting, selection, grid, collectedSyllables, targetSyllables, score, lastRevealScore, gameCompleted, isFinished, onComplete]);

    return {
        grid, score, timeLeft, collectedSyllables, selection, isSelecting, isFinished, isStunned, gameCompleted, flyingSyllables, hintCells,
        handleStart, handleEnter, handleEnd, setFlyingSyllables
    };
};

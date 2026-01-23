import React from 'react';
import appleImage from '../../../assets/apple.png';
import type { Cell } from '../../../hooks/useAppleGame';

interface AppleGridProps {
    grid: Cell[][];
    selection: Cell[];
    hintCells: Cell[];
    isStunned: boolean;
    onStart: (cell: Cell) => void;
    onEnter: (cell: Cell) => void;
}

export const AppleGrid: React.FC<AppleGridProps> = ({ grid, selection, hintCells, isStunned, onStart, onEnter }) => {
    const handleTouchMove = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const cellElement = element?.closest('.apple-cell');
        if (cellElement) {
            const row = parseInt(cellElement.getAttribute('data-row') || '-1');
            const col = parseInt(cellElement.getAttribute('data-col') || '-1');
            if (row !== -1 && col !== -1) {
                const cell = grid[row]?.[col];
                if (cell && !cell.isRemoved) {
                    onEnter(cell);
                }
            }
        }
    };

    return (
        <div
            className={`flex-1 flex items-start justify-center px-4 pt-2 pb-4 ${isStunned ? 'opacity-50' : ''}`}
            onTouchMove={handleTouchMove}
            style={{ touchAction: 'none' }} // 드래그 시 스크롤 방지
        >
            <div className="flex flex-col gap-[5px]">
                {grid.map((row) => (
                    <div key={row[0]?.row} className="flex gap-[5px]">
                        {row.map((cell) => {
                            const isSelected = selection.some(s => s.row === cell.row && s.col === cell.col);
                            const isHint = hintCells.some(h => h.row === cell.row && h.col === cell.col);

                            return (
                                <div
                                    key={`${cell.row}-${cell.col}`}
                                    onMouseDown={() => onStart(cell)}
                                    onMouseEnter={() => onEnter(cell)}
                                    onTouchStart={() => onStart(cell)}
                                    data-row={cell.row}
                                    data-col={cell.col}
                                    className={`relative rounded-[10px] size-[36px] transition-all select-none overflow-hidden apple-cell ${cell.isRemoved ? 'opacity-0' : 'cursor-pointer'
                                        } ${isSelected ? 'bg-[#ffd700] ring-2 ring-[#ff6b6b] scale-110' : isHint ? 'bg-[#ffd700] ring-2 ring-yellow-400 animate-pulse' : 'bg-white shadow-sm'
                                        }`}
                                >
                                    {!cell.isRemoved && (
                                        <>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <img src={appleImage} alt="" loading="lazy" className="w-full h-full object-cover" />
                                            </div>
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
            {isStunned && (
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
                    <div className="bg-black/70 px-8 py-4 rounded-2xl">
                        <p className="font-black text-white text-3xl">틀렸습니다!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

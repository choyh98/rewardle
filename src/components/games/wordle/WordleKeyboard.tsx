import React from 'react';
import type { CellState } from '../../../hooks/useWordle';

interface WordleKeyboardProps {
    tiles: string[];
    keyStates: Record<string, CellState>;
    onKeyPress: (char: string) => void;
    onEnter: () => void;
    onDelete: () => void;
    disabled?: boolean;
}

export const WordleKeyboard: React.FC<WordleKeyboardProps> = ({
    tiles,
    keyStates,
    onKeyPress,
    onEnter,
    onDelete,
    disabled
}) => {
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
        <div className="flex flex-col gap-[6px] items-center px-4 pb-6 pt-2">
            {[0, 1, 2].map((rowIndex) => (
                <div key={rowIndex} className="flex gap-[5px] items-center justify-center w-full">
                    {tiles.slice(rowIndex * 7, (rowIndex + 1) * 7).map((char, charIndex) => (
                        <button
                            key={`${rowIndex}-${charIndex}`}
                            onClick={() => onKeyPress(char)}
                            disabled={disabled}
                            className={`${getKeyColor(char)} flex items-center justify-center h-[50px] w-[45px] rounded-[6px] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <p className={`font-semibold text-[20px] ${getKeyTextColor(char)}`}>{char}</p>
                        </button>
                    ))}
                </div>
            ))}

            <div className="flex gap-[5px] items-center justify-center w-full">
                <button
                    onClick={onEnter}
                    disabled={disabled}
                    className="bg-[#d4d4d4] flex items-center justify-center h-[50px] px-[20px] rounded-[6px] hover:bg-[#c4c4c4] active:scale-95 transition-all disabled:opacity-50"
                >
                    <p className="font-semibold text-[14px] text-black">확인</p>
                </button>

                {tiles.slice(21).map((char, charIndex) => (
                    <button
                        key={`3-${charIndex}`}
                        onClick={() => onKeyPress(char)}
                        disabled={disabled}
                        className={`${getKeyColor(char)} flex items-center justify-center h-[50px] w-[45px] rounded-[6px] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50`}
                    >
                        <p className={`font-semibold text-[20px] ${getKeyTextColor(char)}`}>{char}</p>
                    </button>
                ))}

                <button
                    onClick={onDelete}
                    disabled={disabled}
                    className="bg-[#d4d4d4] flex items-center justify-center h-[50px] px-[20px] rounded-[6px] hover:bg-[#c4c4c4] active:scale-95 transition-all disabled:opacity-50"
                >
                    <p className="font-semibold text-[14px] text-black">←</p>
                </button>
            </div>
        </div>
    );
};

import React from 'react';
import { motion } from 'framer-motion';
import type { Cell } from '../../../hooks/useWordle';

interface WordleGridProps {
    guesses: Cell[][];
    shakeRow: number | null;
}

export const WordleGrid: React.FC<WordleGridProps> = ({ guesses, shakeRow }) => {
    return (
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
    );
};

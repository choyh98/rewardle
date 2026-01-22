import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
    progress: number;
    height?: number;
    color?: string;
    backgroundColor?: string;
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = 12,
    color = '#ff5656',
    backgroundColor = '#e5e7eb',
    className = ''
}) => {
    return (
        <div
            className={`w-full rounded-full overflow-hidden relative shadow-sm ${className}`}
            style={{ height, backgroundColor }}
        >
            <motion.div
                className="absolute h-full left-0 rounded-full transition-all duration-300"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>
    );
};

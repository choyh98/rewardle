import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    disabled = false,
    variant = 'primary',
    size = 'md',
    className = ''
}) => {
    const baseClasses = 'font-bold rounded-xl transition-all touch-manipulation';
    
    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-[#ff5252] active:bg-[#e05555] disabled:bg-gray-200 disabled:text-gray-400',
        secondary: 'bg-white border-2 border-primary text-primary hover:bg-primary/5 active:bg-primary/10',
        ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
    };
    
    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <motion.button
            whileTap={disabled ? {} : { scale: 0.95 }}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {children}
        </motion.button>
    );
};

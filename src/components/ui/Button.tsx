import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    disabled,
    ...props
}) => {
    const variants = {
        primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95',
        secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:scale-95',
        outline: 'border-2 border-primary text-primary hover:bg-primary/5 active:scale-95',
        ghost: 'text-gray-600 hover:bg-gray-100 active:scale-95',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm rounded-lg',
        md: 'px-4 py-2 rounded-xl font-bold',
        lg: 'px-6 py-3 text-lg rounded-2xl font-bold',
        xl: 'px-8 py-4 text-xl rounded-3xl font-black w-full h-16',
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={cn(
                'inline-flex items-center justify-center transition-all disabled:opacity-50 disabled:pointer-events-none touch-manipulation',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...(props as any)}
        >
            {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {children}
        </motion.button>
    );
};

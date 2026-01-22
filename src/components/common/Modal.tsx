import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    maxWidth = 'md'
}) => {
    const maxWidthClasses = {
        sm: 'max-w-[320px]',
        md: 'max-w-[400px]',
        lg: 'max-w-[500px]'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`bg-white rounded-[24px] p-8 w-full ${maxWidthClasses[maxWidth]}`}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

interface ModalHeaderProps {
    title: string;
    emoji?: string;
    onClose?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, emoji, onClose }) => (
    <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            {emoji && <div className="text-[32px]">{emoji}</div>}
            <h2 className="font-black text-[24px] text-[#121212]">{title}</h2>
        </div>
        {onClose && (
            <button
                onClick={onClose}
                className="text-[#999] hover:text-[#333] text-[28px] leading-none transition-colors"
            >
                ✕
            </button>
        )}
    </div>
);

interface ModalBodyProps {
    children: React.ReactNode;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children }) => (
    <div className="mb-6">
        {children}
    </div>
);

interface ModalFooterProps {
    children: React.ReactNode;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => (
    <div className="flex flex-col gap-3">
        {children}
    </div>
);

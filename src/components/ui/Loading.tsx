import React from 'react';

interface LoadingProps {
    fullScreen?: boolean;
    text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ fullScreen = false, text = '로딩 중...' }) => {
    const content = (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
            {text && <p className="text-primary font-bold text-lg">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
};

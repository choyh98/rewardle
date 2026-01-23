import React from 'react';

interface ShootingWordleFailModalProps {
    onRetry: () => void;
    onGoHome: () => void;
}

export const ShootingWordleFailModal: React.FC<ShootingWordleFailModalProps> = ({ onRetry, onGoHome }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-[16px] p-[32px] max-w-[320px] text-center">
                <div className="mb-[20px]">
                    <p className="font-bold text-[24px] text-[#ff8800] mb-[8px]">시간 종료!</p>
                    <p className="font-normal text-[14px] text-[#737373]">다시 도전해보세요!</p>
                </div>

                <div className="flex flex-col gap-[12px]">
                    <button
                        onClick={onRetry}
                        className="bg-[#ff6b6b] text-white font-semibold text-[16px] py-[12px] px-[24px] rounded-[8px] hover:bg-[#ff5252] transition-colors"
                    >
                        다시 도전하기
                    </button>
                    <button
                        onClick={onGoHome}
                        className="text-[#737373] font-medium text-[14px] py-[8px] hover:text-[#121212] transition-colors touch-manipulation"
                    >
                        홈으로 가기
                    </button>
                </div>
            </div>
        </div>
    );
};

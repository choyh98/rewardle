import React from 'react';

interface AppleSuccessModalProps {
    onStartMission: () => void;
    onGoHome: () => void;
}

export const AppleSuccessModal: React.FC<AppleSuccessModalProps> = ({ onStartMission, onGoHome }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-[16px] p-[32px] max-w-[320px] text-center">
                <div className="mb-[20px]">
                    <div className="text-[48px] mb-[12px]">🎉</div>
                    <p className="font-bold text-[24px] text-[#28c52d] mb-[8px]">정답입니다!</p>
                    <p className="font-semibold text-[20px] text-[#121212]">5포인트가 적립되었습니다.</p>
                </div>

                <div className="flex flex-col gap-[12px]">
                    <button
                        onClick={onStartMission}
                        className="bg-[#ff6b6b] text-white font-semibold text-[16px] py-[12px] px-[24px] rounded-[8px] hover:bg-[#ff5252] transition-colors touch-manipulation"
                    >
                        추가미션하고 5P 더 받기
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

import React from 'react';

interface SuccessModalProps {
    title?: string;
    emoji?: string;
    message?: string;
    onStartMission: () => void;
    onGoHome: () => void;
}

/**
 * 공통 성공 모달 컴포넌트
 * 사과게임, 슈팅워들에서 사용
 */
export const SuccessModal: React.FC<SuccessModalProps> = ({ 
    title = '글자를 모두 모았습니다!',
    emoji,
    message = '5포인트가 적립되었습니다.',
    onStartMission, 
    onGoHome 
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-[16px] p-[32px] max-w-[320px] text-center">
                <div className="mb-[20px]">
                    {emoji && <div className="text-[48px] mb-[12px]">{emoji}</div>}
                    <p className="font-bold text-[18px] text-[#28c52d] mb-[8px]">{title}</p>
                    <p className="font-semibold text-[20px] text-[#121212]">{message}</p>
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

interface FailModalProps {
    title?: string;
    message?: string;
    score?: number;
    onRetry: () => void;
    onGoHome: () => void;
}

/**
 * 공통 실패 모달 컴포넌트
 * 사과게임, 슈팅워들에서 사용
 */
export const FailModal: React.FC<FailModalProps> = ({ 
    title = '시간 종료!',
    message = '다시 도전해보세요!',
    score,
    onRetry, 
    onGoHome 
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-[16px] p-[32px] max-w-[320px] text-center">
                <div className="mb-[20px]">
                    <p className="font-bold text-[24px] text-[#ff8800] mb-[8px]">{title}</p>
                    {score !== undefined && (
                        <p className="font-medium text-[16px] text-[#121212] mb-[12px]">
                            최종 점수: {score}점
                        </p>
                    )}
                    <p className="font-normal text-[14px] text-[#737373]">{message}</p>
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

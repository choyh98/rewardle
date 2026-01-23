import React from 'react';

interface WordleHelpModalProps {
    onClose: () => void;
}

export const WordleHelpModal: React.FC<WordleHelpModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-[20px]" onClick={onClose}>
            <div className="bg-white rounded-[20px] p-[32px] max-w-[360px] w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-[24px]">
                    <h2 className="font-bold text-[24px] text-[#121212]">게임 방법</h2>
                    <button
                        onClick={onClose}
                        className="text-[#737373] hover:text-[#121212] text-[28px] leading-none transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col gap-[24px] text-left">
                    {/* Step 1 */}
                    <div className="flex gap-[12px]">
                        <div className="bg-[#d4d4d4] rounded-full size-[36px] shrink-0 flex items-center justify-center">
                            <span className="font-bold text-[18px] text-[#121212]">1</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-[18px] text-[#121212] mb-[8px]">
                                숨겨진 5글자 가게명을 맞춰보세요!
                            </p>
                            <p className="font-normal text-[14px] text-[#737373]">
                                6번의 기회 안에 정답을 맞추면 3포인트를 받을 수 있어요.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-[12px]">
                        <div className="bg-[#d4d4d4] rounded-full size-[36px] shrink-0 flex items-center justify-center">
                            <span className="font-bold text-[18px] text-[#121212]">2</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-[18px] text-[#121212] mb-[8px]">
                                색상으로 힌트를 확인하세요!
                            </p>
                            <p className="font-normal text-[14px] text-[#737373] mb-[12px]">
                                글자를 입력하고 확인을 누르면 색상으로 정답 여부를 알려드려요.
                            </p>

                            {/* Visual example */}
                            <div className="bg-[#fef6e8] rounded-[12px] p-[16px]">
                                <div className="flex flex-col gap-[12px]">
                                    <div className="flex items-center gap-[8px]">
                                        <div className="bg-[#28c52d] size-[40px] rounded-[4px] flex items-center justify-center">
                                            <span className="font-bold text-[20px] text-white">아</span>
                                        </div>
                                        <p className="font-normal text-[13px] text-[#121212]">
                                            위치와 글자 정확!
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-[8px]">
                                        <div className="bg-[#ff8800] size-[40px] rounded-[4px] flex items-center justify-center">
                                            <span className="font-bold text-[20px] text-white">쿠</span>
                                        </div>
                                        <p className="font-normal text-[13px] text-[#121212]">
                                            글자는 맞지만 위치 틀림
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-[8px]">
                                        <div className="bg-[#787c7e] size-[40px] rounded-[4px] flex items-center justify-center">
                                            <span className="font-bold text-[20px] text-white">지</span>
                                        </div>
                                        <p className="font-normal text-[13px] text-[#121212]">
                                            답에 포함되지 않음
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-[12px]">
                        <div className="bg-[#d4d4d4] rounded-full size-[36px] shrink-0 flex items-center justify-center">
                            <span className="font-bold text-[18px] text-[#121212]">3</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-[18px] text-[#121212] mb-[8px]">
                                키보드에서 글자를 선택하세요!
                            </p>
                            <p className="font-normal text-[14px] text-[#737373]">
                                같은 글자를 여러 번 클릭할 수 있어요. 5글자를 모두 입력한 후 확인 버튼을 눌러주세요.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="bg-[#ff6b6b] text-white font-bold text-[18px] py-[16px] px-[24px] rounded-[12px] hover:bg-[#ff5252] transition-colors mt-[8px] w-full"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

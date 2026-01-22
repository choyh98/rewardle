import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { Brand } from '../../../data/brands';

interface AppleMissionModalProps {
    brand: Brand;
    quizAnswer: string;
    quizResult: { correct: boolean } | null;
    onAnswerChange: (value: string) => void;
    onSubmit: () => void;
    onGoHome: () => void;
}

export const AppleMissionModal: React.FC<AppleMissionModalProps> = ({
    brand,
    quizAnswer,
    quizResult,
    onAnswerChange,
    onSubmit,
    onGoHome,
}) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
            <div className="bg-white rounded-[24px] p-8 max-w-[400px] w-full relative">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="text-[32px]">🎯</div>
                        <h2 className="font-black text-[24px] text-[#ff6b6b]">
                            추가 미션!
                        </h2>
                    </div>

                    <div className="bg-[#fff0db] rounded-[16px] p-4">
                        <p className="text-[18px] text-[#333] leading-relaxed">
                            {brand.placeQuiz.question}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-[16px] text-[#666]">
                            정답 입력
                        </label>
                        <input
                            type="text"
                            value={quizAnswer}
                            onChange={(e) => onAnswerChange(e.target.value)}
                            className="border-2 border-[#e5e5e5] rounded-[12px] px-4 py-3 text-[18px] focus:border-[#ff6b6b] focus:outline-none"
                            placeholder="숫자만 입력"
                        />
                    </div>

                    <div className="bg-[#f5f5f5] rounded-[12px] px-4 py-3">
                        <p className="text-[14px] text-[#666] text-center">
                            정답시 +{brand.placeQuiz.bonusPoints} 보너스 포인트!
                        </p>
                    </div>

                    <a
                        href={brand.placeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white border-2 border-[#ff6b6b] h-[50px] rounded-[12px] text-[#ff6b6b] font-black text-[20px] hover:bg-[#fff5f5] active:bg-[#ffe5e5] transition-colors flex items-center justify-center gap-2"
                    >
                        <ExternalLink size={18} /> 플레이스 보러가기
                    </a>

                    <button
                        onClick={onSubmit}
                        disabled={(quizResult?.correct) || !quizAnswer.trim()}
                        className="bg-[#ff6b6b] h-[50px] rounded-[12px] text-white font-black text-[20px] hover:bg-[#ff5252] active:bg-[#e05555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        제출하기
                    </button>

                    {/* 인라인 결과 메시지 */}
                    {quizResult !== null && (
                        <div className={`text-center font-bold ${quizResult.correct ? 'text-[#4caf50]' : 'text-[#ff6b6b]'}`}>
                            {quizResult.correct ? '정답입니다! 포인트가 적립되었습니다.' : '아쉬워요! 다시 도전해보세요.'}
                        </div>
                    )}
                    {quizResult?.correct && (
                        <button 
                            onClick={onGoHome} 
                            className="w-full mt-2 h-12 text-[#737373] font-medium hover:text-[#121212] transition-colors"
                        >
                            홈으로 돌아가기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

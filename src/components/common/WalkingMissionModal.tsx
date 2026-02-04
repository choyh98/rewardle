import React, { useState } from 'react';
import { ExternalLink, Copy, CheckCircle2, Map, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { WalkingMissionData } from '../../types';

interface WalkingMissionModalProps {
    walkingData: WalkingMissionData;
    placeUrl: string;
    bonusPoints: number;
    onHome: () => void;
    onSuccess: () => void; // onSubmit 대신 성공 콜백만
}

/**
 * 도보 미션 모달 컴포넌트
 * 토스 스타일의 3단계 미션 플로우
 */
export const WalkingMissionModal: React.FC<WalkingMissionModalProps> = ({
    walkingData,
    placeUrl,
    bonusPoints,
    onHome,
    onSuccess
}) => {
    const [step, setStep] = useState(1);
    const [isCopied, setIsCopied] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');

    const handleCopy = () => {
        navigator.clipboard.writeText(walkingData.seoKeyword);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleVerify = () => {
        // 시간 차이 허용 로직 (±2분)
        const userMinutes = parseInt(userAnswer.replace(/[^0-9]/g, ''));
        const correctMinutes = parseInt(walkingData.correctAnswer.replace(/[^0-9]/g, ''));
        
        if (isNaN(userMinutes)) {
            alert('숫자로 입력해주세요! (예: 8분)');
            return;
        }
        
        const isCorrect = Math.abs(userMinutes - correctMinutes) <= 2;
        
        if (isCorrect) {
            onSuccess();
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff6b6b', '#60A5FA', '#FFFFFF']
            });
            setStep(3);
        } else {
            alert(`입력하신 시간이 너무 다릅니다. 다시 확인해주세요!\n(힌트: 정답은 ${correctMinutes}분 전후입니다)`);
            setUserAnswer('');
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6"
            onClick={(e) => e.stopPropagation()}
        >
            <div 
                className="bg-white rounded-[24px] max-w-[440px] w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Banner */}
                <div className="p-8 bg-gradient-to-b from-[#fff0db] to-white text-center">
                    <div className="w-16 h-16 bg-white rounded-[20px] mx-auto mb-4 flex items-center justify-center shadow-md">
                        <Map className="text-[#ff6b6b]" size={32} />
                    </div>
                    <h2 className="text-[22px] font-black mb-2">
                        {step === 3 ? '미션 완료!' : '길 찾고 포인트 받기'}
                    </h2>
                    <p className="text-[#737373] text-[15px]">
                        매장까지 가는 길을 확인해보세요
                    </p>
                </div>

                <div className="p-6">
                    {/* Step 1: 키워드 복사 */}
                    {step === 1 && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="bg-white rounded-[16px] p-6 border-2 border-[#f0f0f0]">
                                <span className="inline-block text-[12px] font-bold text-[#ff6b6b] bg-[#fff0db] px-3 py-1 rounded-full mb-3">
                                    Step 1
                                </span>
                                <h3 className="text-[18px] font-bold mb-2">
                                    키워드를 복사하세요
                                </h3>
                                <p className="text-[#737373] text-[14px] mb-5">
                                    네이버 지도에서 <span className="text-[#ff6b6b] font-bold">검색 결과 1등</span>에 나오는 키워드입니다.
                                </p>

                                <div className="bg-[#f5f5f5] p-4 rounded-[12px] flex justify-between items-center border border-[#e5e5e5] mb-4">
                                    <span className="font-semibold text-[16px]">{walkingData.seoKeyword}</span>
                                    <button 
                                        onClick={handleCopy}
                                        className="flex items-center gap-1.5 text-[14px] font-semibold transition-colors"
                                        style={{ color: isCopied ? '#22C55E' : '#ff6b6b' }}
                                    >
                                        {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        {isCopied ? '복사됨' : '복사'}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-[#737373] text-[14px]">
                                    <Map size={16} />
                                    <span>출발지: <strong className="text-[#121212]">{walkingData.startPoint}</strong></span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    window.open(`https://map.naver.com/v5/search/${encodeURIComponent(walkingData.seoKeyword)}`, '_blank');
                                    setStep(2);
                                }}
                                className="w-full bg-[#ff6b6b] h-[56px] rounded-[12px] text-white font-black text-[18px] hover:bg-[#ff5252] active:bg-[#e05555] transition-colors flex items-center justify-center gap-2"
                            >
                                네이버 지도 열기 <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* Step 2: 정답 입력 */}
                    {step === 2 && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="bg-white rounded-[16px] p-6 border-2 border-[#f0f0f0]">
                                <span className="inline-block text-[12px] font-bold text-[#ff6b6b] bg-[#fff0db] px-3 py-1 rounded-full mb-3">
                                    Step 2
                                </span>
                                <h3 className="text-[18px] font-bold mb-2">
                                    정답을 입력해주세요
                                </h3>
                                <p className="text-[#737373] text-[14px] mb-5">
                                    {walkingData.quizQuestion}
                                </p>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                    <p className="text-xs text-yellow-800 font-semibold">
                                        Tip: 네이버 지도 예상 시간 기준 ±2분까지 정답으로 인정됩니다!
                                    </p>
                                </div>

                                <input
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="예: 8분"
                                    className="w-full border-2 border-[#e5e5e5] rounded-[12px] px-4 py-4 text-[20px] font-bold text-center focus:border-[#ff6b6b] focus:outline-none"
                                />
                            </div>

                            <a
                                href={placeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-white border-2 border-[#ff6b6b] h-[50px] rounded-[12px] text-[#ff6b6b] font-bold text-[16px] hover:bg-[#fff5f5] transition-colors flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={18} /> 매장 플레이스 보기
                            </a>

                            <button
                                onClick={handleVerify}
                                disabled={!userAnswer.trim()}
                                className="w-full bg-[#ff6b6b] h-[56px] rounded-[12px] text-white font-black text-[18px] hover:bg-[#ff5252] active:bg-[#e05555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                정답 제출하기
                            </button>
                        </div>
                    )}

                    {/* Step 3: 완료 */}
                    {step === 3 && (
                        <div className="text-center py-8 animate-slide-up">
                            <div className="w-20 h-20 bg-[#ff6b6b] rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="text-white" size={40} />
                            </div>
                            <h3 className="text-[24px] font-black mb-3">미션 완료!</h3>
                            <p className="text-[#737373] mb-6">
                                성공적으로 길을 찾으셨네요.<br />
                                <strong className="text-[#ff6b6b]">{bonusPoints}포인트</strong>가 적립되었습니다.
                            </p>

                            <button
                                onClick={onHome}
                                className="w-full bg-[#f5f5f5] h-[50px] rounded-[12px] text-[#121212] font-bold text-[16px] hover:bg-[#e5e5e5] transition-colors"
                            >
                                홈으로 돌아가기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Confetti 패키지가 없으면 설치 필요: npm install canvas-confetti @types/canvas-confetti

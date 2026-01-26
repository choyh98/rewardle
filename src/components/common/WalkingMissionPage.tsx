import React, { useState, useMemo } from 'react';
import { ArrowLeft, Copy, CheckCircle2, MapPin, Navigation, ChevronRight, Info, Bike, FootprintsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { WalkingMissionData, TransportType } from '../../types';
import { WalkingMissionTutorial } from './WalkingMissionTutorial';

interface WalkingMissionPageProps {
    walkingData: WalkingMissionData;
    storeName: string;
    storeImage?: string;
    placeUrl?: string;
    bonusPoints: number;
    onBack: () => void;
    onSuccess: () => void;
}

/**
 * 네이버 지도 스타일의 풀페이지 도보 미션
 * 토스 감성의 3단계 플로우
 * 도보/자전거 랜덤 선택
 */
export const WalkingMissionPage: React.FC<WalkingMissionPageProps> = ({
    walkingData,
    storeName,
    storeImage,
    bonusPoints,
    onBack,
    onSuccess
}) => {
    // 랜덤으로 교통수단 선택 (최초 1회만)
    const randomTransportType = useMemo<TransportType>(() => {
        return Math.random() < 0.5 ? 'walking' : 'bicycle';
    }, []);

    const [step, setStep] = useState<'intro' | 'map' | 'verify' | 'success'>('intro');
    const [isCopied, setIsCopied] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [showTutorial, setShowTutorial] = useState(false);

    // 선택된 교통수단에 따라 정답 설정
    const correctAnswer = randomTransportType === 'walking' 
        ? walkingData.walkingTime 
        : walkingData.bicycleTime;

    const handleCopy = () => {
        navigator.clipboard.writeText(walkingData.seoKeyword);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleVerify = () => {
        const userMinutes = parseInt(userAnswer.replace(/[^0-9]/g, ''));
        const correctMinutes = parseInt(correctAnswer.replace(/[^0-9]/g, ''));
        
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
            setStep('success');
        } else {
            alert(`입력하신 시간이 너무 다릅니다. 다시 확인해주세요!\n(힌트: 정답은 ${correctMinutes}분 전후입니다)`);
            setUserAnswer('');
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            {/* 헤더 */}
            <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
                <div className="flex items-center justify-between px-4 h-14">
                    <button 
                        onClick={onBack}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                    >
                        <ArrowLeft size={24} className="text-gray-800" />
                    </button>
                    <h1 className="text-[17px] font-bold text-gray-800">길찾기 미션</h1>
                    <div className="w-10" /> {/* 균형 맞추기 */}
                </div>
            </header>

            <AnimatePresence mode="wait">
                {/* Step 1: 인트로 */}
                {step === 'intro' && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="pb-20"
                    >
                        {/* 매장 이미지 */}
                        <div className="w-full h-[240px] bg-gray-100 relative overflow-hidden">
                            {storeImage ? (
                                <img 
                                    src={storeImage} 
                                    alt={storeName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <MapPin size={48} className="text-gray-300" />
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                <h2 className="text-white font-bold text-[20px]">{storeName}</h2>
                            </div>
                        </div>

                        {/* 미션 설명 */}
                        <div className="p-6 space-y-6">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-[20px] p-6 border-2 border-blue-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Navigation className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-bold text-blue-600">WALKING MISSION</p>
                                        <p className="text-[18px] font-black text-gray-800">길 찾고 포인트 받기</p>
                                    </div>
                                </div>
                                <p className="text-[14px] text-gray-600 leading-relaxed">
                                    네이버 지도에서 매장까지의 경로를 확인하고<br />
                                    도보 시간을 맞춰보세요!
                                </p>
                            </div>

                            {/* 검색 키워드 */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 bg-[#ff6b6b] rounded-full flex items-center justify-center text-white text-[12px] font-bold">1</div>
                                    <p className="text-[15px] font-bold text-gray-800">황금 키워드 복사하기</p>
                                    <button
                                        onClick={() => setShowTutorial(true)}
                                        className="ml-auto text-[12px] text-blue-600 font-bold underline"
                                    >
                                        사용법 보기
                                    </button>
                                </div>
                                <div className="bg-white border-2 border-gray-200 rounded-[16px] p-4">
                                    <p className="text-[12px] text-gray-500 mb-2">네이버 지도 검색어</p>
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-[16px] font-bold text-gray-800 flex-1">{walkingData.seoKeyword}</p>
                                        <button
                                            onClick={handleCopy}
                                            className={`px-4 py-2 rounded-lg font-bold text-[14px] transition-all ${
                                                isCopied 
                                                    ? 'bg-green-100 text-green-600' 
                                                    : 'bg-[#ff6b6b] text-white active:scale-95'
                                            }`}
                                        >
                                            {isCopied ? (
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 size={16} /> 완료
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <Copy size={16} /> 복사
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 출발지 정보 */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 bg-[#ff6b6b] rounded-full flex items-center justify-center text-white text-[12px] font-bold">2</div>
                                    <p className="text-[15px] font-bold text-gray-800">출발지 확인</p>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-[16px] p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin className="text-blue-600" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[12px] text-gray-500">출발 위치</p>
                                        <p className="text-[15px] font-bold text-gray-800">{walkingData.startPoint}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 교통수단 안내 */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 bg-[#ff6b6b] rounded-full flex items-center justify-center text-white text-[12px] font-bold">3</div>
                                    <p className="text-[15px] font-bold text-gray-800">이동 수단</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-[16px] p-4 flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        randomTransportType === 'walking' ? 'bg-blue-500' : 'bg-green-500'
                                    }`}>
                                        {randomTransportType === 'walking' ? (
                                            <FootprintsIcon className="text-white" size={24} />
                                        ) : (
                                            <Bike className="text-white" size={24} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[12px] text-gray-500">오늘의 미션</p>
                                        <p className="text-[16px] font-black text-gray-800">
                                            {randomTransportType === 'walking' ? '도보로 이동하기' : '자전거로 이동하기'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 예상 시간 힌트 */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-[16px] p-4 flex items-start gap-3">
                                <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-[13px] font-bold text-yellow-800 mb-1">
                                        {randomTransportType === 'walking' ? '도보' : '자전거'} 이동 시간은 <span className="text-[16px]">? 분</span>
                                    </p>
                                    <p className="text-[12px] text-yellow-700">
                                        네이버 지도에서 경로를 확인하고 답을 맞춰보세요!<br />
                                        (±2분 오차는 정답으로 인정됩니다)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 미션 시작 버튼 */}
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                            <button
                                onClick={() => {
                                    window.open('https://www.naver.com', '_blank');
                                    setStep('verify');
                                }}
                                className="w-full h-[56px] bg-[#ff6b6b] text-white font-black text-[17px] rounded-[16px] hover:bg-[#ff5252] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                길찾기 시작하기 <ChevronRight size={24} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: 정답 입력 */}
                {step === 'verify' && (
                    <motion.div
                        key="verify"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6 pb-32 space-y-6"
                    >
                        <div className="text-center pt-8 pb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                                <Navigation className="text-white" size={36} />
                            </div>
                            <h3 className="text-[24px] font-black text-gray-800 mb-2">경로를 확인하셨나요?</h3>
                            <p className="text-[15px] text-gray-500">
                                네이버 지도에서 확인한 시간을 입력해주세요
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[14px] font-bold text-gray-700 mb-2">
                                    {walkingData.quizQuestion}
                                </label>
                                <input
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="예: 8분 또는 8"
                                    className="w-full h-[64px] border-2 border-gray-300 rounded-[16px] px-6 text-[24px] font-bold text-center focus:border-[#ff6b6b] focus:outline-none transition-all"
                                    autoFocus
                                />
                                <div className="mt-3 space-y-1">
                                    <p className="text-xs text-gray-600 text-center font-medium">
                                        숫자만 입력하셔도 됩니다 (예: 8분 = 8)
                                    </p>
                                    <p className="text-xs text-blue-600 text-center font-bold">
                                        ±2분 오차까지 정답으로 인정됩니다
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                            <button
                                onClick={handleVerify}
                                disabled={!userAnswer.trim()}
                                className="w-full h-[56px] bg-[#ff6b6b] text-white font-black text-[17px] rounded-[16px] hover:bg-[#ff5252] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                정답 제출하기
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: 성공 */}
                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center min-h-[calc(100vh-56px)] p-6"
                    >
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="w-32 h-32 bg-[#ff6b6b] rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl"
                            >
                                <CheckCircle2 className="text-white" size={64} />
                            </motion.div>
                            <h3 className="text-[32px] font-black text-gray-800 mb-3">미션 완료!</h3>
                            <p className="text-[16px] text-gray-600 mb-2">
                                성공적으로 길을 찾으셨네요.
                            </p>
                            <p className="text-[20px] font-bold text-[#ff6b6b] mb-8">
                                {bonusPoints}포인트가 적립되었습니다!
                            </p>

                            <button
                                onClick={onBack}
                                className="w-full max-w-[280px] h-[52px] bg-gray-100 text-gray-800 font-bold text-[16px] rounded-[14px] hover:bg-gray-200 transition-colors"
                            >
                                홈으로 돌아가기
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 튜토리얼 모달 */}
            <WalkingMissionTutorial
                isOpen={showTutorial}
                onClose={() => setShowTutorial(false)}
                seoKeyword={walkingData.seoKeyword}
                storeName={storeName}
                startPoint={walkingData.startPoint}
                storeAddress={walkingData.storeAddress}
                transportType={randomTransportType}
            />
        </div>
    );
};

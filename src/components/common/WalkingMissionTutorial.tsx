import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, MapPin, Bike, FootprintsIcon } from 'lucide-react';
import type { TransportType } from '../../types';

interface WalkingMissionTutorialProps {
    isOpen: boolean;
    onClose: () => void;
    seoKeyword: string;
    storeName: string;
    startPoint: string;
    storeAddress?: string;
    transportType: TransportType;
}

/**
 * 길찾기 미션 튜토리얼 컴포넌트
 * - 심플하고 세련된 디자인
 * - admin 사이트에서도 재사용 가능
 */
export const WalkingMissionTutorial: React.FC<WalkingMissionTutorialProps> = ({
    isOpen,
    onClose,
    seoKeyword,
    storeName,
    startPoint,
    storeAddress,
    transportType
}) => {
    const [tutorialStep, setTutorialStep] = useState(0);
    const [animationPhase, setAnimationPhase] = useState<'init' | 'paste-button' | 'paste-click' | 'typing'>('init');
    const [clickDirections, setClickDirections] = useState(false);

    const tutorialSteps = [
        {
            number: "1",
            title: "먼저 검색어를 붙여 넣어 주세요",
            keyword: seoKeyword
        },
        {
            number: "2",
            title: `${storeName}\n찾은 뒤`,
            subtitle: ""
        },
        {
            number: "3",
            title: "길찾기 버튼을 눌러주세요",
            subtitle: ""
        }
    ];

    const handleClose = () => {
        setTutorialStep(0);
        setAnimationPhase('init');
        setClickDirections(false);
        onClose();
    };

    // Step 0 애니메이션 시퀀스
    React.useEffect(() => {
        if (tutorialStep === 0) {
            setAnimationPhase('init');
            
            // 1. 붙여넣기 버튼 등장
            const timer1 = setTimeout(() => {
                setAnimationPhase('paste-button');
            }, 500);

            // 2. 붙여넣기 버튼 클릭 애니메이션
            const timer2 = setTimeout(() => {
                setAnimationPhase('paste-click');
            }, 2000);

            // 3. 키워드 타이핑
            const timer3 = setTimeout(() => {
                setAnimationPhase('typing');
            }, 2300);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
            };
        }
    }, [tutorialStep]);

    // Step 1 애니메이션 시퀀스 (길찾기 버튼 터치)
    React.useEffect(() => {
        if (tutorialStep === 1) {
            setClickDirections(false);
            const timer = setTimeout(() => {
                setClickDirections(true);
            }, 1500);
            
            // 터치 애니메이션 후 초기화 (반복을 위해)
            const resetTimer = setTimeout(() => {
                setClickDirections(false);
            }, 2500);
            
            return () => {
                clearTimeout(timer);
                clearTimeout(resetTimer);
            };
        }
    }, [tutorialStep]);
    
    // Step 1 반복 애니메이션
    React.useEffect(() => {
        if (tutorialStep === 1 && !clickDirections) {
            const repeatTimer = setTimeout(() => {
                setClickDirections(true);
            }, 3000);
            return () => clearTimeout(repeatTimer);
        }
    }, [tutorialStep, clickDirections]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                onClick={() => {
                    if (tutorialStep === tutorialSteps.length - 1) {
                        handleClose();
                    }
                }}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-3xl max-w-[360px] w-full overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 컨텐츠 */}
                    <div className="p-8 pt-12 pb-6">
                        <motion.div
                            key={tutorialStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* 숫자 + 제목 */}
                            <div className="text-center mb-6">
                                <div className="text-[64px] font-black text-[#ff6b6b] mb-4 leading-none">
                                    {tutorialSteps[tutorialStep].number}
                                </div>
                                <h3 className="text-[18px] font-bold text-gray-900 leading-tight whitespace-pre-line">
                                    {tutorialSteps[tutorialStep].title}
                                </h3>
                            </div>

                            {/* 네이버 지도 스타일 UI */}
                            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-4">
                                {/* Step 1: 검색 화면 */}
                                {tutorialStep === 0 && (
                                    <div>
                                        {/* 검색창 */}
                                        <div className="bg-[#1ec800] p-4">
                                            <div className="bg-white rounded-lg px-4 py-3 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                <AnimatePresence mode="wait">
                                                    {animationPhase === 'typing' ? (
                                                        <motion.span
                                                            key="keyword"
                                                            initial={{ opacity: 0, width: 0 }}
                                                            animate={{ opacity: 1, width: "auto" }}
                                                            transition={{ duration: 0.8 }}
                                                            className="text-[14px] font-medium text-gray-900 overflow-hidden whitespace-nowrap"
                                                        >
                                                            {seoKeyword}
                                                        </motion.span>
                                                    ) : (
                                                        <motion.span
                                                            key="placeholder"
                                                            className="text-[14px] font-medium text-gray-400"
                                                        >
                                                            검색어
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        {/* 지도 영역 */}
                                        <div className="h-[160px] bg-gray-100 relative flex flex-col items-center justify-center">
                                            {/* 붙여넣기 버튼 */}
                                            <AnimatePresence>
                                                {(animationPhase === 'paste-button' || animationPhase === 'paste-click') && (
                                                    <motion.button
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ 
                                                            opacity: 1, 
                                                            y: 0,
                                                            scale: animationPhase === 'paste-click' ? 0.95 : 1
                                                        }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200"
                                                    >
                                                        <span className="text-[14px] font-bold text-gray-800">붙여넣기</span>
                                                    </motion.button>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: 검색 결과 */}
                                {tutorialStep === 1 && (
                                    <div>
                                        {/* 매장 정보 */}
                                        <div className="bg-white px-4 pt-4 pb-3 border-b">
                                            <h4 className="font-bold text-gray-900 text-[17px] mb-2 leading-tight">{storeName}</h4>
                                            {/* 평점 & 리뷰 한 줄 */}
                                            <div className="flex items-center text-[13px] text-gray-600">
                                                <span className="text-[#1ec800] font-bold mr-1">★ 4.91</span>
                                                <span className="mr-2">방문자 리뷰 4,547</span>
                                                <span>블로그 리뷰 2,390</span>
                                            </div>
                                        </div>
                                        {/* 버튼들 */}
                                        <div className="bg-white px-4 py-3 flex items-center relative">
                                            <button className="flex-1 flex flex-col items-center justify-center py-2 text-gray-700">
                                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="text-[12px] font-medium">전화</span>
                                            </button>
                                            <div className="w-[1px] h-8 bg-gray-300"></div>
                                            <button className="flex-1 flex flex-col items-center justify-center py-2 text-gray-700">
                                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                </svg>
                                                <span className="text-[12px] font-medium">저장</span>
                                            </button>
                                            <div className="w-[1px] h-8 bg-gray-300"></div>
                                            <motion.button
                                                animate={clickDirections ? { 
                                                    scale: [1, 0.95, 1],
                                                } : {}}
                                                transition={{ duration: 0.3 }}
                                                className="flex-1 flex flex-col items-center justify-center py-2 text-[#1ec800] relative"
                                            >
                                                <Navigation className="w-6 h-6 mb-1" strokeWidth={1.5} />
                                                <span className="text-[12px] font-bold">길찾기</span>
                                                
                                                {/* 터치 애니메이션 동그라미 */}
                                                <AnimatePresence>
                                                    {clickDirections && (
                                                        <>
                                                            {/* 외부 동그라미 (큰 원) */}
                                                            <motion.div
                                                                initial={{ scale: 0, opacity: 0.8 }}
                                                                animate={{ scale: 2, opacity: 0 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                                className="absolute inset-0 m-auto w-12 h-12 rounded-full border-4 border-[#1ec800] pointer-events-none"
                                                                style={{ 
                                                                    left: '50%',
                                                                    top: '50%',
                                                                    transform: 'translate(-50%, -50%)'
                                                                }}
                                                            />
                                                            {/* 내부 동그라미 (작은 원) */}
                                                            <motion.div
                                                                initial={{ scale: 1, opacity: 0.5 }}
                                                                animate={{ scale: 1.5, opacity: 0 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                                className="absolute w-8 h-8 rounded-full bg-[#1ec800] pointer-events-none"
                                                                style={{ 
                                                                    left: '50%',
                                                                    top: '50%',
                                                                    transform: 'translate(-50%, -50%)'
                                                                }}
                                                            />
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </motion.button>
                                            <div className="w-[1px] h-8 bg-gray-300"></div>
                                            <button className="flex-1 flex flex-col items-center justify-center py-2 text-gray-700">
                                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                </svg>
                                                <span className="text-[12px] font-medium">공유</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: 길찾기 화면 */}
                                {tutorialStep === 2 && (
                                    <div>
                                        {/* 출발/도착 */}
                                        <div className="bg-white p-4 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-[11px] font-bold">출발</span>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={startPoint}
                                                    readOnly
                                                    className="flex-1 text-[14px] font-medium text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-[#1ec800] rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-[11px] font-bold">도착</span>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={storeName}
                                                    readOnly
                                                    className="flex-1 text-[14px] font-medium text-gray-900 bg-gray-50 rounded px-3 py-2 border border-gray-200"
                                                />
                                            </div>
                                        </div>
                                        {/* 교통수단 탭 */}
                                        <div className="flex border-t">
                                            <div className="flex-1 py-3 text-center text-[13px] text-gray-400">
                                                대중교통
                                            </div>
                                            <div className="flex-1 py-3 text-center text-[13px] text-gray-400">
                                                자동차
                                            </div>
                                            <div className="flex-1 py-3 text-center text-[13px] font-bold text-[#1ec800] border-b-2 border-[#1ec800]">
                                                도보
                                            </div>
                                            <div className="flex-1 py-3 text-center text-[13px] text-gray-400">
                                                자전거
                                            </div>
                                        </div>
                                        {/* 결과 */}
                                        <div className="bg-blue-50 p-4 border-t">
                                            <div className="flex items-center gap-3">
                                                {transportType === 'walking' ? (
                                                    <FootprintsIcon className="text-blue-600" size={32} />
                                                ) : (
                                                    <Bike className="text-blue-600" size={32} />
                                                )}
                                                <div>
                                                    <div className="text-[11px] text-gray-600 mb-1">
                                                        {transportType === 'walking' ? '도보' : '자전거'}
                                                    </div>
                                                    <div className="text-[24px] font-black text-gray-900">? 분</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 힌트 텍스트 */}
                            <p className="text-[13px] text-gray-500 text-center leading-relaxed">
                                {tutorialStep === 0 && "네이버 지도에 검색하세요"}
                                {tutorialStep === 1 && "매장을 찾고 길찾기 버튼을 누르세요"}
                                {tutorialStep === 2 && "출발지를 입력하고 시간을 확인하세요"}
                            </p>
                        </motion.div>
                    </div>

                    {/* 버튼 */}
                    <div className="px-6 pb-6 flex gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 h-[48px] bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            {tutorialStep < tutorialSteps.length - 1 ? '이전' : '닫기'}
                        </button>
                        {tutorialStep < tutorialSteps.length - 1 ? (
                            <button
                                onClick={() => setTutorialStep(tutorialStep + 1)}
                                className="flex-1 h-[48px] bg-[#ff6b6b] text-white font-bold rounded-xl hover:bg-[#ff5252] transition-colors"
                            >
                                다음
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    handleClose();
                                    // 네이버 메인으로 이동
                                    window.open('https://www.naver.com', '_blank');
                                }}
                                className="flex-1 h-[48px] bg-[#ff6b6b] text-white font-bold rounded-xl hover:bg-[#ff5252] transition-colors"
                            >
                                시작하기
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

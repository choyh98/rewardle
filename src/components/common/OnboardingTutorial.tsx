import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Play, Target, Award } from 'lucide-react';

interface OnboardingStep {
    title: string;
    description: string;
    image?: string;
    emoji?: string;
}

const steps: OnboardingStep[] = [
    {
        emoji: 'game',
        title: '게임을 선택하세요',
        description: '워들, 슈팅워들, 사과게임 중\n하나를 선택해서 시작해보세요!'
    },
    {
        emoji: 'target',
        title: '가게명을 맞춰보세요',
        description: '게임을 플레이하고\n숨겨진 가게명을 맞춰보세요!'
    },
    {
        emoji: 'coin',
        title: '포인트를 받으세요',
        description: '게임을 완료하면 포인트를 받고\n온누리상품권으로 교환할 수 있어요!'
    },
    {
        emoji: 'gift',
        title: '하루 10번 플레이 가능',
        description: '매일 10번까지 게임을 플레이하고\n포인트를 모아보세요!'
    }
];

interface OnboardingTutorialProps {
    onComplete: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full relative"
            >
                {/* 스킵 버튼 */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* 진행 표시 */}
                <div className="flex gap-2 mb-8 justify-center">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all ${
                                index === currentStep
                                    ? 'bg-primary w-8'
                                    : index < currentStep
                                    ? 'bg-primary/50 w-2'
                                    : 'bg-gray-200 w-2'
                            }`}
                        />
                    ))}
                </div>

                {/* 콘텐츠 */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                    >
                        {/* 아이콘 */}
                        <div className="mb-6 flex items-center justify-center">
                            {steps[currentStep].emoji === 'game' && (
                                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                                    <Play className="w-10 h-10 text-white fill-current" />
                                </div>
                            )}
                            {steps[currentStep].emoji === 'target' && (
                                <div className="w-20 h-20 bg-[#ff6b6b] rounded-full flex items-center justify-center">
                                    <Target className="w-10 h-10 text-white" />
                                </div>
                            )}
                            {steps[currentStep].emoji === 'coin' && (
                                <div className="w-20 h-20 bg-[#fbbf24] rounded-full flex items-center justify-center">
                                    <Award className="w-10 h-10 text-white" />
                                </div>
                            )}
                            {steps[currentStep].emoji === 'gift' && (
                                <div className="w-20 h-20 bg-[#10b981] rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* 제목 */}
                        <h2 className="text-2xl font-black text-gray-800 mb-4">
                            {steps[currentStep].title}
                        </h2>

                        {/* 설명 */}
                        <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line mb-8">
                            {steps[currentStep].description}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* 버튼 */}
                <div className="flex gap-3">
                    {currentStep > 0 && (
                        <button
                            onClick={handlePrev}
                            className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <ChevronLeft size={20} />
                            이전
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                    >
                        {currentStep === steps.length - 1 ? '시작하기' : '다음'}
                        {currentStep < steps.length - 1 && <ChevronRight size={20} />}
                    </button>
                </div>

                {/* 하단 스킵 텍스트 */}
                <button
                    onClick={handleSkip}
                    className="w-full text-center text-gray-400 text-sm mt-4 hover:text-gray-600 transition-colors"
                >
                    건너뛰기
                </button>
            </motion.div>
        </div>
    );
};

export default OnboardingTutorial;

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AppleHelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="게임 방법">
            <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                    <div className="bg-[#e5e5e5] rounded-full size-[40px] flex items-center justify-center shrink-0">
                        <span className="font-black text-[20px] text-[#666]">1</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="font-black text-[20px] text-[#333]">사과에 적힌 숫자의 합이 '10'이 되면 완성!</h3>
                        <p className="text-[16px] text-[#666] leading-relaxed">숫자의 합이 '10'이 되는 사과를 찾아보세요.</p>
                    </div>
                </div>
                <div className="w-full h-px bg-[#e5e5e5]" />
                <div className="flex items-start gap-4">
                    <div className="bg-[#e5e5e5] rounded-full size-[40px] flex items-center justify-center shrink-0">
                        <span className="font-black text-[20px] text-[#666]">2</span>
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                        <h3 className="font-black text-[20px] text-[#333]">드래그로 영역을 선택하세요!</h3>
                        <p className="text-[16px] text-[#666] leading-relaxed">1줄로 쭉, 2x2 정사각형 등 다양한 모양으로 선택할 수 있어요.</p>
                    </div>
                </div>
                <Button onClick={onClose} className="bg-[#ff6b6b] hover:bg-[#ff5252] w-full" size="lg">시작하기</Button>
            </div>
        </Modal>
    );
};

interface ResultModalProps {
    isWon: boolean;
    score: number;
    onHome: () => void;
    onRetry?: () => void;
    onMission?: () => void;
}

export const AppleResultModal: React.FC<ResultModalProps> = ({ isWon, score, onHome, onRetry, onMission }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                className="bg-white rounded-[24px] p-[32px] max-w-[320px] text-center w-full shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
                <div className="mb-[20px]">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="text-[64px] mb-[12px]"
                    >
                        {isWon ? '🍎' : '⏰'}
                    </motion.div>
                    <p className={`font-black text-[26px] mb-[8px] ${isWon ? 'text-[#ff6b6b]' : 'text-[#ff8800]'}`}>
                        {isWon ? '글자를 다 모았습니다!' : '시간이 부족해요!'}
                    </p>
                    <div className="bg-gray-50 rounded-2xl py-3 px-4 mb-4">
                        <p className="font-bold text-[16px] text-gray-500 mb-1">최종 점수</p>
                        <p className="font-black text-[24px] text-gray-800">{score}점</p>
                    </div>
                    {isWon ? (
                        <div className="bg-[#fff0db] rounded-xl py-2 px-3 animate-bounce">
                            <p className="font-black text-[18px] text-[#ff6b6b]">✨ 5포인트 획득! ✨</p>
                        </div>
                    ) : (
                        <p className="font-bold text-[15px] text-[#737373]">한 번 더 도전해서 글자를 모아보세요!</p>
                    )}
                </div>

                <div className="flex flex-col gap-[12px]">
                    {isWon ? (
                        <Button onClick={onMission} className="bg-[#ff6b6b] hover:bg-[#ff5252] h-14 rounded-2xl text-lg font-black italic shadow-lg shadow-orange-200" size="md">추가미션하고 5P 더 받기</Button>
                    ) : (
                        <Button onClick={onRetry} className="bg-[#ff6b6b] hover:bg-[#ff5252] h-14 rounded-2xl text-lg font-black italic shadow-lg shadow-orange-200" size="md">다시 도전하기</Button>
                    )}
                    <button onClick={onHome} className="text-[#a0a0a0] font-bold text-[15px] py-[8px] hover:text-[#121212] transition-colors underline underline-offset-4">홈으로 가기</button>
                </div>
            </motion.div>
        </div>
    );
};

interface MissionModalProps {
    question: string;
    placeUrl: string;
    bonusPoints: number;
    onHome: () => void;
    onSubmit: (userAnswer: string) => boolean;
}

export const AppleMissionModal: React.FC<MissionModalProps> = ({ question, placeUrl, bonusPoints, onHome, onSubmit }) => {
    const [userAnswer, setUserAnswer] = React.useState('');
    const [result, setResult] = React.useState<'none' | 'success' | 'fail'>('none');

    const handleLevelSubmit = () => {
        if (result === 'success') return;
        const success = onSubmit(userAnswer);
        if (success) {
            setResult('success');
        } else {
            setResult('fail');
            setUserAnswer('');
            setTimeout(() => setResult('none'), 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="bg-white rounded-[32px] p-8 max-w-[400px] w-full relative shadow-2xl overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-300 via-[#ff6b6b] to-orange-300" />
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                            className="text-[40px]"
                        >
                            🎯
                        </motion.div>
                        <h2 className="font-black text-[28px] text-[#ff6b6b] italic tracking-tight">추가 미션!</h2>
                    </div>
                    <div className="bg-[#fff0db] rounded-[24px] p-6 border-b-4 border-[#ffedd5]">
                        <p className="text-[19px] text-[#444] leading-relaxed font-bold">{question}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-black text-[15px] text-gray-500 ml-1">정답 입력</label>
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="border-2 border-gray-100 bg-gray-50 rounded-[18px] px-5 py-4 text-[20px] focus:border-[#ff6b6b] focus:bg-white focus:outline-none transition-all font-black"
                            placeholder="숫자 혹은 단어 입력"
                        />
                    </div>
                    <div className="bg-[#ffeeee] rounded-[16px] px-4 py-3 flex items-center justify-center gap-2">
                        <span className="text-[#ff6b6b]">🎁</span>
                        <p className="text-[15px] text-[#ff6b6b] font-black italic">성공 시 {bonusPoints}P 즉시 지급!</p>
                    </div>
                    <a href={placeUrl} target="_blank" rel="noopener noreferrer" className="bg-white border-[3px] border-[#ff6b6b] h-[58px] rounded-[18px] text-[#ff6b6b] font-black text-[20px] hover:bg-orange-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                        <ExternalLink size={20} /> 플레이스 정답 찾기
                    </a>
                    <Button onClick={handleLevelSubmit} disabled={result === 'success' || !userAnswer.trim()} className="bg-[#ff6b6b] hover:bg-[#ff5252] w-full h-16 rounded-[20px] text-xl font-black italic shadow-lg shadow-orange-100" size="lg">미션 완료!</Button>

                    <AnimatePresence>
                        {result !== 'none' && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`text-center font-black text-[17px] py-1 ${result === 'success' ? 'text-green-500' : 'text-[#ff6b6b]'}`}
                            >
                                {result === 'success' ? '✨ 정답입니다! 포인트가 적립되었습니다. ✨' : '🛑 아쉬워요! 다시 확인해보세요.'}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {result === 'success' && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={onHome}
                            className="w-full mt-2 h-12 text-[#a0a0a0] font-black hover:text-[#121212] transition-colors underline underline-offset-4"
                        >
                            홈으로 돌아가기
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

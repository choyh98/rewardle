import React from 'react';
import { motion } from 'framer-motion';
import appleImage from '../../../assets/apple.png';

interface AppleHelpModalProps {
    onClose: () => void;
}

export const AppleHelpModal: React.FC<AppleHelpModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6" onClick={onClose}>
            <div className="bg-white rounded-[20px] p-6 max-w-[400px] w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-6">
                    <h2 className="font-black text-[24px] text-[#333]">게임 방법</h2>
                    <button
                        onClick={onClose}
                        className="text-[#999] hover:text-[#333] text-[28px] leading-none transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Step 1 */}
                    <div className="flex items-start gap-4">
                        <div className="bg-[#e5e5e5] rounded-full size-[40px] flex items-center justify-center shrink-0">
                            <span className="font-black text-[20px] text-[#666]">1</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="font-black text-[20px] text-[#333]">
                                사과에 적힌 숫자의 합이 '10'이 되면 완성!
                            </h3>
                            <p className="text-[16px] text-[#666] leading-relaxed">
                                숫자의 합이 '10'이 되는 사과를 찾아보세요.
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-[#e5e5e5]" />

                    {/* Step 2 */}
                    <div className="flex items-start gap-4">
                        <div className="bg-[#e5e5e5] rounded-full size-[40px] flex items-center justify-center shrink-0">
                            <span className="font-black text-[20px] text-[#666]">2</span>
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                            <h3 className="font-black text-[20px] text-[#333]">
                                드래그로 영역을 선택하세요!
                            </h3>
                            <p className="text-[16px] text-[#666] leading-relaxed">
                                1줄로 쭉, 2x2 정사각형 등 다양한 모양으로 선택할 수 있어요.
                            </p>

                            {/* 드래그 예시 애니메이션 */}
                            <div className="bg-gradient-to-br from-[#fff0db] to-[#ffe5e5] rounded-[12px] p-4 mt-2">
                                <div className="flex flex-col gap-4">
                                    {/* 1열 예시 */}
                                    <div className="flex flex-col gap-2">
                                        <span className="font-bold text-[14px] text-[#666]">
                                            1열로 쭉 (3+3+4 = 10)
                                        </span>
                                        <div className="flex gap-2">
                                            {[3, 3, 4].map((num, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    className="relative size-[50px] rounded-[8px] bg-white/80 flex items-center justify-center"
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                        backgroundColor: ["rgba(255, 255, 255, 0.8)", "rgba(255, 215, 0, 0.9)", "rgba(255, 255, 255, 0.8)"],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        delay: idx * 0.3,
                                                        repeat: Infinity,
                                                        repeatDelay: 2,
                                                    }}
                                                >
                                                    <img src={appleImage} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-contain opacity-20" />
                                                    <span className="absolute font-black text-[24px] text-[#ff6b6b] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                                                        {num}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2x2 예시 */}
                                    <div className="flex flex-col gap-2">
                                        <span className="font-bold text-[14px] text-[#666]">
                                            2x2 정사각형 (2+3+2+3 = 10)
                                        </span>
                                        <div className="flex flex-col gap-2">
                                            {[[2, 3], [2, 3]].map((row, rowIdx) => (
                                                <div key={rowIdx} className="flex gap-2">
                                                    {row.map((num, colIdx) => (
                                                        <motion.div
                                                            key={colIdx}
                                                            className="relative size-[50px] rounded-[8px] bg-white/80 flex items-center justify-center"
                                                            animate={{
                                                                scale: [1, 1.1, 1],
                                                                backgroundColor: ["rgba(255, 255, 255, 0.8)", "rgba(255, 215, 0, 0.9)", "rgba(255, 255, 255, 0.8)"],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                delay: 2 + (rowIdx * 2 + colIdx) * 0.2,
                                                                repeat: Infinity,
                                                                repeatDelay: 2,
                                                            }}
                                                        >
                                                            <img src={appleImage} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-contain opacity-20" />
                                                            <span className="absolute font-black text-[24px] text-[#ff6b6b] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                                                                {num}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-[#e5e5e5]" />

                    {/* Step 3 */}
                    <div className="flex items-start gap-4">
                        <div className="bg-[#e5e5e5] rounded-full size-[40px] flex items-center justify-center shrink-0">
                            <span className="font-black text-[20px] text-[#666]">3</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="font-black text-[20px] text-[#333]">
                                주어진 시간은 60초!
                            </h3>
                            <p className="text-[16px] text-[#666] leading-relaxed">
                               60초 동안 사과를 제거하고 숨겨진 글자를 모아보세요!
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="bg-[#ff6b6b] h-[50px] rounded-[12px] text-white font-black text-[20px] hover:bg-[#ff5252] active:bg-[#e05555] transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

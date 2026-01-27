import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

interface ShootingWordleHelpModalProps {
    onClose: () => void;
}

export const ShootingWordleHelpModal: React.FC<ShootingWordleHelpModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6 touch-none" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-[32px] p-8 max-w-[400px] w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#ff6b6b] p-2 rounded-xl text-white">
                            <Target size={24} />
                        </div>
                        <h2 className="font-black text-[26px] text-[#333] tracking-tight">게임 방법</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#bbb] hover:text-[#333] text-[28px] leading-none transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Step 1 */}
                    <div className="flex items-start gap-5">
                        <div className="bg-[#fff0db] rounded-full size-[44px] flex items-center justify-center shrink-0 border-2 border-[#ffedd5]">
                            <span className="font-black text-[22px] text-[#ff6b6b]">1</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="font-black text-[20px] text-[#333] leading-tight">
                                대포는 화면 중앙에 고정!
                            </h3>
                            <p className="text-[16px] text-[#666] leading-relaxed">
                                대포는 중앙에 고정되어 있습니다. 글자가 대포 위로 지나갈 때를 노리세요!
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-[#f0f0f0]" />

                    {/* Step 2 */}
                    <div className="flex items-start gap-5">
                        <div className="bg-[#fff0db] rounded-full size-[44px] flex items-center justify-center shrink-0 border-2 border-[#ffedd5]">
                            <span className="font-black text-[22px] text-[#ff6b6b]">2</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="font-black text-[20px] text-[#333] leading-tight">
                                정확한 타이밍에 발사!
                            </h3>
                            <p className="text-[16px] text-[#666] leading-relaxed">
                                화면을 터치하여 대포를 발사하세요. 흐르는 글자 중 정답 글자를 맞춰야 합니다.
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-[#f0f0f0]" />

                    {/* Step 3 */}
                    <div className="flex items-start gap-5">
                        <div className="bg-[#fff0db] rounded-full size-[44px] flex items-center justify-center shrink-0 border-2 border-[#ffedd5]">
                            <span className="font-black text-[22px] text-[#ff6b6b]">3</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="font-black text-[20px] text-[#333] leading-tight">
                                순서대로 단어를 완성하세요
                            </h3>
                            <p className="text-[16px] text-[#666] leading-relaxed">
                                브랜드 네임의 글자들을 첫 글자부터 순서대로 모두 맞추면 미션 성공!
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="bg-[#ff6b6b] h-[64px] rounded-[20px] text-white font-black text-[22px] hover:bg-[#ff5252] active:scale-95 transition-all shadow-lg mt-2"
                    >
                        확인
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

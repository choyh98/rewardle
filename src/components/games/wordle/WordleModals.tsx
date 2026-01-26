import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WordleHelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="게임 방법">
            <div className="flex flex-col gap-[24px] text-left">
                <div className="flex gap-[12px]">
                    <div className="bg-[#d4d4d4] rounded-full size-[36px] shrink-0 flex items-center justify-center">
                        <span className="font-bold text-[18px] text-[#121212]">1</span>
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-[18px] text-[#121212] mb-[8px]">
                            숨겨진 가게명을 맞춰보세요!
                        </p>
                        <p className="font-normal text-[14px] text-[#737373]">
                            6번의 기회 안에 정답을 맞추면 5포인트를 받을 수 있어요.
                        </p>
                    </div>
                </div>

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

                        <div className="bg-[#fef6e8] rounded-[12px] p-[16px]">
                            <div className="flex flex-col gap-[12px]">
                                <div className="flex items-center gap-[8px]">
                                    <div className="bg-[#28c52d] size-[40px] rounded-[4px] flex items-center justify-center">
                                        <span className="font-bold text-[20px] text-white">아</span>
                                    </div>
                                    <p className="font-normal text-[13px] text-[#121212]">위치와 글자 정확!</p>
                                </div>
                                <div className="flex items-center gap-[8px]">
                                    <div className="bg-[#ff8800] size-[40px] rounded-[4px] flex items-center justify-center">
                                        <span className="font-bold text-[20px] text-white">쿠</span>
                                    </div>
                                    <p className="font-normal text-[13px] text-[#121212]">글자는 맞지만 위치 틀림</p>
                                </div>
                                <div className="flex items-center gap-[8px]">
                                    <div className="bg-[#787c7e] size-[40px] rounded-[4px] flex items-center justify-center">
                                        <span className="font-bold text-[20px] text-white">지</span>
                                    </div>
                                    <p className="font-normal text-[13px] text-[#121212]">답에 포함되지 않음</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-[12px]">
                    <div className="bg-[#d4d4d4] rounded-full size-[36px] shrink-0 flex items-center justify-center">
                        <span className="font-bold text-[18px] text-[#121212]">3</span>
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-[18px] text-[#121212] mb-[8px]">
                            키보드에서 글자를 선택하세요!
                        </p>
                        <p className="font-normal text-[14px] text-[#737373]">
                            같은 글자를 여러 번 클릭할 수 있어요. 글자를 모두 입력한 후 확인 버튼을 눌러주세요.
                        </p>
                    </div>
                </div>

                <Button onClick={onClose} className="bg-[#ff6b6b] hover:bg-[#ff5252] w-full" size="lg">
                    확인
                </Button>
            </div>
        </Modal>
    );
};

interface ResultModalProps {
    gameState: 'won' | 'lost';
    onHome: () => void;
    onRetry?: () => void;
    onMission?: () => void;
}

export const WordleResultModal: React.FC<ResultModalProps> = ({ gameState, onHome, onRetry, onMission }) => {
    if (gameState === 'won') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                <div className="bg-white rounded-[16px] p-[32px] max-w-[320px] text-center">
                    <div className="mb-[20px]">
                        <div className="text-[48px] mb-[12px]">🎉</div>
                        <p className="font-bold text-[24px] text-[#28c52d] mb-[8px]">정답입니다!</p>
                        <p className="font-semibold text-[20px] text-[#121212]">5포인트가 적립되었습니다.</p>
                    </div>

                    <div className="flex flex-col gap-[12px]">
                        <Button onClick={onMission} className="bg-[#ff6b6b] hover:bg-[#ff5252]" size="md">
                            추가미션하고 5P 더 받기
                        </Button>
                        <button onClick={onHome} className="text-[#737373] font-medium text-[14px] py-[8px] hover:text-[#121212]">
                            홈으로 가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-[16px] p-[32px] max-w-[320px] text-center">
                <div className="mb-[20px]">
                    <div className="text-[48px] mb-[12px]">💭</div>
                    <p className="font-bold text-[24px] text-[#ff8800] mb-[8px]">아쉬워요!</p>
                    <p className="font-normal text-[14px] text-[#737373]">다시 도전해보세요!</p>
                </div>

                <div className="flex flex-col gap-[12px]">
                    <Button onClick={onRetry} className="bg-[#ff6b6b] hover:bg-[#ff5252]" size="md">
                        다시 도전하기
                    </Button>
                    <button onClick={onHome} className="text-[#737373] font-medium text-[14px] py-[8px] hover:text-[#121212]">
                        홈으로 가기
                    </button>
                </div>
            </div>
        </div>
    );
};

interface MissionModalProps {
    question: string;
    placeUrl: string;
    onHome: () => void;
    onSubmit: (userAnswer: string) => boolean;
}

export const WordleMissionModal: React.FC<MissionModalProps> = ({ question, placeUrl, onHome, onSubmit }) => {
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-[24px] p-8 max-w-[400px] w-full relative">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="text-[32px]">🎯</div>
                        <h2 className="font-black text-[24px] text-[#ff6b6b]">추가 미션!</h2>
                    </div>

                    <div className="bg-[#fff0db] rounded-[16px] p-4">
                        <p className="text-[18px] text-[#333] leading-relaxed">{question}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-[16px] text-[#666]">정답 입력</label>
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="border-2 border-[#e5e5e5] rounded-[12px] px-4 py-3 text-[18px] focus:border-[#ff6b6b] focus:outline-none"
                            placeholder="글자나 숫자만 입력"
                        />
                    </div>

                    <a
                        href={placeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white border-2 border-[#ff6b6b] h-[50px] rounded-[12px] text-[#ff6b6b] font-black text-[20px] hover:bg-[#fff5f5] transition-colors flex items-center justify-center gap-2"
                    >
                        <ExternalLink size={18} /> 플레이스 보러가기
                    </a>

                    <Button
                        onClick={handleLevelSubmit}
                        disabled={result === 'success' || !userAnswer.trim()}
                        className="bg-[#ff6b6b] hover:bg-[#ff5252] w-full"
                        size="lg"
                    >
                        제출하기
                    </Button>

                    {result !== 'none' && (
                        <div className={`text-center font-bold ${result === 'success' ? 'text-[#4caf50]' : 'text-[#ff6b6b]'}`}>
                            {result === 'success' ? '정답입니다! 포인트가 적립되었습니다.' : '아쉬워요! 다시 도전해보세요.'}
                        </div>
                    )}

                    {result === 'success' && (
                        <button onClick={onHome} className="w-full mt-2 h-12 text-[#737373] font-medium hover:text-[#121212]">
                            홈으로 돌아가기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

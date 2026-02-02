import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Gift, ArrowRight, CheckCircle2, Trophy, HelpCircle, X, ExternalLink } from 'lucide-react';
import ShootingWordle from '../components/games/shootingwordle/ShootingWordle';
import { useAuth } from '../context/AuthContext';
import { usePoints } from '../context/PointsContext';
import pastaImage from '../assets/pasta.jpg';

// 돼지게티 브랜드 데이터
const CAMPAIGN_BRAND = {
    id: 'campaign-dwaejigetti',
    name: '돼지게티',
    shootingWordleAnswer: '돼지게티',
    wordleAnswer: ['돼지게티'],
    hintImage: '',
    placeQuiz: {
        question: '',
        answer: '',
        bonusPoints: 0
    },
    placeUrl: 'https://www.baemin.com/shopDetail?shopDetail_shopNo=13929815&shopDetail_categoryTypeCode=1&bm_rfr=SHARE&shopDetail_campaignId=-1&fbclid=PAT01DUAPtHklleHRuA2FlbQIxMABzcnRjBmFwcF9pZA81NjcwNjczNDMzNTI0MjcAAafLRgx_5AGoG8l_49YVOHYvvRJLj8wWJT3ghwh4HDB9ljlkQoomQxBixAJjxg_aem_a3q-lHFJFXGzxko_vDSOqw',
    appleGameWord: '돼지게티'
};

// 퀴즈 정답 (플레이스에서 확인)
const QUIZ_ANSWER = {
    answer: '27900' // "김치항정살파스타의 가격은?" - 27,900원
};

interface Step {
    id: number;
    title: string;
    description: string;
    points: number;
    completed: boolean;
    type?: 'game' | 'signup';
}

const CampaignPage: React.FC = () => {
    const navigate = useNavigate();
    const { brandName } = useParams<{ brandName: string }>();
    const { user } = useAuth();
    const { addPoints } = usePoints();
    
    const [currentView, setCurrentView] = useState<'intro' | 'game' | 'missions'>('intro');
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [quizAnswer, setQuizAnswer] = useState('');
    const [quizError, setQuizError] = useState('');
    
    const [steps, setSteps] = useState<Step[]>([
        {
            id: 1,
            title: '슈팅워들 게임 & 추가 퀴즈',
            description: '게임 완료 (50P) + 퀴즈 정답 (50P)',
            points: 100,
            completed: false,
            type: 'game'
        },
        {
            id: 2,
            title: '리워들 가입하고 200P 받기',
            description: '회원가입 완료 시 200P 즉시 지급',
            points: 200,
            completed: false,
            type: 'signup'
        }
    ]);

    // 회원가입 완료 확인 (포인트는 LoginPage에서 이미 지급됨)
    useEffect(() => {
        const campaignKey = `campaign_signup_${brandName}`;
        const alreadyClaimed = localStorage.getItem(campaignKey);
        
        // 이미 회원가입 보상을 받았다면 완료 표시만
        if (user && !user.isGuest && alreadyClaimed) {
            setSteps(prev => prev.map(step => 
                step.id === 2 ? { ...step, completed: true } : step
            ));
        }
        
        // 게임 & 퀴즈 완료 여부 확인
        const gameQuizKey = `campaign_gamequiz_${brandName}`;
        const gameQuizCompleted = localStorage.getItem(gameQuizKey);
        if (gameQuizCompleted) {
            setSteps(prev => prev.map(step => 
                step.id === 1 ? { ...step, completed: true } : step
            ));
        }
    }, [user, brandName]);

    // 게임 완료 핸들러 - 게임 후 바로 퀴즈 모달 표시
    const handleGameComplete = (points: number) => {
        console.log('게임 완료:', points);
        addPoints(50, `${brandName} 캠페인 - 게임 완료`);
        // 게임 완료 후 퀴즈 모달 표시
        setCurrentView('missions');
        setTimeout(() => {
            setShowQuizModal(true);
        }, 500);
    };

    // 회원가입 핸들러
    const handleSignup = () => {
        if (!user || user.isGuest) {
            navigate(`/login?campaign=${brandName}`);
        } else {
            alert('이미 회원이시네요! 다른 미션을 완료해보세요.');
        }
    };

    // 퀴즈 열기
    const handleOpenQuiz = () => {
        setShowQuizModal(true);
        setQuizError('');
    };

    // 퀴즈 정답 확인
    const handleSubmitQuiz = () => {
        const userAnswer = quizAnswer.trim().replace(/[^0-9]/g, ''); // 숫자만 추출
        const correctAnswer = QUIZ_ANSWER.answer;
        
        // 숫자 비교 (±100원 오차 허용)
        const userPrice = parseInt(userAnswer);
        const correctPrice = parseInt(correctAnswer);
        
        if (userPrice && Math.abs(userPrice - correctPrice) <= 100) {
            const gameQuizKey = `campaign_gamequiz_${brandName}`;
            localStorage.setItem(gameQuizKey, 'true');
            
            setSteps(prev => prev.map(step => 
                step.id === 1 ? { ...step, completed: true } : step
            ));
            
            addPoints(50, `${brandName} 캠페인 - 퀴즈 완료`);
            setShowQuizModal(false);
            alert('🎉 정답입니다! 50P가 지급되었습니다!\n게임 50P + 퀴즈 50P = 총 100P 획득!');
            setQuizAnswer('');
        } else {
            setQuizError('정답이 아닙니다. 배달의 민족에서 다시 확인해주세요.');
        }
    };

    // 게임 시작
    const handleStartGame = () => {
        setCurrentView('game');
    };

    // 인트로 화면
    const IntroView = () => (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6 flex flex-col items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6">
                {/* 브랜드 타이틀 */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black text-gray-800">
                        돼지게티
                    </h1>
                    <p className="text-lg text-gray-600">
                        특별 캠페인에 참여하세요!
                    </p>
                </div>

                {/* 혜택 소개 */}
                <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center gap-2 text-orange-800">
                        <Gift className="w-6 h-6" />
                        <span className="font-bold text-lg">캠페인 혜택</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>50P</strong> - 슈팅워들 게임 완료</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>50P</strong> - 추가 퀴즈 완료</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>200P</strong> - 리워들 회원가입</span>
                        </li>
                    </ul>
                    <div className="pt-3 border-t border-orange-200 flex items-center justify-between">
                        <span className="text-gray-700 font-medium">총 적립 가능</span>
                        <div className="flex items-center gap-1 text-orange-600 font-black text-xl">
                            <Trophy className="w-5 h-5" />
                            <span>최대 300P!</span>
                        </div>
                    </div>
                    <div className="pt-2 text-xs text-gray-500 text-center">
                        * 포인트는 디지털온누리 등으로 교환하실 수 있습니다
                    </div>
                </div>

                {/* 시작 버튼 */}
                <button
                    onClick={handleStartGame}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg hover:from-orange-600 hover:to-red-600 transition-colors"
                >
                    게임 시작하기
                    <ArrowRight className="w-6 h-6" />
                </button>

                {/* 나가기 버튼 */}
                <button
                    onClick={() => navigate('/home')}
                    className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
                >
                    나중에 하기
                </button>
            </div>
        </div>
    );

    // 미션 화면
    const MissionsView = () => (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
            <div className="max-w-md mx-auto space-y-6 py-8">
                {/* 헤더 */}
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-gray-800">추가 미션</h2>
                    <p className="text-gray-600">더 많은 포인트를 받아가세요!</p>
                </div>

                {/* 미션 카드들 */}
                <div className="space-y-4">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all ${
                                step.completed 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-gray-200'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* 아이콘 */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                    step.completed 
                                        ? 'bg-green-500' 
                                        : 'bg-gray-200'
                                }`}>
                                    {step.completed ? (
                                        <CheckCircle2 className="w-7 h-7 text-white" />
                                    ) : (
                                        <span className="text-xl font-bold text-gray-600">{step.id}</span>
                                    )}
                                </div>

                                {/* 내용 */}
                                <div className="flex-1 space-y-2">
                                    <h3 className="font-bold text-lg text-gray-800">{step.title}</h3>
                                    <p className="text-sm text-gray-600">{step.description}</p>
                                    
                                    {step.points > 0 && (
                                        <div className="flex items-center gap-1 text-orange-600 font-bold">
                                            <Gift className="w-4 h-4" />
                                            <span>{step.points}P</span>
                                        </div>
                                    )}

                                    {/* 액션 버튼 */}
                                    {!step.completed && (
                                        <div className="pt-2">
                                            {step.id === 1 && (
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={handleStartGame}
                                                        className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors w-full"
                                                    >
                                                        게임 다시 하기
                                                    </button>
                                                    <button
                                                        onClick={handleOpenQuiz}
                                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 w-full justify-center"
                                                    >
                                                        <HelpCircle className="w-4 h-4" />
                                                        퀴즈 풀기
                                                    </button>
                                                </div>
                                            )}
                                            {step.id === 2 && (
                                                <button
                                                    onClick={handleSignup}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                                                >
                                                    회원가입하고 200P 받기
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 완료 상태 */}
                <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                    <div className="text-4xl mb-2">
                        {steps.every(s => s.completed) ? '🎉' : '⏳'}
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">
                        {steps.every(s => s.completed) 
                            ? '모든 미션 완료!' 
                            : `진행 상황: ${steps.filter(s => s.completed).length}/${steps.length}`}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                        {steps.every(s => s.completed)
                            ? '축하합니다! 모든 미션을 완료했습니다.'
                            : '남은 미션을 완료하고 더 많은 포인트를 받으세요!'}
                    </p>
                    
                    {steps.every(s => s.completed) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-gray-700">
                            💡 <strong>포인트 교환 안내</strong><br/>
                            적립된 포인트는 디지털온누리 등으로 교환하실 수 있습니다
                        </div>
                    )}
                    
                    <button
                        onClick={() => navigate('/home')}
                        className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>

            {/* 퀴즈 모달 */}
            {showQuizModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-[9999]"
                    onClick={() => setShowQuizModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 relative z-[10000]"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">추가 퀴즈</h3>
                            <button
                                onClick={() => setShowQuizModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600">
                            배달의 민족에서 메뉴 가격을 확인하고 답해주세요!
                        </p>

                        {/* 파스타 이미지 */}
                        <div className="w-full overflow-hidden rounded-xl">
                            <img 
                                src={pastaImage} 
                                alt="김치항정살파스타" 
                                className="w-full h-48 object-cover"
                            />
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    김치항정살파스타의 가격은?
                                </label>
                                <input
                                    type="text"
                                    value={quizAnswer}
                                    onChange={(e) => setQuizAnswer(e.target.value)}
                                    placeholder="숫자만 입력하세요"
                                    autoFocus
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                                />
                            </div>
                        </div>

                        {quizError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                                {quizError}
                            </div>
                        )}

                        {/* 배달의 민족 보러가기 버튼 */}
                        <a
                            href="https://www.baemin.com/shopDetail?shopDetail_shopNo=13929815&shopDetail_categoryTypeCode=1&bm_rfr=SHARE&shopDetail_campaignId=-1&fbclid=PAT01DUAPtHklleHRuA2FlbQIxMABzcnRjBmFwcF9pZA81NjcwNjczNDMzNTI0MjcAAafLRgx_5AGoG8l_49YVOHYvvRJLj8wWJT3ghwh4HDB9ljlkQoomQxBixAJjxg_aem_a3q-lHFJFXGzxko_vDSOqw"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full text-white font-bold py-3 rounded-xl transition-colors"
                            style={{ backgroundColor: '#48d1cc' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3dbab5'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#48d1cc'}
                        >
                            <ExternalLink className="w-5 h-5" />
                            배달의 민족 보러가기
                        </a>

                        <button
                            onClick={handleSubmitQuiz}
                            disabled={!quizAnswer}
                            className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            확인
                        </button>
                        
                        <p className="text-xs text-gray-500 text-center">
                         숫자만 입력하세요 
                        </p>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen">
            {currentView === 'intro' && <IntroView />}
            {currentView === 'game' && (
                <div>
                    <ShootingWordle
                        brand={CAMPAIGN_BRAND}
                        onComplete={handleGameComplete}
                        onBack={() => setCurrentView('missions')}
                        onDeductPlay={() => {}}
                    />
                </div>
            )}
            {currentView === 'missions' && <MissionsView />}
        </div>
    );
};

export default CampaignPage;

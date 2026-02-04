import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, LogOut, Target, Play, Info, MessageCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePoints } from '../context/PointsContext';
import { getDefaultBrand, fetchBrands, type Brand } from '../data/brands';
import { supabase } from '../lib/supabase';
import { OnboardingTutorial, WalkingMissionPage } from '../components/common';
import { STORAGE_KEYS, TIMERS } from '../data/constants';
import appleIcon from '../assets/apple.png';
import wordleIcon from '../assets/wordle.png';
import checkIcon from '../assets/check.png';
import pointIcon from '../assets/point.png';
import backgroundImage from '../assets/background.png';

type Difficulty = 'easy' | 'normal' | 'hard';

const LandingPage: React.FC = () => {
    const { user } = useAuth();
    const { points, dailyGamesRemaining, gameHistory, nextResetTime, addPoints } = usePoints();
    const navigate = useNavigate();
    const [defaultBrand, setDefaultBrand] = useState<Brand | null>(null);
    const [showGameHistoryModal, setShowGameHistoryModal] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [difficulty, setDifficulty] = useState<Difficulty>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.DIFFICULTY);
        return (saved as Difficulty) || 'normal';
    });
    const [showDifficultyTooltip, setShowDifficultyTooltip] = useState(false);
    const [tooltipTimeout, setTooltipTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactForm, setContactForm] = useState({
        type: 'report',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showWalkingMission, setShowWalkingMission] = useState(false);
    const [randomWalkingBrand, setRandomWalkingBrand] = useState<Brand | null>(null);
    const [activeZone, setActiveZone] = useState<'game' | 'mission'>('game');

    // 첫 방문 체크
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    }, []);

    const handleOnboardingComplete = () => {
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
        setShowOnboarding(false);
    };

    useEffect(() => {
        const loadBrand = async () => {
            const brand = await getDefaultBrand(difficulty);
            setDefaultBrand(brand);
        };
        loadBrand();
    }, [difficulty]);

    // 난이도 변경 핸들러
    const handleDifficultyChange = (newDifficulty: Difficulty) => {
        setDifficulty(newDifficulty);
        localStorage.setItem(STORAGE_KEYS.DIFFICULTY, newDifficulty);
        
        // 툴팁 표시
        setShowDifficultyTooltip(true);
        
        // 기존 타이머 클리어
        if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
        }
        
        // 2초 후 자동 숨김
        const timeout = setTimeout(() => {
            setShowDifficultyTooltip(false);
        }, TIMERS.TOOLTIP_DURATION);
        
        setTooltipTimeout(timeout);
    };
    
    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
            }
        };
    }, [tooltipTimeout]);

    // 타이머 업데이트
    useEffect(() => {
        if (!nextResetTime) {
            setTimeRemaining('');
            return;
        }

        const updateTimer = () => {
            const now = new Date().getTime();
            const resetTime = new Date(nextResetTime).getTime();
            const distance = resetTime - now;

            if (distance < 0) {
                setTimeRemaining('');
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [nextResetTime]);

    const handleLogout = async () => {
        if (confirm('로그아웃 하시겠습니까?\n(게스트 모드로 전환되며, 포인트는 로컬에 저장됩니다)')) {
            try {
                // Supabase 로그아웃
                await supabase.auth.signOut();
                
                // 페이지 새로고침하여 게스트 모드로 전환
                // AuthContext가 자동으로 게스트 사용자로 전환합니다
                window.location.href = '/home';
            } catch (error) {
                console.error('로그아웃 실패:', error);
                alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
            }
        }
    };

    const handleContactSubmit = async () => {
        if (!contactForm.message.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        if (!contactForm.email.trim()) {
            alert('회신받을 이메일을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            // mailto 링크로 이메일 클라이언트 열기
            const subject = contactForm.type === 'report' ? '[리워들] 신고' : '[리워들] 문의';
            const body = `
보낸 사람 이메일: ${contactForm.email}

내용:
${contactForm.message}

---
보낸 시간: ${new Date().toLocaleString('ko-KR')}
사용자 ID: ${user?.id || 'guest'}
            `.trim();

            const mailtoLink = `mailto:rewardle2026@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;

            // 폼 초기화 및 모달 닫기
            setTimeout(() => {
                setContactForm({ type: 'report', email: '', message: '' });
                setShowContactModal(false);
                setIsSubmitting(false);
                alert('메일 앱이 열렸습니다. 전송 버튼을 눌러주세요!');
            }, 500);

        } catch (error) {
            console.error('이메일 전송 실패:', error);
            alert('전송에 실패했습니다. 다시 시도해주세요.');
            setIsSubmitting(false);
        }
    };

    // 도보미션 바로하기
    const handleStartWalkingMission = async () => {
        try {
            const brands = await fetchBrands();
            // 도보미션이 있는 브랜드 필터링
            const walkingBrands = brands.filter(b => 
                b.mission?.type === 'walking' && b.mission.walking
            );

            if (walkingBrands.length === 0) {
                alert('현재 이용 가능한 도보미션이 없습니다.');
                return;
            }

            // 랜덤 선택
            const randomBrand = walkingBrands[Math.floor(Math.random() * walkingBrands.length)];
            setRandomWalkingBrand(randomBrand);
            setShowWalkingMission(true);
        } catch (error) {
            console.error('도보미션 브랜드 로드 실패:', error);
            alert('도보미션을 불러오는데 실패했습니다.');
        }
    };

    return (
        <div className="min-h-screen w-full pb-10 flex flex-col items-center bg-gradient-to-b from-slate-50 via-white to-slate-50/80">
            {/* 온보딩 튜토리얼 */}
            {showOnboarding && <OnboardingTutorial onComplete={handleOnboardingComplete} />}

            {/* Hero Section - 게임존: 로즈/레드, 미션존: 블루 */}
            <div className={`relative w-full min-h-[280px] overflow-hidden transition-colors duration-500 ${
                activeZone === 'mission'
                    ? 'bg-gradient-to-br from-blue-500 via-[#4a90e2] to-blue-700'
                    : 'bg-gradient-to-br from-rose-500 via-primary to-rose-700'
            }`}>
                <div className="absolute inset-0 bg-cover bg-center opacity-[0.12]" style={{ backgroundImage: `url(${backgroundImage})` }} />
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/20 rounded-full blur-[100px] -translate-y-1/2" />
                <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[120px] translate-y-1/2 ${
                    activeZone === 'mission' ? 'bg-blue-300/30' : 'bg-rose-300/30'
                }`} />

                <div className="relative z-10 flex flex-col justify-start min-h-[280px] px-6 pt-28 pb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <h2 className="text-[2.25rem] sm:text-5xl font-extrabold text-white leading-[1.2] tracking-tight drop-shadow-lg">
                            매일 플레이 하고<br />
                            <span className="text-white/95">포인트를 모아보세요!</span>
                        </h2>

                        {/* 일일 게임 횟수 및 난이도 선택 */}
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                            {/* 게임 횟수 표시 */}
                            <button
                                onClick={() => setShowGameHistoryModal(true)}
                                className="bg-white/25 backdrop-blur-md rounded-full px-4 py-2.5 hover:bg-white/35 transition-colors active:scale-95 flex-shrink-0 border border-white/20"
                            >
                                <p className="text-white text-sm font-bold whitespace-nowrap">
                                    오늘 남은 게임: {dailyGamesRemaining}/10
                                    {timeRemaining && dailyGamesRemaining === 0 && (
                                        <span className="ml-2 text-amber-200">({timeRemaining} 후 초기화)</span>
                                    )}
                                </p>
                            </button>

                            {/* 난이도 토글 버튼 */}
                            <div className="relative">
                                <div className="bg-white/25 backdrop-blur-md rounded-full p-1 flex items-center gap-1 flex-shrink-0 border border-white/20">
                                    <button
                                        onClick={() => handleDifficultyChange('easy')}
                                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                            difficulty === 'easy'
                                                ? 'bg-white text-primary shadow-sm'
                                                : 'text-white/80 hover:text-white'
                                        }`}
                                    >
                                        쉬움
                                    </button>
                                    <button
                                        onClick={() => handleDifficultyChange('normal')}
                                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                            difficulty === 'normal'
                                                ? 'bg-white text-primary shadow-sm'
                                                : 'text-white/80 hover:text-white'
                                        }`}
                                    >
                                        보통
                                    </button>
                                    <button
                                        onClick={() => handleDifficultyChange('hard')}
                                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                            difficulty === 'hard'
                                                ? 'bg-white text-primary shadow-sm'
                                                : 'text-white/80 hover:text-white'
                                        }`}
                                    >
                                        어려움
                                    </button>
                                </div>
                                
                                {/* 난이도 설명 툴팁 */}
                                <AnimatePresence>
                                    {showDifficultyTooltip && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 whitespace-nowrap z-50"
                                        >
                                            <Info className="text-primary" size={16} />
                                            <span className="text-sm font-bold text-gray-800">
                                                {difficulty === 'easy' && '쉬움: 3~4글자'}
                                                {difficulty === 'normal' && '보통: 5글자'}
                                                {difficulty === 'hard' && '어려움: 6글자 이상'}
                                            </span>
                                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 게임존 / 미션존 토글 - 좌측 상단 */}
                <div className="absolute top-5 left-5 z-20">
                    <div className="bg-white/90 backdrop-blur-md rounded-full p-1 shadow-xl shadow-black/10 border border-white/40 flex">
                        <button
                            type="button"
                            onClick={() => setActiveZone('game')}
                            className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                                activeZone === 'game' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100/80'
                            }`}
                        >
                            게임존
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveZone('mission')}
                            className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                                activeZone === 'mission' ? 'bg-[#4a90e2] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100/80'
                            }`}
                        >
                            미션존
                        </button>
                    </div>
                </div>

                {/* Floating Point Header */}
                <div className="absolute top-5 right-5 z-20 flex gap-2">
                    {user && !user.isGuest && (
                        <button
                            onClick={handleLogout}
                            className="bg-white/90 backdrop-blur-md rounded-full p-2.5 shadow-xl shadow-black/10 active:scale-95 transition-transform border border-white/40"
                            title="로그아웃"
                        >
                            <LogOut className="text-slate-600 size-5" />
                        </button>
                    )}
                    <Link to="/points-history" className="bg-white/90 backdrop-blur-md rounded-full py-2.5 px-4 flex items-center gap-3 shadow-xl shadow-black/10 active:scale-95 transition-transform border border-white/40">
                        <div className="bg-primary p-1.5 rounded-full">
                            <Award className="text-white size-5" />
                        </div>
                        <span className="text-primary font-bold text-lg">{points.toLocaleString()} P</span>
                    </Link>
                </div>
            </div>

            {/* Menu Sections - 히어로 밖에서 시작 */}
            <div className="w-full max-w-md px-5 pt-6 relative z-30 space-y-4">
                <AnimatePresence mode="wait">
                {/* 게임존 */}
                {activeZone === 'game' && (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="space-y-4"
                    >
                        <Link 
                            to={defaultBrand ? `/game/wordle?brand=${defaultBrand.id}` : '#'} 
                            className="group block bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_12px 40px_-12px_rgba(255,107,107,0.25)] transition-all duration-300 active:scale-[0.99] touch-manipulation border border-slate-100/80 hover:border-primary/20 flex flex-col min-h-[172px]"
                            onClick={(e) => {
                                if (!defaultBrand) {
                                    e.preventDefault();
                                    alert('준비된 퀴즈가 전부 소진됐어요!\n난이도를 변경해서 다시 시도해주세요!');
                                }
                            }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <img src={wordleIcon} alt="워들 게임" loading="lazy" className="h-[72px] w-[72px] object-contain group-hover:scale-105 transition-transform pointer-events-none flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">워들 게임</h3>
                                    <p className="text-slate-500 text-sm line-clamp-1">가게명을 맞추고 포인트 받기</p>
                                </div>
                            </div>
                            <div className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-2xl group-hover:bg-primary-dark transition-colors">
                                <Play className="size-5 fill-current" />
                                <span>지금 플레이하기</span>
                            </div>
                        </Link>

                        <Link 
                            to={defaultBrand ? `/game/shooting?brand=${defaultBrand.id}` : '#'} 
                            className="group block bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_-12px_rgba(255,107,107,0.25)] transition-all duration-300 active:scale-[0.99] touch-manipulation border border-slate-100/80 hover:border-primary/20 flex flex-col min-h-[172px]"
                            onClick={(e) => {
                                if (!defaultBrand) {
                                    e.preventDefault();
                                    alert('준비된 퀴즈가 모두 소진되었어요!\n난이도를 변경해서 다시 시도해주세요!');
                                }
                            }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-[72px] w-[72px] flex items-center justify-center flex-shrink-0">
                                    <Target className="text-[#ff6b6b] w-16 h-16 group-hover:scale-105 transition-transform" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">슈팅워들 게임</h3>
                                    <p className="text-slate-500 text-sm line-clamp-1">글자를 명중시켜 포인트 받기</p>
                                </div>
                            </div>
                            <div className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-2xl group-hover:bg-primary-dark transition-colors">
                                <Play className="size-5 fill-current" />
                                <span>지금 플레이하기</span>
                            </div>
                        </Link>

                        <Link 
                            to={defaultBrand ? `/game/apple?brand=${defaultBrand.id}` : '#'} 
                            className="group block bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_-12px_rgba(255,107,107,0.25)] transition-all duration-300 active:scale-[0.99] touch-manipulation border border-slate-100/80 hover:border-primary/20 flex flex-col min-h-[172px]"
                            onClick={(e) => {
                                if (!defaultBrand) {
                                    e.preventDefault();
                                    alert('준비된 퀴즈가 전부 소진되었어요!\n난이도를 변경해서 다시 시도해주세요!');
                                }
                            }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <img src={appleIcon} alt="사과 게임" loading="lazy" className="h-[72px] w-[72px] object-contain group-hover:scale-105 transition-transform pointer-events-none flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">사과 게임</h3>
                                    <p className="text-slate-500 text-sm line-clamp-1">숫자10 만들고 글자 모으기</p>
                                </div>
                            </div>
                            <div className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-2xl group-hover:bg-primary-dark transition-colors">
                                <Play className="size-5 fill-current" />
                                <span>지금 플레이하기</span>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* 미션존 */}
                {activeZone === 'mission' && (
                    <motion.div
                        key="mission"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="space-y-4"
                    >
                        <button
                            onClick={handleStartWalkingMission}
                            className="w-full group bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_-12px_rgba(74,144,226,0.3)] transition-all duration-300 active:scale-[0.99] touch-manipulation border border-slate-100/80 hover:border-[#4a90e2]/30 flex flex-col min-h-[172px]"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-[72px] w-[72px] flex items-center justify-center flex-shrink-0">
                                    <svg className="w-16 h-16 text-[#4a90e2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">플레이스 미션</h3>
                                    <p className="text-slate-500 text-sm line-clamp-1">도보미션 랜덤으로 바로하기</p>
                                </div>
                            </div>
                            <div className="w-full flex items-center justify-center gap-2 bg-[#4a90e2] text-white font-bold py-3 rounded-2xl group-hover:bg-[#357abd] transition-colors">
                                <Play className="size-5 fill-current" />
                                <span>바로 시작하기</span>
                            </div>
                        </button>
                    </motion.div>
                )}
                </AnimatePresence>

                {/* 하단 고정: 출석 미션, 적립 내역 */}
                <div className="grid grid-cols-2 gap-3">
                    <Link to="/attendance" className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] transition-all duration-300 active:scale-[0.99] min-h-[140px] touch-manipulation border border-slate-100/80">
                        <img src={checkIcon} alt="출석 미션" loading="lazy" className="h-14 w-auto object-contain pointer-events-none" />
                        <span className="font-bold text-slate-800 text-[15px] text-center">출석 미션</span>
                    </Link>

                    <Link to="/points-history" className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] transition-all duration-300 active:scale-[0.99] min-h-[140px] touch-manipulation border border-slate-100/80">
                        <img src={pointIcon} alt="적립 내역" loading="lazy" className="h-14 w-auto object-contain pointer-events-none" />
                        <span className="font-bold text-slate-800 text-[15px] text-center">적립 내역</span>
                    </Link>
                </div>

                {/* Admin/Merchant Prompt */}
                <div className="pt-1 space-y-3">
                    <Link to="/admin" className="block w-full bg-slate-50/80 rounded-2xl p-5 text-center text-slate-600 font-semibold hover:bg-slate-100/80 transition-colors border border-slate-100">
                        자영업자이신가요? <br/>퀴즈 등록하러 가기
                    </Link>
                    
                    {user && user.isGuest && (
                        <Link to="/login" className="block w-full bg-primary/10 rounded-2xl p-5 text-center text-primary font-semibold hover:bg-primary/15 transition-colors border border-primary/20">
                            로그인하기
                        </Link>
                    )}

                    {/* 신고/문의하기 버튼 */}
                    <button
                        onClick={() => setShowContactModal(true)}
                        className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-5 text-center text-slate-600 font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] border border-slate-100/80"
                    >
                        <MessageCircle size={20} />
                        <span>신고 / 문의하기</span>
                    </button>
                </div>
            </div>

            {/* Game History Modal */}
            {showGameHistoryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setShowGameHistoryModal(false)}>
                    <div className="bg-white rounded-[16px] p-[32px] max-w-[360px] w-full" onClick={(e) => e.stopPropagation()}>
                        <h2 className="font-bold text-[24px] text-[#121212] mb-[20px] text-center">오늘 게임 참여 내역</h2>
                        
                        {gameHistory.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-[#737373] text-[16px]">아직 참여한 게임이 없습니다.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 mb-6">
                                {gameHistory.map((game, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 px-4 bg-[#f5f5f5] rounded-[12px]">
                                        <div className="flex items-center gap-3">
                                            {game.gameType === 'shooting' ? (
                                                <div className="h-[24px] w-[24px] flex items-center justify-center">
                                                    <Target className="text-[#ff6b6b] size-8" />
                                                </div>
                                            ) : (
                                                <img 
                                                    src={game.gameType === 'apple' ? appleIcon : wordleIcon} 
                                                    alt={game.gameType === 'apple' ? '사과 게임' : '워들 게임'} 
                                                    className="h-[32px] w-auto object-contain"
                                                />
                                            )}
                                            <span className="font-semibold text-[16px] text-[#121212]">
                                                {game.gameType === 'apple' ? '사과 게임' : game.gameType === 'shooting' ? '슈팅워들 게임' : '워들 게임'}
                                            </span>
                                        </div>
                                        <span className="font-bold text-[16px] text-[#ff6b6b]">-1</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between py-4 px-4 bg-[#fff0db] rounded-[12px] mb-6">
                            <span className="font-bold text-[18px] text-[#121212]">남은 게임</span>
                            <span className="font-black text-[24px] text-[#ff6b6b]">{dailyGamesRemaining}/10</span>
                        </div>

                        <button
                            onClick={() => setShowGameHistoryModal(false)}
                            className="w-full bg-[#ff6b6b] text-white font-semibold text-[16px] py-[12px] px-[24px] rounded-[8px] hover:bg-[#ff5252] transition-colors"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            {/* Contact Modal (신고/문의하기) */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setShowContactModal(false)}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-[20px] p-6 max-w-[400px] w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 헤더 */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-[22px] text-gray-800">신고 / 문의하기</h2>
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-600" />
                            </button>
                        </div>

                        {/* 타입 선택 */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">유형</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setContactForm({ ...contactForm, type: 'report' })}
                                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                                        contactForm.type === 'report'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    신고
                                </button>
                                <button
                                    onClick={() => setContactForm({ ...contactForm, type: 'inquiry' })}
                                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                                        contactForm.type === 'inquiry'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    문의
                                </button>
                            </div>
                        </div>

                        {/* 이메일 입력 */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">회신받을 이메일</label>
                            <input
                                type="email"
                                value={contactForm.email}
                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                placeholder="example@email.com"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>

                        {/* 내용 입력 */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">내용</label>
                            <textarea
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                placeholder={contactForm.type === 'report' ? '신고 내용을 입력해주세요...' : '문의 내용을 입력해주세요...'}
                                rows={6}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors resize-none"
                            />
                        </div>

                        {/* 전송 버튼 */}
                        <button
                            onClick={handleContactSubmit}
                            disabled={isSubmitting}
                            className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                                isSubmitting
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary-dark'
                            }`}
                        >
                            {isSubmitting ? '전송 중...' : '전송하기'}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-3">
                            메일 앱으로 이동하여 전송됩니다
                        </p>
                    </motion.div>
                </div>
            )}

            {/* Walking Mission Modal */}
            {showWalkingMission && randomWalkingBrand?.mission?.walking && (
                <WalkingMissionPage
                    walkingData={randomWalkingBrand.mission.walking}
                    storeName={randomWalkingBrand.name}
                    storeImage={randomWalkingBrand.hintImage}
                    bonusPoints={5}
                    onBack={() => setShowWalkingMission(false)}
                    onSuccess={() => {
                        addPoints(5, `${randomWalkingBrand.name} 플레이스 미션 완료`);
                        setShowWalkingMission(false);
                    }}
                />
            )}
        </div>
    );
};

export default LandingPage;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Award } from 'lucide-react';
import { usePoints } from '../context/PointsContext';
import { getDefaultBrand, type Brand } from '../data/brands';
import appleIcon from '../assets/apple.png';
import wordleIcon from '../assets/wordle.png';
import checkIcon from '../assets/check.png';
import pointIcon from '../assets/point.png';
import backgroundImage from '../assets/background.png';

const LandingPage: React.FC = () => {
    const { points, dailyGamesRemaining } = usePoints();
    const [defaultBrand, setDefaultBrand] = useState<Brand | null>(null);

    useEffect(() => {
        const loadBrand = async () => {
            const brand = await getDefaultBrand();
            setDefaultBrand(brand);
        };
        loadBrand();
    }, []);

    return (
        <div className="bg-[#fafafa] flex flex-col items-center min-h-screen w-full pb-10">
            {/* Hero Section */}
            <div className="relative w-full h-[320px] overflow-hidden bg-gradient-to-br from-primary to-[#bb003c]">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                />
                
                {/* Abstract patterns for visual flair */}
                <div className="absolute top-[-50px] left-[-30px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-50px] right-[-30px] w-64 h-64 bg-black/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col justify-end h-full px-8 pb-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-black text-white leading-tight drop-shadow-md">
                            매일 플레이 하고<br />
                            포인트 받기
                        </h2>
                        <p className="mt-4 text-white/90 text-lg font-bold drop-shadow-sm">
                            간단한 미션 완료하고 리워드를 받아보세요
                        </p>
                        {/* 일일 게임 횟수 표시 */}
                        <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                            <p className="text-white/95 text-sm font-bold">
                                오늘 남은 게임: {dailyGamesRemaining}/10
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Floating Point Header */}
                <div className="absolute top-6 right-6 z-20">
                    <Link to="/points-history" className="bg-white/95 backdrop-blur-sm rounded-full py-2 px-4 flex items-center gap-3 shadow-lg active:scale-95 transition-transform border border-white/20">
                        <div className="bg-primary p-1.5 rounded-full">
                            <Award className="text-white size-5" />
                        </div>
                        <span className="text-primary font-bold text-xl">{points.toLocaleString()} P</span>
                    </Link>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="w-full max-w-md px-6 -mt-4 relative z-30 space-y-4">
                {/* Game Area - 항상 표시 */}
                <div className="space-y-4">
                    <Link 
                        to={defaultBrand ? `/game/apple?brand=${defaultBrand.id}` : '#'} 
                        className="group bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98] touch-manipulation"
                        onClick={(e) => {
                            if (!defaultBrand) {
                                e.preventDefault();
                                alert('퀴즈를 불러오는 중입니다. 잠시만 기다려주세요.');
                            }
                        }}
                    >
                        <img src={appleIcon} alt="사과 게임" loading="lazy" className="h-[72px] w-auto object-contain group-hover:scale-105 transition-transform pointer-events-none" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">사과 게임</h3>
                            <p className="text-gray-500 text-sm line-clamp-1">숫자10 만들고 글자 모으기</p>
                        </div>
                        <ChevronRight className="text-primary size-6 flex-shrink-0" />
                    </Link>

                    <Link 
                        to={defaultBrand ? `/game/wordle?brand=${defaultBrand.id}` : '#'} 
                        className="group bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98] touch-manipulation"
                        onClick={(e) => {
                            if (!defaultBrand) {
                                e.preventDefault();
                                alert('퀴즈를 불러오는 중입니다. 잠시만 기다려주세요.');
                            }
                        }}
                    >
                        <img src={wordleIcon} alt="워들 게임" loading="lazy" className="h-[72px] w-auto object-contain group-hover:scale-105 transition-transform pointer-events-none" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">워들 게임</h3>
                            <p className="text-gray-500 text-sm line-clamp-1">가게명을 맞추고 포인트 받기</p>
                        </div>
                        <ChevronRight className="text-primary size-6 flex-shrink-0" />
                    </Link>
                </div>

                {/* Utility Area */}
                <div className="grid grid-cols-2 gap-4">
                    <Link to="/attendance" className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98] min-h-[160px] touch-manipulation">
                        <img src={checkIcon} alt="출석 미션" loading="lazy" className="h-[72px] w-auto object-contain pointer-events-none" />
                        <span className="font-bold text-gray-800 text-base text-center">출석 미션</span>
                    </Link>

                    <Link to="/points-history" className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98] min-h-[160px] touch-manipulation">
                        <img src={pointIcon} alt="적립 내역" loading="lazy" className="h-[72px] w-auto object-contain pointer-events-none" />
                        <span className="font-bold text-gray-800 text-base text-center">적립 내역</span>
                    </Link>
                </div>

                {/* Admin/Merchant Prompt */}
                <div className="pt-2">
                    <Link to="/admin" className="block w-full bg-gray-50 rounded-2xl p-5 text-center text-gray-500 font-semibold hover:bg-gray-100 transition-colors">
                        자영업자이신가요? 퀴즈 등록하러 가기
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

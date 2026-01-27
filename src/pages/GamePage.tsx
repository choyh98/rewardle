import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getBrandById, markBrandAsCompleted, type Brand } from '../data/brands';
import { usePoints } from '../context/PointsContext';
import type { GameType } from '../types';

// 게임 컴포넌트 lazy loading
const WordleGame = lazy(() => import('../components/games/WordleGame'));
const AppleGame = lazy(() => import('../components/games/AppleGame'));
const ShootingWordle = lazy(() => import('../components/games/shootingwordle/ShootingWordle'));

// 로딩 컴포넌트
const GameLoadingFallback = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-primary font-bold text-lg">게임 준비 중...</p>
    </div>
);

const GamePage: React.FC = () => {
    const { type } = useParams<{ type: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addPoints, recordGameCompletion, canPlayGame } = usePoints();
    const [isLoading, setIsLoading] = useState(true);
    const [brand, setBrand] = useState<Brand | null>(null);
    const hasRecorded = useRef(false); // 중복 차감 방지

    const brandId = searchParams.get('brand') || 'aquagarden';

    // 브랜드 데이터 로드 및 일일 제한 확인
    useEffect(() => {
        const loadBrandAndCheckLimit = async () => {
            // 게임 시작 전 체크만 수행
            if (!canPlayGame()) {
                alert('오늘의 게임 참여 횟수를 모두 사용했습니다.\n내일 다시 도전해주세요!');
                navigate('/home');
                return;
            }

            try {
                const loadedBrand = await getBrandById(brandId);
                setBrand(loadedBrand);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to load brand:', error);
                alert('게임 데이터를 불러오는데 실패했습니다.');
                navigate('/home');
            }
        };

        loadBrandAndCheckLimit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brandId, navigate]); // canPlayGame 의존성 제거

    // 게임 횟수 차감 함수
    const handleDeductPlay = () => {
        if (!brand || hasRecorded.current) return;
        hasRecorded.current = true;
        const gameTypeKey = type === 'wordle' ? 'wordle' : type === 'shooting' ? 'shooting' : 'apple';
        recordGameCompletion(gameTypeKey as GameType, brand.id);
    };

    const handleComplete = (earnedPoints: number) => {
        if (!brand) return;
        
        const gameType = type === 'wordle' ? '워들 게임' : type === 'shooting' ? '슈팅워들 게임' : '사과 게임';
        
        if (earnedPoints > 0) {
            addPoints(earnedPoints, `${brand.name} ${gameType} 완료`);
            // 포인트를 받았을 때만 퀴즈 완료로 기록 (오늘 완료한 퀴즈 목록에 추가)
            markBrandAsCompleted(brand.id);
        }
    };

    const handleBack = () => {
        navigate('/home');
    };

    if (isLoading || !brand) {
        return <GameLoadingFallback />;
    }

    return (
        <Suspense fallback={<GameLoadingFallback />}>
            {type === 'wordle' && <WordleGame brand={brand} onComplete={handleComplete} onBack={handleBack} onDeductPlay={handleDeductPlay} />}
            {type === 'apple' && <AppleGame brand={brand} onComplete={handleComplete} onBack={handleBack} onDeductPlay={handleDeductPlay} />}
            {type === 'shooting' && <ShootingWordle brand={brand} onComplete={handleComplete} onBack={handleBack} onDeductPlay={handleDeductPlay} />}
            {!['wordle', 'apple', 'shooting'].includes(type || '') && (
                <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-8 text-center">
                    <h2 className="text-xl font-bold mb-4">해당 게임을 찾을 수 없습니다.</h2>
                    <button onClick={handleBack} className="bg-primary text-white px-6 py-3 rounded-xl font-bold touch-manipulation">홈으로 가기</button>
                </div>
            )}
        </Suspense>
    );
};

export default GamePage;

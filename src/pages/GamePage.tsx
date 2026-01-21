import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import WordleGame from '../components/games/WordleGame';
import AppleGame from '../components/games/AppleGame';
import { getBrandById, markBrandAsCompleted, type Brand } from '../data/brands';
import { usePoints } from '../context/PointsContext';

const GamePage: React.FC = () => {
    const { type } = useParams<{ type: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addPoints, recordGameCompletion, canPlayGame } = usePoints();
    const [isLoading, setIsLoading] = useState(true);
    const [brand, setBrand] = useState<Brand | null>(null);

    const brandId = searchParams.get('brand') || 'aquagarden';

    // 브랜드 데이터 로드 및 일일 제한 확인
    useEffect(() => {
        const loadBrandAndCheckLimit = async () => {
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
    }, [brandId, canPlayGame, navigate]);

    const handleComplete = (earnedPoints: number) => {
        if (!brand) return;
        const gameType = type === 'wordle' ? '워들 게임' : '사과 게임';
        addPoints(earnedPoints, `${brand.name} ${gameType} 완료`);
        
        // 포인트를 받았을 때만 게임 완료로 기록
        if (earnedPoints > 0) {
            recordGameCompletion();
            // 퀴즈 완료 기록 (오늘 완료한 퀴즈 목록에 추가)
            markBrandAsCompleted(brand.id);
        }
    };

    const handleBack = () => {
        navigate('/home');
    };

    if (!canPlayGame()) {
        return null;
    }

    if (isLoading || !brand) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
                <p className="text-primary font-bold text-lg">게임 준비 중...</p>
            </div>
        );
    }

    if (type === 'wordle') {
        return <WordleGame brand={brand} onComplete={handleComplete} onBack={handleBack} />;
    }

    if (type === 'apple') {
        return <AppleGame brand={brand} onComplete={handleComplete} onBack={handleBack} />;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-8 text-center">
            <h2 className="text-xl font-bold mb-4">해당 게임을 찾을 수 없습니다.</h2>
            <button onClick={handleBack} className="bg-primary text-white px-6 py-3 rounded-xl font-bold touch-manipulation">홈으로 가기</button>
        </div>
    );
};

export default GamePage;

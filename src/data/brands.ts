import { supabase } from '../lib/supabase';

interface QuizData {
    question: string;
    answer: string;
    bonusPoints: number;
}

interface Brand {
    id: string;
    name: string;
    wordleAnswer: string[];
    hintImage: string;
    placeQuiz: QuizData;
    placeUrl: string;
    appleGameWord: string;
}

// 캐시 데이터 구조
interface BrandCache {
    data: Brand[];
    timestamp: number;
}

let cachedBrands: BrandCache | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1시간 (밀리초)

// 캐시 유효성 검사
const isCacheValid = (cache: BrandCache | null): boolean => {
    if (!cache) return false;
    const now = Date.now();
    return (now - cache.timestamp) < CACHE_DURATION;
};

// Supabase에서 브랜드 데이터 가져오기
export const fetchBrands = async (): Promise<Brand[]> => {
    // 캐시가 유효하면 캐시 데이터 반환
    if (isCacheValid(cachedBrands)) {
        console.log('✅ Using cached brands data');
        return cachedBrands!.data;
    }

    try {
        console.log('🔄 Fetching fresh brands data from Supabase');
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .eq('is_active', true);

        if (error) {
            console.error('Supabase fetch error:', error);
            // 에러 시 오래된 캐시라도 반환
            if (cachedBrands) {
                console.warn('⚠️ Using stale cache due to error');
                return cachedBrands.data;
            }
            return [];
        }

        if (!data || data.length === 0) {
            console.warn('No brands found in database');
            return [];
        }

        // Supabase 데이터를 Brand 형식으로 변환
        const brands = data.map(item => ({
            id: item.id,
            name: item.name,
            wordleAnswer: item.wordle_answer,
            hintImage: item.hint_image,
            placeQuiz: {
                question: item.place_quiz_question,
                answer: item.place_quiz_answer,
                bonusPoints: 5
            },
            placeUrl: item.place_url,
            appleGameWord: item.apple_game_word
        }));

        // 새 데이터로 캐시 업데이트
        cachedBrands = {
            data: brands,
            timestamp: Date.now()
        };

        console.log(`✅ Cached ${brands.length} brands`);
        return brands;
    } catch (error) {
        console.error('Failed to fetch brands:', error);
        // 에러 시 오래된 캐시라도 반환
        if (cachedBrands) {
            console.warn('⚠️ Using stale cache due to error');
            return cachedBrands.data;
        }
        return [];
    }
};

// 오늘 완료한 퀴즈 ID 가져오기
const getTodayCompletedBrands = (): string[] => {
    try {
        const today = new Date().toDateString();
        const saved = localStorage.getItem('rewardle_completed_brands');
        if (!saved) return [];
        
        const data = JSON.parse(saved);
        // 날짜가 다르면 초기화
        if (data.date !== today) {
            localStorage.setItem('rewardle_completed_brands', JSON.stringify({ date: today, ids: [] }));
            return [];
        }
        return data.ids || [];
    } catch (error) {
        console.error('Error reading completed brands:', error);
        return [];
    }
};

// 퀴즈 완료 기록
export const markBrandAsCompleted = (brandId: string) => {
    try {
        const today = new Date().toDateString();
        const completedIds = getTodayCompletedBrands();
        
        if (!completedIds.includes(brandId)) {
            completedIds.push(brandId);
        }
        
        localStorage.setItem('rewardle_completed_brands', JSON.stringify({
            date: today,
            ids: completedIds
        }));
    } catch (error) {
        console.error('Error marking brand as completed:', error);
    }
};

export const getDefaultBrand = async (): Promise<Brand | null> => {
    const brands = await fetchBrands();
    if (brands.length === 0) return null;
    
    // 오늘 완료한 퀴즈 제외
    const completedIds = getTodayCompletedBrands();
    const availableBrands = brands.filter(brand => !completedIds.includes(brand.id));
    
    // 사용 가능한 퀴즈가 없으면 null 반환
    if (availableBrands.length === 0) {
        return null;
    }
    
    // 랜덤으로 브랜드 선택
    const randomIndex = Math.floor(Math.random() * availableBrands.length);
    return availableBrands[randomIndex];
};

export const getBrandById = async (id: string): Promise<Brand | null> => {
    const brands = await fetchBrands();
    // UUID 또는 문자열 ID 모두 지원
    const brand = brands.find(b => b.id === id);
    return brand || (brands.length > 0 ? brands[0] : null);
};

// 캐시 무효화 (새 브랜드 추가 후 호출)
export const invalidateBrandsCache = () => {
    cachedBrands = null;
};

export type { Brand, QuizData };

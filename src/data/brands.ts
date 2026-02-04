import { supabase } from '../lib/supabase';
import type { Brand, MissionData } from '../types';

// 캐시 데이터 구조
interface BrandCache {
    data: Brand[];
    timestamp: number;
}

let cachedBrands: BrandCache | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간 (밀리초) - Egress 절감

// 캐시 유효성 검사
const isCacheValid = (cache: BrandCache | null): boolean => {
    if (!cache) return false;
    const now = Date.now();
    return (now - cache.timestamp) < CACHE_DURATION;
};

// Supabase에서 브랜드 데이터 가져오기
export const fetchBrands = async (): Promise<Brand[]> => {
    // 메모리 캐시 확인
    if (isCacheValid(cachedBrands)) {
        console.log('✅ Using memory cached brands data');
        return cachedBrands!.data;
    }

    try {
        console.log('🔄 Fetching fresh brands data from Supabase');
        const { data, error } = await supabase
            .from('brands')
            .select(`
                id,
                name,
                wordle_answer,
                hint_image,
                place_quiz_question,
                place_quiz_answer,
                place_url,
                apple_game_word,
                shooting_wordle_answer,
                mission_data,
                is_active
            `)
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
        const brands = data.map(item => {
            // mission_data 파싱
            let missionData: MissionData | undefined;
            
            if (item.mission_data) {
                // 새로운 mission_data 사용
                missionData = item.mission_data as MissionData;
            } else if (item.place_quiz_question && item.place_quiz_answer) {
                // 레거시 placeQuiz 데이터를 mission_data로 변환
                missionData = {
                    type: 'quiz',
                    quiz: {
                        question: item.place_quiz_question,
                        answer: item.place_quiz_answer,
                        bonusPoints: 5
                    },
                    bonusPoints: 5
                };
            }

            return {
                id: item.id,
                name: item.name,
                wordleAnswer: item.wordle_answer,
                hintImage: item.hint_image,
                placeQuiz: {
                    question: item.place_quiz_question || '',
                    answer: item.place_quiz_answer || '',
                    bonusPoints: 5
                },
                placeUrl: item.place_url,
                appleGameWord: item.apple_game_word,
                shootingWordleAnswer: item.shooting_wordle_answer || item.name,
                mission: missionData
            };
        });

        // 새 데이터로 캐시 업데이트
        cachedBrands = {
            data: brands,
            timestamp: Date.now()
        };

        console.log(`✅ Cached ${brands.length} brands in memory (24h)`);
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

export const getDefaultBrand = async (difficulty?: 'easy' | 'normal' | 'hard'): Promise<Brand | null> => {
    const brands = await fetchBrands();
    if (brands.length === 0) return null;
    
    // 오늘 완료한 퀴즈 제외
    const completedIds = getTodayCompletedBrands();
    let availableBrands = brands.filter(brand => !completedIds.includes(brand.id));
    
    // 난이도에 따라 필터링
    if (difficulty) {
        availableBrands = availableBrands.filter(brand => {
            const wordLength = brand.wordleAnswer.length;
            if (difficulty === 'easy') {
                return wordLength >= 3 && wordLength <= 4;
            } else if (difficulty === 'normal') {
                return wordLength === 5;
            } else { // hard
                return wordLength >= 6;
            }
        });
    }
    
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
    console.log('🔄 Cache invalidated');
};

export type { Brand, QuizData } from '../types';

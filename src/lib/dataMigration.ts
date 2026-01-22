import { supabase } from './supabase';

/**
 * localStorage 데이터를 Supabase로 마이그레이션
 * 게스트 → 로그인 사용자로 전환 시 호출
 */
export const migrateLocalStorageToSupabase = async (userId: string): Promise<boolean> => {
    try {
        console.log('🔄 Starting data migration to Supabase...');

        // 1. 포인트 마이그레이션
        const savedPoints = localStorage.getItem('rewardle_points');
        if (savedPoints) {
            const points = parseInt(savedPoints);
            await supabase.from('user_points').upsert({
                user_id: userId,
                points: points
            });
            console.log('✅ Points migrated:', points);
        }

        // 2. 포인트 내역 마이그레이션
        const savedHistory = localStorage.getItem('rewardle_history');
        if (savedHistory) {
            const history = JSON.parse(savedHistory);
            if (Array.isArray(history) && history.length > 0) {
                const historyRecords = history.map(item => ({
                    user_id: userId,
                    amount: item.amount,
                    reason: item.reason,
                    created_at: item.date
                }));
                
                await supabase.from('point_history').insert(historyRecords);
                console.log('✅ History migrated:', history.length, 'records');
            }
        }

        // 3. 출석 기록 마이그레이션
        const lastCheck = localStorage.getItem('rewardle_last_check');
        const streak = localStorage.getItem('rewardle_attendance_streak');
        if (lastCheck && streak) {
            const checkDate = new Date(lastCheck).toISOString().split('T')[0];
            await supabase.from('attendance').insert({
                user_id: userId,
                check_date: checkDate,
                streak: parseInt(streak)
            });
            console.log('✅ Attendance migrated');
        }

        // 4. 오늘의 게임 플레이 기록 마이그레이션
        const savedGameHistory = localStorage.getItem('rewardle_game_history');
        if (savedGameHistory) {
            const gameHistory = JSON.parse(savedGameHistory);
            const today = new Date().toDateString();
            const todayGames = gameHistory.filter((item: any) => item.date === today);
            
            if (todayGames.length > 0) {
                // 먼저 기본 브랜드 ID 가져오기
                const { data: brands } = await supabase.from('brands').select('id').limit(1).single();
                const defaultBrandId = brands?.id || null;

                if (defaultBrandId) {
                    const gameRecords = todayGames.map((item: any) => ({
                        user_id: userId,
                        game_type: item.gameType,
                        brand_id: defaultBrandId,
                        score: 0
                    }));
                    
                    await supabase.from('game_plays').insert(gameRecords);
                    console.log('✅ Game history migrated:', todayGames.length, 'records');
                }
            }
        }

        console.log('✅ Migration completed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Migration failed:', error);
        return false;
    }
};

/**
 * localStorage 데이터 정리
 * 마이그레이션 성공 후 호출
 */
export const clearLocalStorageData = () => {
    const keysToRemove = [
        'rewardle_points',
        'rewardle_history',
        'rewardle_last_check',
        'rewardle_attendance_streak',
        'rewardle_daily_games',
        'rewardle_game_history',
        'rewardle_completed_brands',
        'rewardle_guest_id'
    ];

    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });

    console.log('🗑️ localStorage data cleared');
};

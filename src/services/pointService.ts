import { supabase } from '../lib/supabase';
import { STORAGE_KEYS } from '../data/constants';
import type { PointHistory } from '../types';

export const pointService = {
    // 사용자 포인트 가져오기
    async getUserPoints(userId: string): Promise<number> {
        const { data, error } = await supabase
            .from('user_points')
            .select('points')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        // 레코드가 없으면 생성
        if (!data) {
            const { error: insertError } = await supabase
                .from('user_points')
                .insert({ user_id: userId, points: 0 });
            
            if (insertError) {
                console.error('Failed to create user_points:', insertError);
            }
            return 0;
        }

        return data.points || 0;
    },

    // 포인트 내역 가져오기
    async getPointHistory(userId: string, limit = 100): Promise<PointHistory[]> {
        const { data, error } = await supabase
            .from('point_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (data || []).map(item => ({
            date: item.created_at,
            reason: item.reason,
            amount: item.amount
        }));
    },

    // 포인트 추가
    async addPoints(userId: string, amount: number, reason: string): Promise<number> {
        // 1. 현재 포인트 조회 (DB에서 직접 가져옴)
        const currentPoints = await this.getUserPoints(userId);
        const newPoints = currentPoints + amount;

        console.log('addPoints:', { userId, currentPoints, amount, newPoints });

        // 2. 포인트 내역 추가
        const { error: historyError } = await supabase.from('point_history').insert({
            user_id: userId,
            amount,
            reason
        });

        if (historyError) {
            console.error('Failed to insert point_history:', historyError);
            throw historyError;
        }

        // 3. 총 포인트 업데이트 (upsert 사용)
        const { error: updateError } = await supabase
            .from('user_points')
            .upsert({ 
                user_id: userId, 
                points: newPoints 
            }, {
                onConflict: 'user_id'
            });

        if (updateError) {
            console.error('Failed to upsert user_points:', updateError);
            throw updateError;
        }
        
        console.log('포인트 저장 성공:', newPoints);
        return newPoints;
    },

    // 게스트 포인트를 로그인 계정으로 마이그레이션
    async migrateGuestPoints(newUserId: string): Promise<{ migratedPoints: number; success: boolean }> {
        try {
            // 1. localStorage에서 게스트 포인트 읽기
            const guestPoints = localStorage.getItem(STORAGE_KEYS.POINTS);
            const guestHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);

            if (!guestPoints || parseInt(guestPoints) === 0) {
                console.log('마이그레이션할 게스트 포인트가 없습니다.');
                return { migratedPoints: 0, success: true };
            }

            const pointsToMigrate = parseInt(guestPoints);
            console.log('게스트 포인트 마이그레이션 시작:', { pointsToMigrate, newUserId });

            // 2. 로그인 계정에 포인트 추가
            const newTotalPoints = await this.addPoints(
                newUserId,
                pointsToMigrate,
                '게스트 모드에서 획득한 포인트 이전'
            );

            // 3. 게스트 히스토리도 마이그레이션 (선택사항)
            if (guestHistory) {
                try {
                    const historyItems = JSON.parse(guestHistory);
                    // 최근 10개만 마이그레이션
                    const itemsToMigrate = historyItems.slice(0, 10);
                    
                    for (const item of itemsToMigrate) {
                        await supabase.from('point_history').insert({
                            user_id: newUserId,
                            amount: item.amount,
                            reason: `[게스트] ${item.reason}`,
                            created_at: item.date
                        });
                    }
                } catch (historyError) {
                    console.error('히스토리 마이그레이션 실패 (무시):', historyError);
                }
            }

            // 4. localStorage 정리
            localStorage.removeItem(STORAGE_KEYS.POINTS);
            localStorage.removeItem(STORAGE_KEYS.HISTORY);
            localStorage.removeItem(STORAGE_KEYS.GUEST_ID);

            console.log('마이그레이션 완료:', { migratedPoints: pointsToMigrate, newTotalPoints });
            return { migratedPoints: pointsToMigrate, success: true };

        } catch (error) {
            console.error('포인트 마이그레이션 실패:', error);
            return { migratedPoints: 0, success: false };
        }
    }
};

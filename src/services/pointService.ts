import { supabase } from '../lib/supabase';
import { STORAGE_KEYS } from '../data/constants';
import type { PointHistory } from '../types';

export const pointService = {
    // 사용자 포인트 가져오기 (읽기 전용 - 변경 없음)
    async getUserPoints(userId: string): Promise<number> {
        const { data, error } = await supabase
            .from('user_points')
            .select('points')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data?.points || 0;
    },

    // 포인트 내역 가져오기 (읽기 전용 - 변경 없음)
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

    // 🔒 보안 강화: RPC 함수로 변경
    // 포인트 추가 (이제 보안 RPC 함수 사용)
    async addPoints(userId: string, amount: number, reason: string): Promise<number> {
        console.log('addPoints (RPC):', { userId, amount, reason });

        try {
            // RPC 함수 호출 (서버 측 검증 포함)
            const { data, error } = await supabase.rpc('secure_add_points', {
                p_user_id: userId,
                p_amount: amount,
                p_reason: reason
            });

            if (error) {
                console.error('Failed to add points (RPC):', error);
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('포인트 적립에 실패했습니다.');
            }

            const result = data[0];
            
            if (!result.success) {
                throw new Error(result.message || '포인트 적립 실패');
            }

            console.log('포인트 적립 성공 (RPC):', result.new_points);
            return result.new_points;

        } catch (error) {
            console.error('포인트 적립 중 오류:', error);
            throw error;
        }
    },

    // 게스트 포인트를 로그인 계정으로 마이그레이션
    async migrateGuestPoints(newUserId: string): Promise<{ migratedPoints: number; success: boolean }> {
        try {
            // 1. localStorage에서 게스트 포인트 읽기
            const guestPoints = localStorage.getItem(STORAGE_KEYS.POINTS);

            if (!guestPoints || parseInt(guestPoints) === 0) {
                console.log('마이그레이션할 게스트 포인트가 없습니다.');
                return { migratedPoints: 0, success: true };
            }

            const pointsToMigrate = parseInt(guestPoints);
            console.log('게스트 포인트 마이그레이션 시작:', { pointsToMigrate, newUserId });

            // 2. 이미 회원가입된 사용자인지 확인 (user_points 테이블 존재 여부)
            const { data: existingUser, error: checkError } = await supabase
                .from('user_points')
                .select('points, created_at')
                .eq('user_id', newUserId)
                .maybeSingle();

            if (checkError) {
                console.error('사용자 확인 중 오류:', checkError);
                throw checkError;
            }

            // 이미 회원가입된 사용자라면 게스트 포인트 버리기
            if (existingUser) {
                console.log('이미 회원가입된 사용자입니다. 게스트 포인트는 마이그레이션하지 않습니다.');
                
                // localStorage만 정리
                localStorage.removeItem(STORAGE_KEYS.POINTS);
                localStorage.removeItem(STORAGE_KEYS.HISTORY);
                localStorage.removeItem(STORAGE_KEYS.GUEST_ID);
                
                return { migratedPoints: 0, success: true };
            }

            // 3. 신규 사용자라면 RPC 함수로 로그인 계정에 포인트 추가
            await this.addPoints(
                newUserId,
                pointsToMigrate,
                '게스트 모드에서 획득한 포인트 이전'
            );

            // 4. localStorage 정리
            localStorage.removeItem(STORAGE_KEYS.POINTS);
            localStorage.removeItem(STORAGE_KEYS.HISTORY);
            localStorage.removeItem(STORAGE_KEYS.GUEST_ID);

            console.log('마이그레이션 완료:', { migratedPoints: pointsToMigrate });
            return { migratedPoints: pointsToMigrate, success: true };

        } catch (error) {
            console.error('포인트 마이그레이션 실패:', error);
            return { migratedPoints: 0, success: false };
        }
    }
};

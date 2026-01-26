import { supabase } from '../lib/supabase';

export const missionService = {
    // 🔒 보안 강화: 미션 완료 (RPC 함수)
    async completeMission(
        userId: string,
        missionType: 'quiz' | 'walking',
        brandName: string
    ): Promise<number> {
        try {
            const { data, error } = await supabase.rpc('complete_mission', {
                p_user_id: userId,
                p_mission_type: missionType === 'quiz' ? '퀴즈' : '길찾기',
                p_brand_name: brandName
            });

            if (error) {
                console.error('Failed to complete mission (RPC):', error);
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('미션 완료 처리에 실패했습니다.');
            }

            const result = data[0];
            
            if (!result.success) {
                throw new Error(result.message || '미션 완료 실패');
            }

            console.log('미션 완료:', { points: result.points_awarded, message: result.message });
            return result.points_awarded;

        } catch (error) {
            console.error('미션 완료 처리 중 오류:', error);
            throw error;
        }
    }
};

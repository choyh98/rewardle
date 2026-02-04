import { supabase } from '../lib/supabase';
import type { GameType } from '../types';

// 사용자 로컬 기준 "오늘 00:00"을 ISO 문자열로 반환 (Supabase 타임존 비교용)
function getStartOfTodayISO(): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
}

export const gameService = {
    // 오늘의 게임 플레이 내역 가져오기 (필요한 컬럼만)
    async getTodayGamePlays(userId: string) {
        const startOfToday = getStartOfTodayISO();
        console.log('getTodayGamePlays 시작:', { userId, startOfToday });
        
        // game_plays 테이블에서 조회
        const { data, error } = await supabase
            .from('game_plays')
            .select('game_type, created_at')
            .eq('user_id', userId)
            .gte('created_at', startOfToday)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('getTodayGamePlays 에러:', error);
            throw error;
        }

        console.log('getTodayGamePlays 결과 (game_plays):', { count: data?.length || 0, data });

        const todayString = new Date().toDateString();
        return {
            count: data?.length || 0,
            history: (data || []).map(item => ({
                date: todayString,
                gameType: item.game_type as GameType
            }))
        };
    },

    // 🔒 보안 강화: 게임 세션 시작 (새로운 함수)
    async startGameSession(userId: string, gameType: GameType, brandId?: string): Promise<string> {
        try {
            const { data, error } = await supabase.rpc('start_game_session', {
                p_user_id: userId,
                p_game_type: gameType,
                p_brand_id: brandId || null
            });

            if (error) {
                console.error('Failed to start game session:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('게임 세션 시작에 실패했습니다.');
            }

            const result = data[0];
            
            if (!result.success) {
                throw new Error(result.message || '게임 세션 시작 실패');
            }

            console.log('게임 세션 시작:', result.session_id);
            return result.session_id;

        } catch (error) {
            console.error('게임 세션 시작 중 오류:', error);
            throw error;
        }
    },

    // 🔒 보안 강화: 게임 완료 (RPC 함수로 변경)
    async completeGameSession(sessionId: string, userId: string, points: number): Promise<void> {
        try {
            const { data, error } = await supabase.rpc('complete_game_session', {
                p_session_id: sessionId,
                p_user_id: userId,
                p_points: points
            });

            if (error) {
                console.error('Failed to complete game session:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('게임 완료 처리에 실패했습니다.');
            }

            const result = data[0];
            
            if (!result.success) {
                throw new Error(result.message || '게임 완료 실패');
            }

            console.log('게임 완료:', result.message);

        } catch (error) {
            console.error('게임 완료 처리 중 오류:', error);
            throw error;
        }
    },

    // 게임 시작 시 간단한 기록 (세션 검증 없이)
    async recordGameCompletion(userId: string, gameType: GameType, brandId?: string): Promise<void> {
        try {
            console.log('게임 시작 기록:', { userId, gameType, brandId });
            
            // game_plays 테이블에 직접 insert (세션 검증 없이 단순 기록만)
            const { error } = await supabase
                .from('game_plays')
                .insert({
                    user_id: userId,
                    game_type: gameType,
                    brand_id: brandId || null,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.error('게임 기록 실패:', error);
                throw error;
            }

            console.log('✅ 게임 시작 기록 완료');
        } catch (error) {
            console.error('게임 기록 중 오류:', error);
            throw error;
        }
    }
};

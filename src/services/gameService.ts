import { supabase } from '../lib/supabase';
import type { GameType } from '../types';

export const gameService = {
    // 오늘의 게임 플레이 내역 가져오기
    async getTodayGamePlays(userId: string) {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('game_plays')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', today)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const todayString = new Date().toDateString();
        return {
            count: data?.length || 0,
            history: (data || []).map(item => ({
                date: todayString,
                gameType: item.game_type as GameType
            }))
        };
    },

    // 게임 완료 기록
    async recordGameCompletion(userId: string, gameType: GameType, brandId?: string): Promise<void> {
        await supabase.from('game_plays').insert({
            user_id: userId,
            game_type: gameType,
            brand_id: brandId || null,
            score: 0
        });
    }
};

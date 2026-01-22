import { supabase } from '../lib/supabase';
import type { PointHistory, GamePlay } from '../lib/supabase';

export const pointService = {
    async fetchPoints(userId: string) {
        const { data, error } = await supabase
            .from('user_points')
            .select('points')
            .eq('user_id', userId)
            .maybeSingle();
        if (error) throw error;
        return data?.points ?? 0;
    },

    async initUserPoints(userId: string) {
        const { error } = await supabase
            .from('user_points')
            .upsert({ user_id: userId, points: 0 });
        if (error) throw error;
        return 0;
    },

    async fetchPointHistory(userId: string) {
        const { data, error } = await supabase
            .from('point_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) throw error;
        return data as PointHistory[];
    },

    async addPoints(userId: string, pointsToAdd: number, reason: string) {
        const currentPoints = await this.fetchPoints(userId);
        const newPoints = currentPoints + pointsToAdd;

        const { error: profileError } = await supabase
            .from('user_points')
            .upsert({ user_id: userId, points: newPoints });
        if (profileError) throw profileError;

        const { error: historyError } = await supabase
            .from('point_history')
            .insert({
                user_id: userId,
                amount: pointsToAdd,
                reason: reason
            });
        if (historyError) throw historyError;

        return newPoints;
    },

    async fetchDailyGamePlays(userId: string, dateStr: string) {
        const { data, error } = await supabase
            .from('game_plays')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', dateStr);
        if (error) throw error;
        return data as GamePlay[];
    },

    async recordGamePlay(userId: string, brandId: string | null, gameType: string) {
        const { data, error } = await supabase
            .from('game_plays')
            .insert({
                user_id: userId,
                brand_id: brandId,
                game_type: gameType,
                score: 0
            })
            .select()
            .single();
        if (error) throw error;
        return data as GamePlay;
    }
};

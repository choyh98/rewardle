import { supabase } from './supabase';
import type { PointHistory, GameType, AttendanceData } from '../types';

// ============================================
// 포인트 서비스
// ============================================

export const pointsService = {
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
    }
};

// ============================================
// 게임 서비스
// ============================================

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

// ============================================
// 출석 서비스
// ============================================

export const attendanceService = {
    // 오늘 출석 여부 확인
    async getTodayAttendance(userId: string): Promise<AttendanceData | null> {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId)
            .eq('check_date', today)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        if (data) {
            return {
                checked: true,
                streak: data.streak,
                lastCheckDate: data.check_date
            };
        }

        return null;
    },

    // 최근 출석 기록 가져오기
    async getLastAttendance(userId: string): Promise<AttendanceData | null> {
        const { data } = await supabase
            .from('attendance')
            .select('streak, check_date')
            .eq('user_id', userId)
            .order('check_date', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (data) {
            return {
                checked: false,
                streak: data.streak,
                lastCheckDate: data.check_date
            };
        }

        return null;
    },

    // 출석 체크 기록
    async recordAttendance(userId: string, streak: number): Promise<void> {
        const todayISO = new Date().toISOString().split('T')[0];

        // 중복 체크
        const { data: existingRecord } = await supabase
            .from('attendance')
            .select('id')
            .eq('user_id', userId)
            .eq('check_date', todayISO)
            .maybeSingle();

        if (!existingRecord) {
            await supabase.from('attendance').insert({
                user_id: userId,
                check_date: todayISO,
                streak: streak
            });
        }
    }
};

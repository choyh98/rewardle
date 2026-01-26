import { supabase } from '../lib/supabase';
import type { Attendance } from '../lib/supabase';
import type { AttendanceData } from '../types';

export const attendanceService = {
    async fetchAttendance(userId: string) {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId)
            .order('check_date', { ascending: false });
        if (error) throw error;
        return data as Attendance[];
    },

    // 🔒 보안 강화: RPC 함수로 변경
    async checkIn(userId: string): Promise<{ streak: number; points: number }> {
        try {
            const { data, error } = await supabase.rpc('secure_check_attendance', {
                p_user_id: userId
            });

            if (error) {
                console.error('Failed to check in (RPC):', error);
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('출석 체크에 실패했습니다.');
            }

            const result = data[0];
            
            if (!result.success) {
                throw new Error(result.message || '출석 체크 실패');
            }

            console.log('출석 체크 성공:', { streak: result.streak, points: result.points_awarded });
            return {
                streak: result.streak,
                points: result.points_awarded
            };

        } catch (error) {
            console.error('출석 체크 중 오류:', error);
            throw error;
        }
    },

    // 오늘 출석 여부 확인 (읽기 전용 - 변경 없음)
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

    // 최근 출석 기록 가져오기 (읽기 전용 - 변경 없음)
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

    // 레거시 함수 (하위 호환성 유지)
    async recordAttendance(userId: string, streak: number): Promise<void> {
        console.warn('recordAttendance는 deprecated되었습니다. checkIn을 사용하세요.');
        await this.checkIn(userId);
    }
};

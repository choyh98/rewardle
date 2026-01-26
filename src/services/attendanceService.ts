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

    async checkIn(userId: string, dateStr: string, streak: number) {
        // Prevent duplicate check-in
        const { data: existing } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId)
            .eq('check_date', dateStr)
            .single();

        if (existing) return existing as Attendance;

        const { data, error } = await supabase
            .from('attendance')
            .insert({
                user_id: userId,
                check_date: dateStr,
                streak: streak
            })
            .select()
            .single();

        if (error) throw error;
        return data as Attendance;
    },

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

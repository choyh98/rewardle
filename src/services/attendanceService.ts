import { supabase } from '../lib/supabase';
import type { Attendance } from '../lib/supabase';

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
    }
};

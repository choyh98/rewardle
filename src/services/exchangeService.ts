import { supabase } from '../lib/supabase';

export interface PointExchange {
    id: string;
    user_id: string;
    name: string;
    phone: string;
    voucher_type: string;
    points: number;
    status: 'pending' | 'completed' | 'rejected';
    created_at: string;
    completed_at?: string;
}

/**
 * 포인트 교환 신청 생성
 */
export const createExchange = async (
    userId: string,
    name: string,
    phone: string,
    voucherType: string,
    points: number
): Promise<PointExchange> => {
    const { data, error } = await supabase
        .from('point_exchanges')
        .insert([
            {
                user_id: userId,
                name: name.trim(),
                phone: phone.trim(),
                voucher_type: voucherType,
                points: points,
                status: 'pending'
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('Failed to create exchange:', error);
        throw error;
    }

    return data;
};

/**
 * 사용자의 교환 신청 내역 조회
 */
export const getUserExchanges = async (userId: string): Promise<PointExchange[]> => {
    const { data, error } = await supabase
        .from('point_exchanges')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to get user exchanges:', error);
        throw error;
    }

    return data || [];
};

/**
 * 모든 교환 신청 내역 조회 (관리자용)
 */
export const getAllExchanges = async (): Promise<PointExchange[]> => {
    const { data, error } = await supabase
        .from('point_exchanges')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to get all exchanges:', error);
        throw error;
    }

    return data || [];
};

/**
 * 교환 신청 상태 변경
 */
export const updateExchangeStatus = async (
    exchangeId: string,
    status: 'completed' | 'rejected'
): Promise<void> => {
    const updates: any = { status };
    
    if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from('point_exchanges')
        .update(updates)
        .eq('id', exchangeId);

    if (error) {
        console.error('Failed to update exchange status:', error);
        throw error;
    }
};

/**
 * 대기 중인 교환 신청 개수 조회
 */
export const getPendingExchangesCount = async (): Promise<number> => {
    const { count, error } = await supabase
        .from('point_exchanges')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    if (error) {
        console.error('Failed to get pending exchanges count:', error);
        return 0;
    }

    return count || 0;
};

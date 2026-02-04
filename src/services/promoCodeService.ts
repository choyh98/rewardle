import { supabase } from '../lib/supabase';

export interface PromoCode {
    id: string;
    code: string;
    bonus_points: number;
    description: string | null;
    max_uses: number | null;
    current_uses: number;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
}

export interface PromoCodeResult {
    success: boolean;
    message: string;
    points_awarded: number;
}

export const promoCodeService = {
    /**
     * 프로모션 코드 적용
     */
    async applyPromoCode(userId: string, code: string): Promise<PromoCodeResult> {
        try {
            const { data, error } = await supabase.rpc('apply_promo_code', {
                p_user_id: userId,
                p_code: code.toUpperCase().trim()
            });

            if (error) {
                console.error('프로모션 코드 적용 실패:', error);
                return {
                    success: false,
                    message: '프로모션 코드 적용 중 오류가 발생했습니다.',
                    points_awarded: 0
                };
            }

            if (!data || data.length === 0) {
                return {
                    success: false,
                    message: '프로모션 코드를 찾을 수 없습니다.',
                    points_awarded: 0
                };
            }

            return data[0];
        } catch (error) {
            console.error('프로모션 코드 적용 중 오류:', error);
            return {
                success: false,
                message: '프로모션 코드 적용 중 오류가 발생했습니다.',
                points_awarded: 0
            };
        }
    },

    /**
     * 프로모션 코드 검증 (필요한 컬럼만)
     */
    async validatePromoCode(code: string): Promise<{
        valid: boolean;
        promoCode?: PromoCode;
        message: string;
    }> {
        try {
            const { data, error } = await supabase
                .from('promo_codes')
                .select('id, code, bonus_points, description, max_uses, current_uses, expires_at, is_active, created_at')
                .eq('code', code.toUpperCase().trim())
                .eq('is_active', true)
                .maybeSingle();

            if (error) {
                console.error('프로모션 코드 검증 실패:', error);
                return {
                    valid: false,
                    message: '프로모션 코드를 확인할 수 없습니다.'
                };
            }

            if (!data) {
                return {
                    valid: false,
                    message: '유효하지 않은 프로모션 코드입니다.'
                };
            }

            // 만료일 확인
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                return {
                    valid: false,
                    promoCode: data,
                    message: '만료된 프로모션 코드입니다.'
                };
            }

            // 최대 사용 횟수 확인
            if (data.max_uses && data.current_uses >= data.max_uses) {
                return {
                    valid: false,
                    promoCode: data,
                    message: '프로모션 코드 사용 가능 횟수가 초과되었습니다.'
                };
            }

            return {
                valid: true,
                promoCode: data,
                message: `${data.bonus_points}P 보너스를 받을 수 있습니다!`
            };
        } catch (error) {
            console.error('프로모션 코드 검증 중 오류:', error);
            return {
                valid: false,
                message: '프로모션 코드를 확인할 수 없습니다.'
            };
        }
    },

    /**
     * 사용자가 이미 사용한 프로모션 코드 조회
     */
    async getUserPromoCodeUsage(userId: string): Promise<PromoCode[]> {
        try {
            const { data, error } = await supabase
                .from('promo_code_usage')
                .select(`
                    *,
                    promo_codes (*)
                `)
                .eq('user_id', userId)
                .order('used_at', { ascending: false });

            if (error) {
                console.error('프로모션 코드 사용 기록 조회 실패:', error);
                return [];
            }

            return data.map((usage: any) => usage.promo_codes);
        } catch (error) {
            console.error('프로모션 코드 사용 기록 조회 중 오류:', error);
            return [];
        }
    },

    /**
     * 모든 활성 프로모션 코드 조회 (관리자용, 필요한 컬럼만)
     */
    async getAllPromoCodes(): Promise<PromoCode[]> {
        try {
            const { data, error } = await supabase
                .from('promo_codes')
                .select('id, code, bonus_points, description, max_uses, current_uses, expires_at, is_active, created_at')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('프로모션 코드 목록 조회 실패:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('프로모션 코드 목록 조회 중 오류:', error);
            return [];
        }
    },

    /**
     * 프로모션 코드 생성 (관리자용)
     */
    async createPromoCode(promoCode: {
        code: string;
        bonus_points: number;
        description?: string;
        max_uses?: number;
        expires_at?: string;
    }): Promise<{ success: boolean; message: string }> {
        try {
            const { error } = await supabase
                .from('promo_codes')
                .insert([{
                    code: promoCode.code.toUpperCase().trim(),
                    bonus_points: promoCode.bonus_points,
                    description: promoCode.description || null,
                    max_uses: promoCode.max_uses || null,
                    expires_at: promoCode.expires_at || null,
                    is_active: true
                }]);

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    return {
                        success: false,
                        message: '이미 존재하는 프로모션 코드입니다.'
                    };
                }
                console.error('프로모션 코드 생성 실패:', error);
                return {
                    success: false,
                    message: '프로모션 코드 생성에 실패했습니다.'
                };
            }

            return {
                success: true,
                message: '프로모션 코드가 생성되었습니다.'
            };
        } catch (error) {
            console.error('프로모션 코드 생성 중 오류:', error);
            return {
                success: false,
                message: '프로모션 코드 생성 중 오류가 발생했습니다.'
            };
        }
    }
};

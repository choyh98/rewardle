import { supabase } from '../lib/supabase';

export const brandService = {
    async fetchActiveBrands() {
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .eq('is_active', true);

        if (error) throw error;
        return data;
    },

    async createBrand(brandData: any) {
        const { data, error } = await supabase
            .from('brands')
            .insert([brandData])
            .select();

        if (error) throw error;
        return data;
    },

    async fetchBrandById(id: string) {
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }
};

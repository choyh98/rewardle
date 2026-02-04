import { supabase } from '../lib/supabase';

export const brandService = {
    async fetchActiveBrands() {
        const { data, error } = await supabase
            .from('brands')
            .select(`
                id,
                name,
                wordle_answer,
                hint_image,
                place_quiz_question,
                place_quiz_answer,
                place_url,
                apple_game_word,
                shooting_wordle_answer,
                mission_data,
                is_active
            `)
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
            .select(`
                id,
                name,
                wordle_answer,
                hint_image,
                place_quiz_question,
                place_quiz_answer,
                place_url,
                apple_game_word,
                shooting_wordle_answer,
                mission_data
            `)
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }
};

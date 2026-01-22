import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useStorage = () => {
    const { user } = useAuth();

    const getItem = async <T>(key: string, table?: string, select: string = '*'): Promise<T | null> => {
        if (!user) return null;

        if (user.isGuest) {
            const saved = localStorage.getItem(`rewardle_${key}`);
            return saved ? JSON.parse(saved) : null;
        } else if (table) {
            const { data, error } = await supabase
                .from(table)
                .select(select)
                .eq('user_id', user.id);

            if (error) {
                console.error(`Error loading from ${table}:`, error);
                return null;
            }
            return data as unknown as T;
        }
        return null;
    };

    const setItem = async (key: string, value: any, table?: string, payload?: any): Promise<boolean> => {
        if (!user) return false;

        if (user.isGuest) {
            try {
                localStorage.setItem(`rewardle_${key}`, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('LocalStorage error:', e);
                return false;
            }
        } else if (table && payload) {
            try {
                const { error } = await supabase
                    .from(table)
                    .upsert({ user_id: user.id, ...payload });

                if (error) throw error;
                return true;
            } catch (e) {
                console.error(`Supabase upsert error in ${table}:`, e);
                return false;
            }
        }
        return false;
    };

    return { getItem, setItem };
};

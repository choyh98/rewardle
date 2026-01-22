import { supabase } from '../lib/supabase';

export const authService = {
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    async onAuthStateChange(callback: (user: any) => void) {
        return supabase.auth.onAuthStateChange((_event, session) => {
            callback(session?.user ?? null);
        });
    },

    async signOut() {
        return await supabase.auth.signOut();
    },

    async signInWithGoogle() {
        return await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
    }
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        isGuest: false
                    });
                } else {
                    // 게스트 사용자
                    let guestId = localStorage.getItem('rewardle_guest_id');
                    if (!guestId) {
                        guestId = `guest_${Date.now()}`;
                        localStorage.setItem('rewardle_guest_id', guestId);
                    }
                    setUser({
                        id: guestId,
                        isGuest: true
                    });
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                // 폴백: 게스트 사용자
                let guestId = localStorage.getItem('rewardle_guest_id');
                if (!guestId) {
                    guestId = `guest_${Date.now()}`;
                    localStorage.setItem('rewardle_guest_id', guestId);
                }
                setUser({
                    id: guestId,
                    isGuest: true
                });
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

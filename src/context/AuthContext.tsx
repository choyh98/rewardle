import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { pointsService } from '../lib/services';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    migrationStatus: 'idle' | 'migrating' | 'completed' | 'failed';
    migratedPoints: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'completed' | 'failed'>('idle');
    const [migratedPoints, setMigratedPoints] = useState(0);

    // 게스트 포인트 마이그레이션 함수
    const migrateGuestData = async (newUserId: string) => {
        const guestPoints = localStorage.getItem('rewardle_points');
        if (!guestPoints || parseInt(guestPoints) === 0) {
            console.log('마이그레이션할 포인트 없음');
            return;
        }

        setMigrationStatus('migrating');
        console.log('게스트 데이터 마이그레이션 시작...');

        try {
            const result = await pointsService.migrateGuestPoints(newUserId);
            if (result.success) {
                setMigratedPoints(result.migratedPoints);
                setMigrationStatus('completed');
                console.log(`✅ ${result.migratedPoints}P 마이그레이션 완료!`);
                
                // 3초 후 상태 초기화
                setTimeout(() => {
                    setMigrationStatus('idle');
                    setMigratedPoints(0);
                }, 3000);
            } else {
                setMigrationStatus('failed');
            }
        } catch (error) {
            console.error('마이그레이션 실패:', error);
            setMigrationStatus('failed');
        }
    };

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

        // 인증 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const newUser = {
                    id: session.user.id,
                    isGuest: false
                };
                setUser(newUser);

                // 로그인 이벤트일 때만 마이그레이션 실행
                if (event === 'SIGNED_IN') {
                    await migrateGuestData(session.user.id);
                }
            } else {
                // 로그아웃 시 게스트로 전환
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
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, migrationStatus, migratedPoints }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { migrateLocalStorageToSupabase, clearLocalStorageData } from '../lib/dataMigration';
import logoImage from '../assets/logo.png';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    // 이미 로그인되어 있는지 확인
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // 로그인 직후인지 확인 (localStorage에 게스트 데이터가 있는지)
                const hasLocalData = localStorage.getItem('rewardle_points') || 
                                     localStorage.getItem('rewardle_guest_id');
                
                if (hasLocalData) {
                    console.log('🔄 Migrating guest data to Supabase...');
                    const migrated = await migrateLocalStorageToSupabase(session.user.id);
                    if (migrated) {
                        clearLocalStorageData();
                        console.log('✅ Guest data migration completed');
                    }
                }
                
                navigate('/home');
            } else {
                setChecking(false);
            }
        };
        checkUser();
    }, [navigate]);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/home`
                }
            });

            if (error) {
                console.error('Login error:', error);
                alert('로그인에 실패했습니다. 다시 시도해주세요.');
                setLoading(false);
            }
            // 성공 시 Google 로그인 페이지로 리다이렉트됨
        } catch (error) {
            console.error('Login error:', error);
            alert('로그인 중 오류가 발생했습니다.');
            setLoading(false);
        }
    };

    const skipLogin = () => {
        // 게스트 세션 생성 (임시 사용자 ID)
        const guestId = `guest_${Date.now()}`;
        localStorage.setItem('rewardle_guest_id', guestId);
        navigate('/home');
    };

    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#fafafa] p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md flex flex-col items-center"
            >
                {/* Logo Section */}
                <div className="mb-12 text-center">
                    <div className="mb-6 mx-auto flex items-center justify-center">
                        <img 
                            src={logoImage} 
                            alt="리워들 로고" 
                            className="w-90 h-auto object-contain"
                        />
                    </div>
                    <p className="text-gray-500 mt-2 font-medium">광고를 플레이하다, 혜택을 획득하다</p>
                </div>

                {/* Login Button */}
                <div className="w-full space-y-4 mb-8">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className={`w-full h-14 bg-white text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-md border border-gray-100 ring-4 ring-gray-50/50 touch-manipulation ${
                            loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                                <span>로그인 중...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google로 시작하기
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-4 px-2">
                        <div className="h-[1px] flex-1 bg-gray-100"></div>
                        <span className="text-gray-300 text-xs font-medium uppercase tracking-widest">or</span>
                        <div className="h-[1px] flex-1 bg-gray-100"></div>
                    </div>
                </div>

                <button
                    onClick={skipLogin}
                    className="text-gray-400 font-medium hover:text-gray-600 transition-colors touch-manipulation"
                >
                    비회원으로 먼저 둘러보기
                </button>

                <div className="mt-16 text-center">
                    <p className="text-xs text-gray-400">
                        가입 시 리워들의 <span className="underline">이용약관</span> 및 <span className="underline">개인정보처리방침</span>에 동의하게 됩니다.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;

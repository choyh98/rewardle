import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Gift, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePoints } from '../context/PointsContext';
import { supabase } from '../lib/supabase';

const AttendancePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addPoints, totalGamesPlayed } = usePoints();
    
    // 오늘 출석 체크 여부 확인
    const [checked, setChecked] = useState<boolean>(false);
    const [attendanceStreak, setAttendanceStreak] = useState<number>(0);
    const [lastCheckDate, setLastCheckDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [monthlyAttendance, setMonthlyAttendance] = useState<string[]>([]); // 이번 달 출석한 날짜들

    const missionGoal = 3;
    const isMissionComplete = totalGamesPlayed >= missionGoal;

    // 출석 데이터 로드
    useEffect(() => {
        if (!user) return;

        const loadAttendanceData = async () => {
            setIsLoading(true);
            try {
                if (user.isGuest) {
                    // 게스트: localStorage에서 로드
                    const today = new Date().toDateString();
                    const lastCheck = localStorage.getItem('rewardle_last_check');
                    const savedStreak = localStorage.getItem('rewardle_attendance_streak');
                    const savedMonthly = localStorage.getItem('rewardle_monthly_attendance');
                    
                    setChecked(lastCheck === today);
                    setAttendanceStreak(savedStreak ? parseInt(savedStreak) : 0);
                    setLastCheckDate(lastCheck || '');
                    
                    // 이번 달 출석 기록 로드
                    if (savedMonthly) {
                        const monthlyData = JSON.parse(savedMonthly);
                        const currentMonth = new Date().getMonth();
                        const currentYear = new Date().getFullYear();
                        
                        // 이번 달 데이터만 필터링
                        const thisMonthAttendance = monthlyData.filter((dateStr: string) => {
                            const date = new Date(dateStr);
                            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                        });
                        setMonthlyAttendance(thisMonthAttendance);
                    }
                } else {
                    // 로그인 사용자: Supabase에서 로드
                    const today = new Date().toISOString().split('T')[0];
                    const { data, error } = await supabase
                        .from('attendance')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('check_date', today)
                        .maybeSingle();

                    if (error && error.code !== 'PGRST116') {
                        console.error('Failed to load attendance:', error);
                    }

                    if (data) {
                        setChecked(true);
                        setAttendanceStreak(data.streak);
                        setLastCheckDate(data.check_date);
                    } else {
                        // 최근 출석 기록에서 연속 일수 가져오기
                        const { data: lastAttendance } = await supabase
                            .from('attendance')
                            .select('streak, check_date')
                            .eq('user_id', user.id)
                            .order('check_date', { ascending: false })
                            .limit(1)
                            .maybeSingle();

                        if (lastAttendance) {
                            setAttendanceStreak(lastAttendance.streak);
                            setLastCheckDate(lastAttendance.check_date);
                        }
                    }

                    // 이번 달 전체 출석 기록 가져오기
                    const currentYear = new Date().getFullYear();
                    const currentMonth = new Date().getMonth() + 1;
                    const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
                    const lastDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()}`;

                    const { data: monthlyData } = await supabase
                        .from('attendance')
                        .select('check_date')
                        .eq('user_id', user.id)
                        .gte('check_date', firstDayOfMonth)
                        .lte('check_date', lastDayOfMonth);

                    if (monthlyData) {
                        setMonthlyAttendance(monthlyData.map(item => item.check_date));
                    }
                }
            } catch (error) {
                console.error('Failed to load attendance data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAttendanceData();
    }, [user]);

    const handleCheckIn = async () => {
        if (checked || !isMissionComplete || !user) return;
        
        const today = new Date().toDateString();
        const todayISO = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const yesterdayISO = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let newStreak = 1;
        
        if (user.isGuest) {
            // 게스트: localStorage 기반 연속 일수 계산
            if (lastCheckDate === yesterday) {
                newStreak = attendanceStreak + 1;
            } else if (lastCheckDate !== today) {
                newStreak = 1;
            }
        } else {
            // 로그인 사용자: Supabase 기반 연속 일수 계산
            if (lastCheckDate === yesterdayISO) {
                newStreak = attendanceStreak + 1;
            } else {
                newStreak = 1;
            }
        }
        
        setChecked(true);
        setAttendanceStreak(newStreak);
        setLastCheckDate(user.isGuest ? today : todayISO);
        
        // 기본 출석 포인트
        let totalPoints = 2;
        let bonusMessage = '';
        
        // 연속 출석 보너스
        if (newStreak === 3) {
            totalPoints += 1;
            bonusMessage = ' (+3일 연속 1P)';
        } else if (newStreak === 7) {
            totalPoints += 3;
            bonusMessage = ' (+7일 연속 3P)';
        } else if (newStreak === 10) {
            totalPoints += 5;
            bonusMessage = ' (+10일 연속 5P)';
        } else if (newStreak === 30) {
            totalPoints += 20;
            bonusMessage = ' (+한달 채우기 20P)';
        }
        
        // 포인트 지급
        await addPoints(totalPoints, `일일 출석 체크${bonusMessage}`);
        
        // 출석 기록 저장
        if (user.isGuest) {
            // 게스트: localStorage에 저장
            localStorage.setItem('rewardle_attendance_streak', newStreak.toString());
            localStorage.setItem('rewardle_last_check', today);
            
            // 이번 달 출석 기록 업데이트
            const updatedMonthly = [...monthlyAttendance, today];
            setMonthlyAttendance(updatedMonthly);
            localStorage.setItem('rewardle_monthly_attendance', JSON.stringify(updatedMonthly));
        } else {
            // 로그인 사용자: Supabase에 저장
            try {
                // 중복 체크 후 삽입
                const { data: existingRecord } = await supabase
                    .from('attendance')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('check_date', todayISO)
                    .maybeSingle();

                if (!existingRecord) {
                    await supabase.from('attendance').insert({
                        user_id: user.id,
                        check_date: todayISO,
                        streak: newStreak
                    });
                    
                    // 이번 달 출석 기록 업데이트
                    setMonthlyAttendance([...monthlyAttendance, todayISO]);
                }
            } catch (error) {
                console.error('Failed to save attendance to Supabase:', error);
            }
        }
    };


    const today = new Date().getDate();
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate(); // 해당 월의 총 일수

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#fafafa]">
            <header className="flex items-center px-4 py-4 bg-white shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">출석 미션</h1>
            </header>

            <div className="p-6">
                {/* Hero Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 text-center relative overflow-hidden">
                    <div className="absolute top-[-30px] left-[-30px] w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Gift className="text-primary size-10" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">매일매일 출석체크!</h2>
                        <p className="text-gray-400 font-medium mb-4">게임을 3회 플레이하고 출석을 완료하세요</p>
                        
                        {/* 연속 출석 현황 */}
                        {attendanceStreak > 0 && (
                            <div className="bg-primary/10 rounded-2xl px-4 py-3 mb-4">
                                <p className="text-primary font-black text-lg">
                                    🔥 {attendanceStreak}일 연속 출석 중!
                                </p>
                                {attendanceStreak >= 3 && attendanceStreak < 7 && (
                                    <p className="text-xs text-gray-600 mt-1">7일 연속 출석까지 {7 - attendanceStreak}일 남았어요</p>
                                )}
                                {attendanceStreak >= 7 && attendanceStreak < 10 && (
                                    <p className="text-xs text-gray-600 mt-1">10일 연속 출석까지 {10 - attendanceStreak}일 남았어요</p>
                                )}
                                {attendanceStreak >= 10 && attendanceStreak < 30 && (
                                    <p className="text-xs text-gray-600 mt-1">한달 채우기까지 {30 - attendanceStreak}일 남았어요</p>
                                )}
                            </div>
                        )}

                        {/* Mission Progress */}
                        <div className="bg-gray-50 rounded-2xl p-4 mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-gray-600">오늘의 게임 플레이</span>
                                <span className="text-primary font-black">{Math.min(totalGamesPlayed, missionGoal)} / {missionGoal}</span>
                            </div>
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(Math.min(totalGamesPlayed, missionGoal) / missionGoal) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCheckIn}
                            disabled={checked || !isMissionComplete}
                            className={`w-full h-16 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${checked
                                    ? 'bg-gray-100 text-gray-400 shadow-none'
                                    : isMissionComplete
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                                }`}
                        >
                            {checked ? (
                                <>
                                    <CheckCircle2 size={24} /> 출석 완료
                                </>
                            ) : isMissionComplete ? (
                                '오늘의 출석 2P 받기'
                            ) : (
                                '게임을 더 플레이해주세요'
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-gray-800">{currentMonth}월 출석 현황</h3>
                        <span className="text-primary font-bold bg-primary/10 px-3 py-1 rounded-full text-xs">
                            {checked ? '출석 1일차' : '오늘 출석 전'}
                        </span>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const isPast = day < today;
                            const isToday = day === today;
                            const isTodayChecked = isToday && checked;
                            
                            // 해당 날짜가 출석 기록에 있는지 확인
                            const dateStr = user?.isGuest 
                                ? new Date(currentYear, currentMonth - 1, day).toDateString()
                                : `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            
                            const isAttended = monthlyAttendance.includes(dateStr);
                            
                            return (
                                <div
                                    key={day}
                                    className={`aspect-square rounded-xl flex items-center justify-center relative overflow-hidden border-2 transition-all ${
                                        isAttended || isTodayChecked
                                            ? 'bg-primary/10 border-primary shadow-inner'
                                            : isPast
                                            ? 'bg-gray-100 border-gray-200'
                                            : 'bg-gray-50 border-gray-50'
                                    }`}
                                >
                                    <span className={`text-sm font-black ${
                                        isAttended || isTodayChecked ? 'text-primary' : isPast ? 'text-gray-400' : 'text-gray-300'
                                    }`}>
                                        {day}
                                    </span>
                                    {(isAttended || isTodayChecked) && (
                                        <CheckCircle2 className="absolute -bottom-1 -right-1 text-primary size-5 opacity-50" />
                                    )}
                                    {isPast && !isAttended && (
                                        <X className="absolute -bottom-1 -right-1 text-gray-400 size-5 opacity-50" strokeWidth={3} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;

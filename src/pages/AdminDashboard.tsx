import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Store, HelpCircle, Link as LinkIcon, Lock, Image, Sparkles, Map, ExternalLink, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { invalidateBrandsCache } from '../data/brands';
import guideImage from '../assets/guide.png';
import { analyzePlaceWithAI, getNaverSearchUrl } from '../services/aiMissionService';
import type { AIAnalysisResult } from '../types';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // 도보 시간으로부터 자전거 시간 계산 (도보의 40-50%)
    const calculateBicycleTime = (walkingTime: string): string => {
        const minutes = parseInt(walkingTime.replace(/[^0-9]/g, ''));
        if (isNaN(minutes)) return '';
        const bicycleMinutes = Math.round(minutes * 0.45); // 45%
        return `${bicycleMinutes}분`;
    };

    const [newBrand, setNewBrand] = useState({
        name: '',
        wordleAnswer: '',
        appleGameWord: '',
        shootingWordleAnswer: '',
        hintImage: '',
        question: '',
        answer: '',
        placeUrl: '',
        address: '',       // AI 분석용
        category: '',      // 예: 카페, 맛집, 막걸리집
        signatureMenu: '', // 대표 메뉴/상품
        storeDescription: '' // 한 줄 소개, 분위기 (선택)
    });
    const [useNameForWordle, setUseNameForWordle] = useState(false);
    const [useNameForApple, setUseNameForApple] = useState(false);
    const [useNameForShooting, setUseNameForShooting] = useState(false);

    // AI 미션 관련 상태
    const [missionType, setMissionType] = useState<'quiz' | 'walking'>('quiz');
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
    const [selectedKeywordIndex, setSelectedKeywordIndex] = useState<number>(0);
    const [walkingMission, setWalkingMission] = useState({
        seoKeyword: '',
        startPoint: '',
        walkingTime: '',
        bicycleTime: '',
        quizQuestion: '',
        correctAnswer: ''
    });

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'q1234') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('비밀번호가 올바르지 않습니다.');
            setPassword('');
        }
    };

    // AI 분석 실행
    const handleAIAnalyze = async () => {
        if (!newBrand.name) {
            alert('매장명을 먼저 입력해주세요!');
            return;
        }
        if (!newBrand.address?.trim()) {
            alert('주소를 입력해주세요!');
            return;
        }
        if (!newBrand.category?.trim()) {
            alert('카테고리를 입력해주세요!');
            return;
        }

        setIsAILoading(true);
        setAiResult(null);

        try {
            const result = await analyzePlaceWithAI({
                storeName: newBrand.name,
                address: newBrand.address.trim(),
                category: newBrand.category.trim(),
                signatureMenu: newBrand.signatureMenu || undefined,
                storeDescription: newBrand.storeDescription || undefined
            });

            setAiResult(result);
            setSelectedKeywordIndex(0);

            // 첫 번째 키워드를 기본값으로 설정
            const firstKeyword = result.seo_strategy.target_keywords[0];
            const bicycleTime = result.user_mission.bicycle_time || calculateBicycleTime(result.user_mission.correct_answer);
            
            setWalkingMission({
                seoKeyword: firstKeyword,
                startPoint: result.user_mission.start_point,
                walkingTime: result.user_mission.correct_answer,
                bicycleTime: bicycleTime,
                quizQuestion: result.user_mission.quiz_question,
                correctAnswer: result.user_mission.correct_answer
            });
        } catch (error: any) {
            console.error('AI 분석 실패:', error);
            
            // 상세한 에러 메시지 제공
            let errorMessage = 'AI 분석에 실패했습니다.';
            
            if (error.message.includes('API Error')) {
                errorMessage += '\n\n🔑 Gemini API 키 문제가 발생했습니다.';
                errorMessage += '\n\n해결 방법:';
                errorMessage += '\n1. Google AI Studio에서 새 API 키 발급';
                errorMessage += '\n2. .env 파일에 VITE_GEMINI_API_KEY 업데이트';
                errorMessage += '\n3. 개발 서버 재시작 (npm run dev)';
                errorMessage += '\n\n📖 자세한 가이드: GEMINI_API_GUIDE.md 참고';
            } else if (error.message.includes('파싱 실패')) {
                errorMessage += '\n\nAI 응답 형식이 올바르지 않습니다.';
                errorMessage += '\n잠시 후 다시 시도해주세요.';
            } else if (error.message.includes('매장 정보')) {
                errorMessage += '\n\n매장 정보를 찾을 수 없습니다.';
                errorMessage += '\n주소를 더 자세히 입력해보세요.';
            } else {
                errorMessage += `\n\n오류: ${error.message}`;
            }
            
            alert(errorMessage);
        } finally {
            setIsAILoading(false);
        }
    };

    // 키워드 선택
    const handleSelectKeyword = (index: number) => {
        if (!aiResult) return;
        setSelectedKeywordIndex(index);
        setWalkingMission({
            ...walkingMission,
            seoKeyword: aiResult.seo_strategy.target_keywords[index]
        });
    };

    const handleSave = async () => {
        // 유효성 검사
        if (newBrand.wordleAnswer.length < 3) {
            alert('워들 정답은 최소 3글자 이상이어야 합니다.');
            return;
        }
        if (newBrand.appleGameWord.length < 3) {
            alert('사과 게임 단어는 최소 3글자 이상이어야 합니다.');
            return;
        }
        if (newBrand.shootingWordleAnswer.length < 3) {
            alert('슈팅워들 정답은 최소 3글자 이상이어야 합니다.');
            return;
        }
        if (!newBrand.name) {
            alert('매장명은 필수입니다.');
            return;
        }

        // 미션 타입별 유효성 검사
        if (missionType === 'quiz') {
            if (!newBrand.question || !newBrand.answer) {
                alert('퀴즈 미션의 질문과 정답을 입력해주세요.');
                return;
            }
            if (!newBrand.placeUrl) {
                alert('퀴즈 미션은 플레이스 URL이 필수입니다.');
                return;
            }
        }
        if (missionType === 'walking') {
            if (!walkingMission.seoKeyword || !walkingMission.startPoint) {
                alert('길찾기 미션 정보가 부족합니다. AI 분석을 먼저 실행해주세요.');
                return;
            }
        }

        try {
            // 워들 정답을 배열로 변환 (각 글자를 분리)
            const wordleAnswerArray = newBrand.wordleAnswer.split('');

            // mission_data 구성
            let missionData: any = {
                type: missionType,
                bonusPoints: 5
            };

            if (missionType === 'quiz') {
                missionData.quiz = {
                    question: newBrand.question,
                    answer: newBrand.answer,
                    bonusPoints: 5
                };
            } else if (missionType === 'walking') {
                missionData.walking = {
                    seoKeyword: walkingMission.seoKeyword,
                    startPoint: walkingMission.startPoint,
                    walkingTime: walkingMission.walkingTime,
                    bicycleTime: walkingMission.bicycleTime,
                    quizQuestion: walkingMission.quizQuestion,
                    correctAnswer: walkingMission.correctAnswer,
                    storeAddress: aiResult?.actual_address || newBrand.address
                };
            }

            // Supabase에 데이터 저장
            const { data, error } = await supabase
                .from('brands')
                .insert([
                    {
                        name: newBrand.name,
                        wordle_answer: wordleAnswerArray,
                        apple_game_word: newBrand.appleGameWord,
                        shooting_wordle_answer: newBrand.shootingWordleAnswer,
                        hint_image: newBrand.hintImage || null,
                        place_quiz_question: newBrand.question || null, // 레거시 호환
                        place_quiz_answer: newBrand.answer || null, // 레거시 호환
                        place_url: newBrand.placeUrl,
                        mission_type: missionType,
                        mission_data: missionData,
                        is_active: true
                    }
                ])
                .select();

            if (error) {
                console.error('Supabase insert error:', error);
                alert(`퀴즈 등록에 실패했습니다.\n오류: ${error.message}`);
                return;
            }

            console.log('Successfully inserted brand:', data);

            // 캐시 무효화
            invalidateBrandsCache();

            alert('새로운 퀴즈가 성공적으로 등록되었습니다!\n이제 사용자들이 이 매장의 게임을 플레이할 수 있습니다.');

            // 폼 초기화
            setNewBrand({
                name: '',
                wordleAnswer: '',
                appleGameWord: '',
                shootingWordleAnswer: '',
                hintImage: '',
                question: '',
                answer: '',
                placeUrl: '',
                address: ''
            });
            setAiResult(null);
            setWalkingMission({
                seoKeyword: '',
                startPoint: '',
                walkingTime: '',
                bicycleTime: '',
                quizQuestion: '',
                correctAnswer: ''
            });
        } catch (error) {
            console.error('Failed to save brand:', error);
            alert('퀴즈 등록 중 오류가 발생했습니다.\n다시 시도해주세요.');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
            <header className="flex items-center px-4 py-4 bg-white shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">사장님 관리 센터</h1>
            </header>

            <div className="p-6">
                {!isAuthenticated ? (
                    /* 비밀번호 입력 화면 */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center min-h-[60vh]"
                    >
                        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Lock className="text-primary size-10" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-800 mb-2">관리자 인증</h2>
                                <p className="text-gray-500 text-center font-medium">
                                    퀴즈를 등록하려면<br />관리자 비밀번호를 입력하세요
                                </p>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="password"
                                        placeholder="비밀번호 입력"
                                        className={`w-full h-14 bg-gray-50 border-2 rounded-2xl px-5 focus:bg-white focus:border-primary focus:outline-none transition-all font-medium text-center text-lg ${
                                            error ? 'border-red-300 bg-red-50' : 'border-transparent'
                                        }`}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError('');
                                        }}
                                        autoFocus
                                    />
                                    {error && (
                                        <p className="text-red-500 text-sm font-bold mt-2 text-center">
                                            {error}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-14 bg-primary text-white font-black text-lg rounded-2xl shadow-lg active:scale-95 transition-transform touch-manipulation"
                                >
                                    확인
                                </button>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    /* 퀴즈 등록 폼 */
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-black text-gray-800">새 퀴즈 등록</h2>
                            <p className="text-gray-500 text-sm mt-2">매장 정보를 입력하여 새로운 퀴즈를 만드세요</p>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2 flex items-center gap-2">
                                <Store size={16} className="text-primary" /> 매장명
                            </label>
                            <input
                                type="text"
                                placeholder="예: 가나다카페"
                                className="w-full h-14 bg-gray-50 border-transparent rounded-2xl px-5 focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
                                value={newBrand.name}
                                onChange={e => {
                                    const name = e.target.value;
                                    setNewBrand({ 
                                        ...newBrand, 
                                        name,
                                        wordleAnswer: useNameForWordle ? name : newBrand.wordleAnswer,
                                        appleGameWord: useNameForApple ? name : newBrand.appleGameWord,
                                        shootingWordleAnswer: useNameForShooting ? name : newBrand.shootingWordleAnswer
                                    });
                                }}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                                    <HelpCircle size={16} className="text-primary" /> 워들 정답 (글자 단위)
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useNameForWordle}
                                        onChange={(e) => {
                                            setUseNameForWordle(e.target.checked);
                                            if (e.target.checked) {
                                                setNewBrand({ ...newBrand, wordleAnswer: newBrand.name });
                                            }
                                        }}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <span className="text-xs text-gray-600 font-medium">매장명과 동일</span>
                                </label>
                            </div>
                            <input
                                type="text"
                                placeholder="예: 가나다카페"
                                className="w-full h-14 bg-gray-50 border-transparent rounded-2xl px-5 focus:bg-white focus:border-primary focus:outline-none transition-all font-medium disabled:opacity-50"
                                value={newBrand.wordleAnswer}
                                onChange={e => setNewBrand({ ...newBrand, wordleAnswer: e.target.value })}
                                disabled={useNameForWordle}
                                minLength={3}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                띄어쓰기 없이 입력하세요 (최소 3글자) • <span className="text-primary font-bold">5글자를 추천드려요</span>
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                                    사과 게임 단어
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useNameForApple}
                                        onChange={(e) => {
                                            setUseNameForApple(e.target.checked);
                                            if (e.target.checked) {
                                                setNewBrand({ ...newBrand, appleGameWord: newBrand.name });
                                            }
                                        }}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <span className="text-xs text-gray-600 font-medium">매장명과 동일</span>
                                </label>
                            </div>
                            <input
                                type="text"
                                placeholder="예: 가나다카페"
                                className="w-full h-14 bg-gray-50 border-transparent rounded-2xl px-5 focus:bg-white focus:border-primary focus:outline-none transition-all font-medium disabled:opacity-50"
                                value={newBrand.appleGameWord}
                                onChange={e => setNewBrand({ ...newBrand, appleGameWord: e.target.value })}
                                disabled={useNameForApple}
                                minLength={3}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                사과 게임에서 모을 글자를 입력하세요 (최소 3글자) • <span className="text-primary font-bold">5글자를 추천드려요</span>
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                                    슈팅워들 정답
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useNameForShooting}
                                        onChange={(e) => {
                                            setUseNameForShooting(e.target.checked);
                                            if (e.target.checked) {
                                                setNewBrand({ ...newBrand, shootingWordleAnswer: newBrand.name });
                                            }
                                        }}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <span className="text-xs text-gray-600 font-medium">매장명과 동일</span>
                                </label>
                            </div>
                            <input
                                type="text"
                                placeholder="예: 가나다카페"
                                className="w-full h-14 bg-gray-50 border-transparent rounded-2xl px-5 focus:bg-white focus:border-primary focus:outline-none transition-all font-medium disabled:opacity-50"
                                value={newBrand.shootingWordleAnswer}
                                onChange={e => setNewBrand({ ...newBrand, shootingWordleAnswer: e.target.value })}
                                disabled={useNameForShooting}
                                minLength={3}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                슈팅워들에서 맞출 단어를 입력하세요 (최소 3글자) • <span className="text-primary font-bold">5글자를 추천드려요</span>
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2 flex items-center gap-2">
                                <Image size={16} className="text-gray-400" /> 워들 게임 힌트 이미지 <span className="text-gray-400 font-normal text-xs">(선택사항)</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full h-14 bg-gray-50 border-transparent rounded-2xl px-5 focus:bg-white focus:border-primary focus:outline-none transition-all font-medium flex items-center"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        // 이미지를 base64로 변환하여 저장
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setNewBrand({ ...newBrand, hintImage: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                워들 힌트는 <span className="text-primary font-bold">정답 초성</span>으로 표시됩니다 • 사진은 선택사항입니다
                            </p>
                            {newBrand.hintImage && (
                                <div className="mt-3 flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                                    <img 
                                        src={newBrand.hintImage} 
                                        alt="힌트 미리보기" 
                                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-700">이미지 업로드 완료</p>
                                        <p className="text-xs text-gray-400">추가로 이미지도 표시됩니다 (선택)</p>
                                    </div>
                                    <button
                                        onClick={() => setNewBrand({ ...newBrand, hintImage: '' })}
                                        className="text-red-500 hover:text-red-600 font-bold text-sm"
                                    >
                                        삭제
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-sm font-black text-gray-700 mb-3">추가 미션 설정</label>
                            
                            {/* 미션 타입 선택 */}
                            <div className="flex gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setMissionType('quiz')}
                                    className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all ${
                                        missionType === 'quiz'
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    💬 퀴즈 미션
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMissionType('walking')}
                                    className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                        missionType === 'walking'
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <Map size={16} /> 길찾기 미션 (AI)
                                </button>
                            </div>

                            {/* 퀴즈 미션 폼 */}
                            {missionType === 'quiz' && (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="질문: 예) 이 매장의 아메리카노 가격은?"
                                        className="w-full h-14 bg-gray-50 border-transparent rounded-2xl px-5 focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
                                        value={newBrand.question}
                                        onChange={e => setNewBrand({ ...newBrand, question: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="정답: 예) 4500"
                                        className="w-full h-14 bg-gray-50 border-transparent rounded-2xl px-5 focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
                                        value={newBrand.answer}
                                        onChange={e => setNewBrand({ ...newBrand, answer: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* 길찾기 미션 폼 (AI 기반) */}
                            {missionType === 'walking' && (
                                <div className="space-y-4">
                                    {/* 주소 입력 (필수) */}
                                    <input
                                        type="text"
                                        placeholder="주소 (필수): 예) 서울 강남구 역삼동 123"
                                        className="w-full h-14 bg-gray-50 border-transparent rounded-2xl px-5 focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
                                        value={newBrand.address}
                                        onChange={e => setNewBrand({ ...newBrand, address: e.target.value })}
                                    />
                                    {/* 카테고리 (필수) */}
                                    <input
                                        type="text"
                                        placeholder="카테고리 (필수): 예) 카페, 맛집, 막걸리집, 베이커리"
                                        className="w-full h-12 bg-gray-50 border-transparent rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-primary focus:outline-none transition-all"
                                        value={newBrand.category}
                                        onChange={e => setNewBrand({ ...newBrand, category: e.target.value })}
                                    />
                                    {/* 대표 메뉴/상품 (선택) */}
                                    <input
                                        type="text"
                                        placeholder="대표 메뉴·상품 (선택): 예) 물회, 아메리카노, 수제버터바"
                                        className="w-full h-12 bg-gray-50 border-transparent rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-primary focus:outline-none transition-all"
                                        value={newBrand.signatureMenu}
                                        onChange={e => setNewBrand({ ...newBrand, signatureMenu: e.target.value })}
                                    />
                                    {/* 한 줄 소개 (선택) */}
                                    <input
                                        type="text"
                                        placeholder="한 줄 소개 (선택): 예) 강남역 인근 프렌치 감성 카페"
                                        className="w-full h-12 bg-gray-50 border-transparent rounded-xl px-4 text-sm font-medium focus:bg-white focus:border-primary focus:outline-none transition-all"
                                        value={newBrand.storeDescription}
                                        onChange={e => setNewBrand({ ...newBrand, storeDescription: e.target.value })}
                                    />

                                    {/* AI 분석 버튼 */}
                                    <button
                                        type="button"
                                        onClick={handleAIAnalyze}
                                        disabled={isAILoading || !newBrand.name || !newBrand.address?.trim() || !newBrand.category?.trim()}
                                        className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isAILoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                AI 분석 중...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={20} /> AI로 길찾기 미션 생성하기
                                            </>
                                        )}
                                    </button>

                                    {/* AI 분석 결과 */}
                                    {aiResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 space-y-4"
                                        >
                                            {/* 매장 분석 */}
                                            <div>
                                                <h4 className="text-sm font-black text-gray-800 mb-2 flex items-center gap-2">
                                                    <Sparkles size={14} className="text-purple-500" /> AI 매장 분석
                                                </h4>
                                                <p className="text-xs text-gray-600 leading-relaxed">
                                                    {aiResult.store_analysis.summary}
                                                </p>
                                            </div>

                                            {/* 키워드 후보 선택 */}
                                            <div>
                                                <h4 className="text-sm font-black text-gray-800 mb-2">
                                                    SEO 키워드 후보 (지도 노출 보장)
                                                </h4>
                                                <div className="space-y-2">
                                                    {aiResult.seo_strategy.target_keywords.map((keyword, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                                                selectedKeywordIndex === idx
                                                                    ? 'bg-white border-purple-400 shadow-sm'
                                                                    : 'bg-white/50 border-transparent hover:border-purple-200'
                                                            }`}
                                                            onClick={() => handleSelectKeyword(idx)}
                                                        >
                                                            <div className="flex items-center gap-2 flex-1">
                                                                {selectedKeywordIndex === idx && (
                                                                    <CheckCircle2 size={16} className="text-purple-500" />
                                                                )}
                                                                <span className="text-sm font-bold text-gray-800">{keyword}</span>
                                                            </div>
                                                            <a
                                                                href={getNaverSearchUrl(keyword)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="text-xs text-purple-500 hover:text-purple-600 font-bold flex items-center gap-1"
                                                            >
                                                                네이버 확인 <ExternalLink size={12} />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 출발지 & 도보/자전거 시간 입력 */}
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-700 mb-1 block">출발지</label>
                                                    <input
                                                        type="text"
                                                        value={walkingMission.startPoint}
                                                        onChange={(e) => setWalkingMission({ ...walkingMission, startPoint: e.target.value })}
                                                        placeholder="예: 한성대입구역 6번출구"
                                                        className="w-full h-12 bg-white border-2 border-purple-200 rounded-xl px-4 text-sm font-semibold focus:border-purple-400 focus:outline-none"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-700 mb-1 block">도보 시간</label>
                                                        <input
                                                            type="text"
                                                            value={walkingMission.walkingTime}
                                                            onChange={(e) => setWalkingMission({ ...walkingMission, walkingTime: e.target.value })}
                                                            placeholder="예: 8분"
                                                            className="w-full h-12 bg-white border-2 border-purple-200 rounded-xl px-4 text-sm font-semibold focus:border-purple-400 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-700 mb-1 block">자전거 시간</label>
                                                        <input
                                                            type="text"
                                                            value={walkingMission.bicycleTime}
                                                            onChange={(e) => setWalkingMission({ ...walkingMission, bicycleTime: e.target.value })}
                                                            placeholder="예: 4분"
                                                            className="w-full h-12 bg-white border-2 border-purple-200 rounded-xl px-4 text-sm font-semibold focus:border-purple-400 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {/* 도보 시간 확인 버튼 */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const naverMapUrl = `https://map.naver.com/p/directions/-/${encodeURIComponent(newBrand.name)}/walk?c=15,0,0,0,dh`;
                                                        window.open(naverMapUrl, '_blank');
                                                    }}
                                                    className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                                                >
                                                    <Map size={16} />
                                                    네이버 지도에서 도보 시간 확인하기
                                                    <ExternalLink size={14} />
                                                </button>
                                            </div>

                                            {/* AI 근거는 숨김 (내부적으로만 사용) */}
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 플레이스 URL - 퀴즈 미션일 때만 표시 */}
                        {missionType === 'quiz' && (
                            <div>
                                <label className="block text-sm font-black text-gray-700 mb-2 flex items-center gap-2">
                                    <LinkIcon size={16} className="text-primary" /> 플레이스 URL
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://m.place.naver.com/..."
                                    className="w-full h-14 bg-gray-50 border-transparent rounded-2xl px-5 focus:bg-white focus:border-primary focus:outline-none transition-all font-medium text-sm"
                                    value={newBrand.placeUrl}
                                    onChange={e => setNewBrand({ ...newBrand, placeUrl: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-2 font-medium">
                                    네이버지도 <span className="text-primary font-bold">"공유하기"</span> 링크로 복붙해 주세요
                                </p>
                                
                                {/* 가이드 이미지 */}
                                <div className="mt-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <p className="text-xs font-bold text-gray-700 mb-2">가이드</p>
                                    <img 
                                        src={guideImage} 
                                        alt="플레이스 URL 복사 가이드" 
                                        className="w-full rounded-lg border border-gray-300"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSave}
                            className="w-full h-16 bg-primary text-white font-black text-lg rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform mt-4 touch-manipulation"
                        >
                            <Save size={24} /> 퀴즈 등록하기
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

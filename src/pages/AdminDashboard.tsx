import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Store, HelpCircle, Link as LinkIcon, Lock, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { invalidateBrandsCache } from '../data/brands';
import guideImage from '../assets/guide.png';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [newBrand, setNewBrand] = useState({
        name: '',
        wordleAnswer: '',
        appleGameWord: '',
        shootingWordleAnswer: '',
        hintImage: '',
        question: '',
        answer: '',
        placeUrl: ''
    });
    const [useNameForWordle, setUseNameForWordle] = useState(false);
    const [useNameForApple, setUseNameForApple] = useState(false);
    const [useNameForShooting, setUseNameForShooting] = useState(false);

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
        if (!newBrand.name || !newBrand.question || !newBrand.answer || !newBrand.placeUrl) {
            alert('모든 필수 항목을 입력해주세요.\n(사진은 선택사항입니다)');
            return;
        }

        try {
            // 워들 정답을 배열로 변환 (각 글자를 분리)
            const wordleAnswerArray = newBrand.wordleAnswer.split('');

            // Supabase에 데이터 저장
            const { data, error } = await supabase
                .from('brands')
                .insert([
                    {
                        name: newBrand.name,
                        wordle_answer: wordleAnswerArray,
                        apple_game_word: newBrand.appleGameWord,
                        shooting_wordle_answer: newBrand.shootingWordleAnswer,
                        hint_image: newBrand.hintImage || null, // 사진 선택사항으로
                        place_quiz_question: newBrand.question,
                        place_quiz_answer: newBrand.answer,
                        place_url: newBrand.placeUrl,
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

            alert('✅ 새로운 퀴즈가 성공적으로 등록되었습니다!\n이제 사용자들이 이 매장의 게임을 플레이할 수 있습니다.');

            // 폼 초기화
            setNewBrand({
                name: '',
                wordleAnswer: '',
                appleGameWord: '',
                shootingWordleAnswer: '',
                hintImage: '',
                question: '',
                answer: '',
                placeUrl: ''
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
                                    🍎 사과 게임 단어
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
                                    🎯 슈팅워들 정답
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
                            <label className="block text-sm font-black text-gray-700 mb-2">추가 미션 (플레이스 퀴즈)</label>
                            <input
                                type="text"
                                placeholder="질문: 예) 이 매장의 아메리카노 가격은?"
                                className="w-full h-14 bg-gray-50 border-transparent rounded-2xl px-5 mb-3 focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
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
                                📍 네이버지도 <span className="text-primary font-bold">"공유하기"</span> 링크로 복붙해 주세요
                            </p>
                            
                            {/* 가이드 이미지 */}
                            <div className="mt-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <p className="text-xs font-bold text-gray-700 mb-2">📖 가이드</p>
                                <img 
                                    src={guideImage} 
                                    alt="플레이스 URL 복사 가이드" 
                                    className="w-full rounded-lg border border-gray-300"
                                />
                            </div>
                        </div>

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

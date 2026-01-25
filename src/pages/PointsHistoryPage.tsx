import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Gift } from 'lucide-react';
import { usePoints } from '../context/PointsContext';
import { useAuth } from '../context/AuthContext';
import { createExchange } from '../services/exchangeService';

const PointsHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { points, history } = usePoints();
    const { user } = useAuth();
    const [showExchangeModal, setShowExchangeModal] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-[#fafafa]">
            <header className="flex items-center px-4 py-4 bg-white shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">포인트 내역</h1>
            </header>

            <div className="p-6">
                {/* Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary rounded-3xl p-8 text-white shadow-lg mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <p className="text-white/80 font-bold mb-1">나의 총 포인트</p>
                    <div className="flex items-end gap-2 mb-6">
                        <span className="text-5xl font-black">{points.toLocaleString()}</span>
                        <span className="text-2xl font-bold mb-1.5">P</span>
                    </div>
                    
                    {/* 포인트 교환하기 버튼 */}
                    <button
                        onClick={() => setShowExchangeModal(true)}
                        className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Gift className="size-5" />
                        <span>포인트 교환하기</span>
                    </button>
                </motion.div>

                {/* History List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-black text-gray-800 mb-4">최근 적립 내역</h3>
                    {history.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <Award className="text-primary size-7" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{item.reason}</p>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {new Date(item.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <span className="text-primary font-black text-lg">+{item.amount}P</span>
                        </motion.div>
                    ))}

                    {history.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-400 font-bold">적립 내역이 없습니다.</p>
                            <p className="text-gray-400 text-sm mt-1">게임을 플레이하고 포인트를 쌓아보세요!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 포인트 교환 모달 */}
            {showExchangeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setShowExchangeModal(false)}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Gift className="text-primary size-10" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 mb-2">포인트 교환하기</h2>
                            <p className="text-gray-500 text-sm">보유 포인트: <span className="text-primary font-bold">{points.toLocaleString()}P</span></p>
                        </div>

                        {/* 이름 및 전화번호 입력 */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">이름</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="이름을 입력하세요"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">전화번호</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="010-0000-0000"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* 온누리상품권 안내 */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-blue-800 font-medium text-center">
                                디지털 온누리에서 확인 하실 수 있습니다
                            </p>
                        </div>

                        {/* 교환 옵션 */}
                        <div className="space-y-3 mb-6">
                            <ExchangeOption 
                                title="온누리상품권 1,000원" 
                                points={1000} 
                                userPoints={points}
                                name={name}
                                phone={phone}
                                user={user}
                                isSubmitting={isSubmitting}
                                setIsSubmitting={setIsSubmitting}
                                onSuccess={() => {
                                    setShowExchangeModal(false);
                                    setName('');
                                    setPhone('');
                                }}
                            />
                            <ExchangeOption 
                                title="온누리상품권 2,000원" 
                                points={2000} 
                                userPoints={points}
                                name={name}
                                phone={phone}
                                user={user}
                                isSubmitting={isSubmitting}
                                setIsSubmitting={setIsSubmitting}
                                onSuccess={() => {
                                    setShowExchangeModal(false);
                                    setName('');
                                    setPhone('');
                                }}
                            />
                            <ExchangeOption 
                                title="온누리상품권 6,000원" 
                                points={6000} 
                                userPoints={points}
                                name={name}
                                phone={phone}
                                user={user}
                                isSubmitting={isSubmitting}
                                setIsSubmitting={setIsSubmitting}
                                onSuccess={() => {
                                    setShowExchangeModal(false);
                                    setName('');
                                    setPhone('');
                                }}
                            />
                            <ExchangeOption 
                                title="온누리상품권 10,000원" 
                                points={10000} 
                                userPoints={points}
                                name={name}
                                phone={phone}
                                user={user}
                                isSubmitting={isSubmitting}
                                setIsSubmitting={setIsSubmitting}
                                onSuccess={() => {
                                    setShowExchangeModal(false);
                                    setName('');
                                    setPhone('');
                                }}
                            />
                            <ExchangeOption 
                                title="온누리상품권 20,000원" 
                                points={20000} 
                                userPoints={points}
                                name={name}
                                phone={phone}
                                user={user}
                                isSubmitting={isSubmitting}
                                setIsSubmitting={setIsSubmitting}
                                onSuccess={() => {
                                    setShowExchangeModal(false);
                                    setName('');
                                    setPhone('');
                                }}
                            />
                        </div>

                        <button
                            onClick={() => setShowExchangeModal(false)}
                            className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors"
                        >
                            닫기
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// 교환 옵션 컴포넌트
const ExchangeOption: React.FC<{ 
    title: string; 
    points: number; 
    userPoints: number;
    name: string;
    phone: string;
    user: any;
    isSubmitting: boolean;
    setIsSubmitting: (value: boolean) => void;
    onSuccess: () => void;
}> = ({ title, points, userPoints, name, phone, user, isSubmitting, setIsSubmitting, onSuccess }) => {
    const canExchange = userPoints >= points;
    
    const handleExchange = async () => {
        if (!name.trim()) {
            alert('이름을 입력해주세요.');
            return;
        }
        if (!phone.trim()) {
            alert('전화번호를 입력해주세요.');
            return;
        }
        if (!canExchange) {
            alert('포인트가 부족합니다.');
            return;
        }
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!confirm(`${title}을(를) 교환하시겠습니까?\n차감 포인트: ${points}P`)) {
            return;
        }

        setIsSubmitting(true);
        try {
            await createExchange(user.id, name, phone, title, points);
            alert(`${title} 교환 신청이 완료되었습니다!\n\n이름: ${name}\n전화번호: ${phone}\n\n관리자 확인 후 디지털 온누리에서 확인하실 수 있습니다.`);
            onSuccess();
        } catch (error: any) {
            console.error('Failed to create exchange:', error);
            alert(`교환 신청에 실패했습니다.\n${error?.message || '다시 시도해주세요.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <button
            onClick={handleExchange}
            disabled={!canExchange || isSubmitting}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                canExchange && !isSubmitting
                    ? 'border-primary/20 bg-white hover:border-primary hover:bg-primary/5 active:scale-95' 
                    : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
                    <p className="text-primary font-bold text-sm">{points.toLocaleString()}P</p>
                </div>
                {isSubmitting ? (
                    <span className="text-gray-400 font-bold text-sm">처리 중...</span>
                ) : canExchange ? (
                    <span className="text-primary font-bold text-sm">교환 가능</span>
                ) : (
                    <span className="text-gray-400 font-bold text-sm">포인트 부족</span>
                )}
            </div>
        </button>
    );
};

export default PointsHistoryPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award } from 'lucide-react';
import { usePoints } from '../context/PointsContext';

const PointsHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { points, history } = usePoints();

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
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-black">{points.toLocaleString()}</span>
                        <span className="text-2xl font-bold mb-1.5">P</span>
                    </div>
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
        </div>
    );
};

export default PointsHistoryPage;

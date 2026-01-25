import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const MigrationToast = () => {
    const { migrationStatus, migratedPoints } = useAuth();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (migrationStatus === 'completed' && migratedPoints > 0) {
            setShow(true);
            const timer = setTimeout(() => setShow(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [migrationStatus, migratedPoints]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                        <span className="text-2xl">🎉</span>
                        <div>
                            <p className="font-bold text-lg">포인트 이전 완료!</p>
                            <p className="text-sm opacity-90">
                                게스트 모드의 {migratedPoints}P가 계정에 추가되었습니다
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

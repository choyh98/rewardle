import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PointsProvider } from './context/PointsContext';

// 즉시 로드되어야 하는 페이지 (초기 화면)
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';

// Lazy loading으로 분리할 페이지들
const GamePage = lazy(() => import('./pages/GamePage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const PointsHistoryPage = lazy(() => import('./pages/PointsHistoryPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// 로딩 컴포넌트
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-primary/10 to-primary/5">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
    <p className="text-primary font-bold text-lg">로딩 중...</p>
  </div>
);

function App() {
  return (
    <PointsProvider>
      <Router>
        <div className="max-w-[500px] mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/home" element={<LandingPage />} />
              <Route path="/game/:type" element={<GamePage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/points-history" element={<PointsHistoryPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </PointsProvider>
  );
}



export default App;

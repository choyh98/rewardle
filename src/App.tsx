import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import GamePage from './pages/GamePage';
import AttendancePage from './pages/AttendancePage';
import PointsHistoryPage from './pages/PointsHistoryPage';
import AdminDashboard from './pages/AdminDashboard';
import { PointsProvider } from './context/PointsContext';

function App() {
  return (
    <PointsProvider>
      <Router>
        <div className="max-w-[500px] mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden">
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
        </div>
      </Router>
    </PointsProvider>
  );
}



export default App;

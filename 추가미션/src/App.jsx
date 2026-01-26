import React, { useState } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import UserMission from './pages/UserMission';
import { Settings, User as UserIcon, Bell } from 'lucide-react';

function App() {
  const [view, setView] = useState('admin'); // 'admin' or 'user'
  const [activeMission, setActiveMission] = useState(null);

  const handleMissionCreated = (data) => {
    setActiveMission(data);
    setView('user');
  };

  const handleMissionComplete = () => {
    setActiveMission(null);
    setView('admin');
  };

  return (
    <div className="app-container">
      {/* Fake Status Bar */}
      <div className="status-bar">
        <span>9:41</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Bell size={16} />
          <Settings size={16} />
          <UserIcon size={16} />
        </div>
      </div>

      <main style={{ minHeight: 'calc(100vh - 44px)' }}>
        {view === 'admin' ? (
          <AdminDashboard onMissionCreated={handleMissionCreated} />
        ) : (
          <UserMission
            missionData={activeMission}
            onComplete={handleMissionComplete}
          />
        )}
      </main>

      {/* View Switcher (For Prototype Purposes) */}
      <div style={{
        position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)', color: 'white', padding: '8px 16px', borderRadius: '20px',
        fontSize: '12px', display: 'flex', gap: '12px', zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}>
        <span
          style={{ opacity: view === 'admin' ? 1 : 0.5, cursor: 'pointer', fontWeight: view === 'admin' ? '700' : '400' }}
          onClick={() => setView('admin')}
        >
          Admin
        </span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span
          style={{ opacity: view === 'user' ? 1 : 0.5, cursor: 'pointer', fontWeight: view === 'user' ? '700' : '400' }}
          onClick={() => setView('user')}
        >
          User View
        </span>
      </div>
    </div>
  );
}

export default App;

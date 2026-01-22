import React from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="max-w-[500px] mx-auto min-h-screen bg-white shadow-xl relative overflow-hidden flex flex-col">
            {children}
        </div>
    );
};

export default MainLayout;

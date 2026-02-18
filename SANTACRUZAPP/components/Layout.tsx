
import React from 'react';
import { COLORS } from '../constants';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <header 
        className="sticky top-0 z-40 px-6 py-5 flex items-center justify-between shadow-md"
        style={{ backgroundColor: COLORS.PRIMARY }}
      >
        <h1 className="text-white text-xl font-bold tracking-tight">{title}</h1>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
           <span className="text-white text-[10px] font-black">SC</span>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;

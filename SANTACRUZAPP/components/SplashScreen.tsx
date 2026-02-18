
import React, { useEffect, useState } from 'react';
import { COLORS } from '../constants';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in
    setOpacity(1);
    
    // Timer to start fade out and transition
    const timer = setTimeout(() => {
      setOpacity(0);
      setTimeout(onComplete, 500); // Wait for fade out
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out"
      style={{ backgroundColor: COLORS.PRIMARY, opacity }}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Logo Placeholder - White Box representing the logo */}
        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
           <span style={{ color: COLORS.PRIMARY }} className="font-bold text-3xl">SC</span>
        </div>
        
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold tracking-tight">Santa Cruz</h1>
          <p className="text-white/80 text-sm mt-1 uppercase tracking-widest font-medium">Centro Universitário</p>
        </div>
      </div>
      
      <div className="absolute bottom-12">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default SplashScreen;

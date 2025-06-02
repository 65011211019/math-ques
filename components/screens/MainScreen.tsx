import React from 'react';
import Button from '../ui/Button';

interface MainScreenProps {
  onStartGame: () => void;
  onShowTutorial: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ onStartGame, onShowTutorial }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-80px)] text-center p-4 sm:p-8 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-lg relative overflow-hidden"
      style={{animation: 'gradientBG 15s ease infinite'}}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
      
      <style>
        {`
          @keyframes gradientBG {
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
          }
        `}
      </style>

      <div className="z-10 flex flex-col items-center">
        <div className="p-3 mb-3 sm:mb-4 bg-white/20 rounded-full shadow-2xl">
            <span className="text-5xl sm:text-6xl md:text-7xl">📜</span> 
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 sm:mb-3" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.4)'}}>Math Quest</h1>
        <p className="text-lg sm:text-xl md:text-2xl text-yellow-300 mb-6 sm:mb-10" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.4)'}}>ดินแดนตัวเลขเวทมนตร์</p>
        
        <div className="space-y-3 sm:space-y-4 w-full max-w-xs sm:max-w-sm">
          <Button onClick={onStartGame} variant="primary" size="lg" className="w-full !font-bold" icon="🚀">
            เริ่มการผจญภัย
          </Button>
          <Button onClick={onShowTutorial} variant="secondary" size="lg" className="w-full !text-indigo-700 !bg-yellow-300 hover:!bg-yellow-400" icon="📖">
            วิธีเล่น
          </Button>
        </div>
        <p className="text-xs sm:text-sm text-indigo-200 mt-8 sm:mt-12">การเดินทางสู่โลกคณิตศาสตร์กำลังรอคุณอยู่!</p>
      </div>
    </div>
  );
};

export default MainScreen;
import React from 'react';
import { PlayerStats } from '../../types';
import Button from '../ui/Button';

interface StageEndScreenProps {
  result: 'win' | 'lose' | 'game_victory';
  stageName?: string; 
  playerStats: PlayerStats;
  scoreEarnedThisStage: number;
  onNext?: () => void; 
  onSaveAndMainMenu: () => void;
}

const StageEndScreen: React.FC<StageEndScreenProps> = ({ result, stageName, playerStats, scoreEarnedThisStage, onNext, onSaveAndMainMenu }) => {
  let title = '';
  let message = '';
  let gradientBg = '';
  let icon = '';
  let textColor = 'text-white';
  let buttonVariant: 'primary' | 'secondary' = 'primary';


  if (result === 'win') {
    title = `ยอดเยี่ยม! ผ่านด่าน ${stageName}!`;
    message = `คุณได้รับ ${scoreEarnedThisStage} คะแนนในด่านนี้ ยอดรวม ${playerStats.score} คะแนน`;
    gradientBg = 'bg-gradient-to-br from-green-500 via-teal-500 to-emerald-600';
    icon = '🏆';
    buttonVariant = 'primary';
  } else if (result === 'lose') {
    title = `พ่ายแพ้ใน ${stageName}`;
    message = `อย่าท้อแท้! พลังแห่งตัวเลขยังรอให้คุณฝึกฝน!`;
    gradientBg = 'bg-gradient-to-br from-red-500 via-rose-500 to-pink-600';
    icon = '💔';
    buttonVariant = 'secondary';
  } else if (result === 'game_victory') {
    title = `ขอแสดงความยินดี! คุณคือสุดยอดนักเวทคณิตศาสตร์!`;
    message = `คุณได้ปราบราชาปีศาจเลขลบ และนำความสงบสุขกลับคืนสู่ดินแดน Numeria! คะแนนรวมของคุณคือ ${playerStats.score}!`;
    gradientBg = 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600';
    icon = '👑';
    textColor = 'text-yellow-800'; // Darker text for better contrast on yellow
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-80px)] text-center p-4 sm:p-8 ${gradientBg} ${textColor} rounded-lg shadow-2xl relative overflow-hidden`}>
      {/* Decorative elements */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full filter blur-xl"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full filter blur-xl"></div>

      <div className="z-10 flex flex-col items-center">
        <span className="text-6xl sm:text-7xl md:text-8xl mb-4 sm:mb-6 animate-bounce">{icon}</span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>{title}</h1>
        <p className="text-base sm:text-lg md:text-xl mb-1 sm:mb-2" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.2)'}}>{message}</p>
        {result !== 'game_victory' && <p className="text-sm sm:text-md md:text-lg mb-6 sm:mb-8">พลังชีวิตที่เหลือ: {playerStats.hp}/{playerStats.maxHp} ❤️</p>}

        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row items-center w-full max-w-xs sm:max-w-sm md:max-w-md">
          {onNext && (result === 'win' || result === 'lose') && (
            <Button 
              onClick={onNext} 
              variant={buttonVariant}
              size="lg"
              className="w-full"
              icon={result === 'win' ? '➡️' : '🔄'}
            >
              {result === 'win' ? 'ผจญภัยต่อ' : 'ลองอีกครั้ง'}
            </Button>
          )}
           {/* "Back to Main Menu" button is now conditionally added based on requirements */}
           {(result === 'game_victory' || result === 'lose') && ( // Show for game_victory and lose
            <Button 
                onClick={onSaveAndMainMenu} 
                variant="secondary" 
                size="lg" 
                className={`w-full ${result === 'game_victory' ? '!bg-purple-200 !text-purple-800 hover:!bg-purple-300' : ''}`}
                icon="🏠"
            >
                กลับหน้าหลัก
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StageEndScreen;
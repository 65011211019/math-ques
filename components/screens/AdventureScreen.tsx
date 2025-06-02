import React from 'react';
import { Stage } from '../../types';
import Button from '../ui/Button';
import PlayerStatus from '../game/PlayerStatus'; 
import { PlayerStats as PlayerStatsType } from '../../types'; 

interface AdventureScreenProps {
  stages: Stage[];
  unlockedStageId: string;
  onSelectStage: (stage: Stage) => void;
  playerStats: PlayerStatsType; 
  onSaveAndMainMenu: () => void;
}

const AdventureScreen: React.FC<AdventureScreenProps> = ({ stages, unlockedStageId, onSelectStage, playerStats, onSaveAndMainMenu }) => {
  const unlockedIndex = stages.findIndex(s => s.id === unlockedStageId);

  return (
    <div className="p-3 sm:p-5 md:p-6 bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 rounded-lg min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-80px)]">
      <header className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 p-3 bg-white/50 backdrop-blur-sm rounded-xl shadow-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-700 mb-2 sm:mb-0">แผนที่ผจญภัย Numeria</h2>
        <Button onClick={onSaveAndMainMenu} variant="secondary" size="sm" icon="🏠">
            กลับหน้าหลัก
        </Button> 
      </header>
      
      <div className="mb-4 sm:mb-6">
        <PlayerStatus stats={playerStats} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 md:gap-6">
        {stages.map((stage, index) => {
          const isLocked = index > unlockedIndex;
          const cardBg = isLocked ? 'bg-slate-300 border-slate-400' : (stage.backgroundStyle || 'bg-white border-gray-300');
          const cardHoverEffect = isLocked ? '' : 'hover:shadow-xl hover:scale-[1.03] active:scale-[1.01]';
          
          return (
            <button
              key={stage.id}
              onClick={() => !isLocked && onSelectStage(stage)}
              disabled={isLocked}
              className={`p-3.5 sm:p-4 md:p-5 rounded-xl shadow-lg text-left transition-all duration-200 transform 
                          border-2 
                          ${cardBg} 
                          ${isLocked ? 'opacity-60 cursor-not-allowed filter grayscale-[20%]' : cardHoverEffect}`}
              aria-label={isLocked ? `${stage.name} (ล็อคอยู่)` : `เลือกด่าน ${stage.name}`}
            >
              <div className="flex items-start sm:items-center mb-2 sm:mb-3">
                <span className={`text-3xl sm:text-4xl mr-2 sm:mr-3 p-1.5 rounded-md ${isLocked ? 'bg-gray-400' : 'bg-white/50'}`}>{isLocked ? '🔒' : stage.mapIcon}</span>
                <div className="flex-1">
                    <h3 className={`text-lg sm:text-xl font-semibold ${isLocked ? 'text-gray-700' : 'text-slate-800'}`}>{stage.name}</h3>
                    <p className={`text-xs sm:text-sm ${isLocked ? 'text-gray-500': 'text-slate-600'}`}>{stage.worldName}</p>
                </div>
              </div>
              <p className={`text-[0.7rem] sm:text-xs leading-tight mb-1.5 sm:mb-2 ${isLocked ? 'text-gray-500': 'text-slate-500'}`}>{stage.description}</p>
              {isLocked && <p className="mt-1 sm:mt-2 text-xs text-red-600 font-bold">ต้องผ่านด่านก่อนหน้าเพื่อปลดล็อค</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdventureScreen;
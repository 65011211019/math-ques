import React from 'react';
import { PlayerStats } from '../../types';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';

interface PlayerStatusProps {
  stats: PlayerStats;
  onUseHint?: () => void;
  onUsePotion?: () => void;
  onUsePowerStrike?: () => void; 
  isPowerStrikeActive?: boolean; 
  isCombatScreen?: boolean;
  animation?: string | null;
  combatEffect?: { type: 'damage' | 'heal'; amount: number; key: string } | null;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({ 
    stats, onUseHint, onUsePotion, onUsePowerStrike, 
    isPowerStrikeActive, isCombatScreen = false, animation, combatEffect 
}) => {
  let animationClass = 'animate-idle';
  if (animation) {
    animationClass = animation;
  }
  const canUsePowerStrike = stats.focus >= stats.maxFocus && !isPowerStrikeActive;
  
  return (
    <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-xl shadow-lg border border-blue-300 relative overflow-hidden">
      {combatEffect && combatEffect.type === 'heal' && (
        <div
          key={combatEffect.key}
          className="combat-effect-number heal-player"
        >
          +{combatEffect.amount}
        </div>
      )}
       {combatEffect && combatEffect.type === 'damage' && (
        <div
          key={combatEffect.key}
          className="combat-effect-number damage-player"
        >
          -{combatEffect.amount}
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center mb-2 sm:mb-0">
          <div className={`character-sprite-container mr-2 sm:mr-3 ${animationClass} transform transition-transform duration-300`}>
            <span className="character-sprite text-5xl sm:text-6xl md:text-7xl">🧙</span>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">นักเวทฝึกหัด</h3>
            {isCombatScreen && <p className="text-xs sm:text-sm text-yellow-600 font-semibold">คะแนน: {stats.score}</p>}
          </div>
        </div>
        {!isCombatScreen && <p className="text-lg sm:text-xl font-semibold text-yellow-600">คะแนน: {stats.score}</p>}
      </div>
      
      <ProgressBar current={stats.hp} max={stats.maxHp} label="HP" colorClass="bg-green-500" heightClass="h-5 sm:h-6" />
      
      {isCombatScreen && (
        <div className="my-2 sm:my-3">
            <ProgressBar current={stats.focus} max={stats.maxFocus} label="พลังสมาธิ" colorClass="bg-cyan-500" heightClass="h-3 sm:h-4" />
        </div>
      )}

      {isCombatScreen && (
        <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-1.5 sm:gap-2"> 
          {onUseHint && (
            <Button 
              onClick={onUseHint} 
              variant="secondary" 
              size="sm"
              disabled={stats.hints <= 0 || (animation && animation !== 'animate-idle') || isPowerStrikeActive} 
              className="w-full !text-[0.65rem] xs:!text-xs"
              icon="💡"
            >
              คำใบ้ ({stats.hints})
            </Button>
          )}
          {onUsePotion && (
            <Button 
              onClick={onUsePotion} 
              variant="secondary" 
              size="sm"
              disabled={stats.potions <= 0 || stats.hp === stats.maxHp || (animation && animation !== 'animate-idle') || isPowerStrikeActive} 
              className="w-full !text-[0.65rem] xs:!text-xs"
              icon="🧪"
            >
              ยา ({stats.potions})
            </Button>
          )}
          {onUsePowerStrike && (
            <Button
              onClick={onUsePowerStrike}
              variant={isPowerStrikeActive ? "primary" : "secondary"} // Primary when active, secondary when charging
              size="sm"
              disabled={!canUsePowerStrike || (animation && animation !== 'animate-idle')}
              className={`w-full !text-[0.65rem] xs:!text-xs ${isPowerStrikeActive ? 'bg-gradient-to-r from-yellow-400 to-amber-500 !border-yellow-600 animate-pulse' : (stats.focus < stats.maxFocus ? 'opacity-70': '')}`}
              icon={isPowerStrikeActive ? '✨' : `⚡️`}
            >
              {isPowerStrikeActive ? 'พิเศษ!' : `พิเศษ (${Math.round((stats.focus/stats.maxFocus)*100)}%)`}
            </Button>
          )}
        </div>
      )}
       {!isCombatScreen && ( // Status display on Adventure map
         <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-yellow-100 p-2 rounded-lg text-center text-xs sm:text-sm border border-yellow-300 shadow-sm">💡 คำใบ้: <span className="font-bold">{stats.hints}</span></div>
            <div className="bg-green-100 p-2 rounded-lg text-center text-xs sm:text-sm border border-green-300 shadow-sm">🧪 ยา: <span className="font-bold">{stats.potions}</span></div>
            <div className="bg-cyan-100 p-2 rounded-lg text-center text-xs sm:text-sm border border-cyan-300 shadow-sm">🔮 พลังสมาธิ: <span className="font-bold">{stats.focus}/{stats.maxFocus}</span></div>
         </div>
        )}
    </div>
  );
};

export default PlayerStatus;
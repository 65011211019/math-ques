import React from 'react';
import ProgressBar from '../ui/ProgressBar';

interface EnemyDisplayProps {
  name: string;
  sprite: string;
  hp: number;
  maxHp: number;
  animation?: string | null; 
  combatEffect?: { type: 'damage'; amount: number; key: string } | null;
}

const EnemyDisplay: React.FC<EnemyDisplayProps> = ({ name, sprite, hp, maxHp, animation, combatEffect }) => {
  let animationClass = 'animate-idle'; 
  if (animation) {
    animationClass = animation; 
  }

  return (
    <div className="p-3 sm:p-4 bg-gradient-to-br from-red-100 via-rose-100 to-pink-100 rounded-xl shadow-lg border border-red-300 text-center relative overflow-hidden">
      {combatEffect && (
        <div
          key={combatEffect.key}
          className="combat-effect-number damage-enemy"
        >
          -{combatEffect.amount}
        </div>
      )}
      <div className={`enemy-sprite-container ${animationClass} my-1 sm:my-2 transform transition-transform duration-300`}>
        <span className="enemy-sprite text-5xl sm:text-6xl md:text-7xl">{sprite}</span>
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-700 mt-1 mb-2 sm:mb-3">{name}</h3>
      <ProgressBar current={hp} max={maxHp} label="HP ศัตรู" colorClass="bg-red-500" heightClass="h-5 sm:h-6" />
    </div>
  );
};

export default EnemyDisplay;
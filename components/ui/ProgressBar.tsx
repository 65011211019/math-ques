import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  colorClass?: string; // e.g., 'bg-green-500' for player, 'bg-red-500' for enemy
  showPercentageText?: boolean;
  heightClass?: string; // e.g. 'h-3', 'h-4'
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
    current, 
    max, 
    label, 
    colorClass: rawColorClass = 'bg-green-500', 
    showPercentageText = true,
    heightClass = 'h-4 sm:h-5 md:h-6'
}) => {
  const percentage = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;

  // Determine gradient based on base color for a more polished look
  let gradientColorClass = '';
  if (rawColorClass.includes('green')) {
    gradientColorClass = 'bg-gradient-to-r from-green-400 to-green-600';
  } else if (rawColorClass.includes('red')) {
    gradientColorClass = 'bg-gradient-to-r from-red-400 to-red-600';
  } else if (rawColorClass.includes('blue') || rawColorClass.includes('cyan')) {
    gradientColorClass = 'bg-gradient-to-r from-cyan-400 to-blue-600';
  } else {
    gradientColorClass = rawColorClass; // Fallback to solid color if not recognized
  }


  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">{label}</span>
            <span className="text-[0.65rem] sm:text-xs font-medium text-slate-500">({Math.max(0,current)}/{max})</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full ${heightClass} overflow-hidden border border-slate-300 shadow-inner relative`}>
        <div
          className={`absolute top-0 left-0 h-full rounded-full ${gradientColorClass} transition-all duration-300 ease-out flex items-center justify-end pr-2`}
          style={{ width: `${percentage}%` }}
        >
          {showPercentageText && percentage > 15 && ( // Show percentage only if bar is wide enough
            <span className="text-white text-[0.55rem] sm:text-[0.65rem] md:text-xs font-bold">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
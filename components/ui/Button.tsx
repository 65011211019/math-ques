import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'choice' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: string; // For adding an optional icon
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', icon, ...props }) => {
  let baseStyle = 'font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-opacity-60 flex items-center justify-center space-x-2';
  
  let sizeStyle = '';
  switch (size) {
    case 'sm':
      sizeStyle = 'py-1.5 px-3 text-xs sm:text-sm';
      break;
    case 'md':
      sizeStyle = 'py-2 px-4 text-sm sm:text-base';
      break;
    case 'lg':
      sizeStyle = 'py-2.5 px-6 text-base sm:text-lg';
      break;
  }

  if (props.disabled) {
    baseStyle += ' opacity-60 cursor-not-allowed filter grayscale-[30%]';
  } else {
    baseStyle += ' hover:scale-105 active:scale-95 hover:shadow-lg';
  }

  switch (variant) {
    case 'primary': // Magical, important actions
      baseStyle += ' bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 text-white hover:from-purple-600 hover:via-indigo-600 hover:to-blue-700 focus:ring-indigo-400 border border-purple-700 fantasy-button';
      break;
    case 'secondary': // Less prominent, alternative actions
      baseStyle += ' bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300 focus:ring-slate-400 border border-slate-300';
      break;
    case 'choice': // For answer buttons in combat
      baseStyle += ' bg-gradient-to-br from-sky-100 to-blue-100 text-sky-700 border-2 border-sky-300 hover:from-sky-200 hover:to-blue-200 hover:border-sky-400 focus:ring-sky-400 choice-button text-left justify-start'; // Align text left for multi-line
      sizeStyle = 'py-3 px-4 text-base sm:text-lg'; // Choices are usually larger
      break;
    case 'danger': // For retreat, potentially destructive actions
      baseStyle += ' bg-gradient-to-br from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 focus:ring-red-400 border border-red-700';
      break;
    case 'neutral': // For tutorial close, less emphasis
        baseStyle += ' bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-400';
        break;
  }

  return (
    <button
      className={`${baseStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
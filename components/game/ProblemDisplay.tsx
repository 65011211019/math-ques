import React from 'react';
import { Problem as ProblemType } from '../../types';
import Button from '../ui/Button';

interface ProblemDisplayProps {
  problem: ProblemType;
  onAnswer: (answer: number, isCorrect: boolean) => void;
  selectedAnswer?: number | null;
  revealAnswer?: boolean; 
  isAnswered: boolean; 
}

const ProblemDisplay: React.FC<ProblemDisplayProps> = ({ problem, onAnswer, selectedAnswer, revealAnswer, isAnswered }) => {
  
  const getButtonClass = (option: number) => {
    // Base classes for choice buttons are handled in Button.tsx variant='choice'
    let dynamicClass = '';
    if (!isAnswered && !revealAnswer) return dynamicClass; 
    if (option === problem.correctAnswer) dynamicClass += ' correct'; 
    if (option === selectedAnswer && option !== problem.correctAnswer) dynamicClass += ' incorrect'; 
    return dynamicClass;
  };

  return (
    <div className="my-3 sm:my-4 p-4 sm:p-6 bg-gradient-to-br from-purple-100 via-fuchsia-100 to-pink-100 rounded-xl shadow-xl border-2 border-purple-300 text-center">
      <p 
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-700 mb-6 sm:mb-8 tracking-wide leading-tight"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
      >
        {problem.text}
      </p>
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-4">
        {problem.options.map((option) => (
          <Button
            key={option}
            variant="choice"
            size="lg" // Uses larger size defined in Button.tsx
            className={`${getButtonClass(option)} ${isAnswered ? 'disabled-button opacity-70' : ''} w-full !text-xl sm:!text-2xl !font-bold !justify-center`}
            onClick={() => !isAnswered && onAnswer(option, option === problem.correctAnswer)}
            disabled={isAnswered}
          >
            {option}
            {revealAnswer && option === problem.correctAnswer && <span className="ml-2 text-lg sm:text-xl">👈</span>}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ProblemDisplay;
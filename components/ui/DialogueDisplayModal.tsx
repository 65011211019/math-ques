import React, { useState, useEffect } from 'react';
import { DialogueLine } from '../../types';
import Button from './Button';

interface DialogueDisplayModalProps {
  isOpen: boolean;
  dialogueLines: DialogueLine[];
  onComplete: () => void;
}

const DialogueDisplayModal: React.FC<DialogueDisplayModalProps> = ({ isOpen, dialogueLines, onComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setCurrentLineIndex(0);
    setDisplayedText(''); // Clear text when modal opens/lines change
  }, [isOpen, dialogueLines]); 

  useEffect(() => {
    if (isOpen && dialogueLines.length > 0 && currentLineIndex < dialogueLines.length) {
      const currentText = dialogueLines[currentLineIndex].text;
      setDisplayedText(''); // Reset for typing effect
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < currentText.length) {
          setDisplayedText(prev => prev + currentText.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 30); // Adjust typing speed (ms per character)
      return () => clearInterval(typingInterval);
    }
  }, [isOpen, dialogueLines, currentLineIndex]);


  if (!isOpen || dialogueLines.length === 0) {
    return null;
  }

  if (currentLineIndex >= dialogueLines.length) {
    return null;
  }

  const handleNextLine = () => {
    if (currentLineIndex < dialogueLines.length - 1) {
      setCurrentLineIndex(prevIndex => prevIndex + 1);
    } else {
      onComplete(); 
    }
  };

  const currentLine = dialogueLines[currentLineIndex];

  if (!currentLine) {
    onComplete(); 
    return null;
  }

  // Check if full text has been "typed" out for the current line
  const isTextFullyDisplayed = displayedText.length === currentLine.text.length;

  const advanceOrSkipTyping = () => {
    if (!isTextFullyDisplayed) {
      setDisplayedText(currentLine.text); // Skip typing, show full text
    } else {
      handleNextLine(); // If text is full, advance to next line
    }
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-end justify-center z-[60] p-2 xs:p-3 sm:p-4 backdrop-blur-sm animate-fade-in" 
      onClick={advanceOrSkipTyping} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="dialogue-speaker"
    >
      <div 
        className="bg-gradient-to-br from-slate-700 via-gray-800 to-slate-900 rounded-t-xl shadow-2xl w-full max-w-3xl p-4 sm:p-5 md:p-6 transform transition-all border-t-2 border-purple-400" 
        onClick={(e) => e.stopPropagation()} // Prevent advancing dialogue when clicking inside the box itself, only on backdrop or button
      >
        <div className="flex items-start space-x-3 sm:space-x-4">
          {currentLine.speakerSprite && (
            <div className="text-4xl sm:text-5xl bg-slate-600 p-2 sm:p-3 rounded-full shadow-lg border-2 border-slate-500">
              {currentLine.speakerSprite}
            </div>
          )}
          <div className="flex-1 min-h-[6em] sm:min-h-[5em]"> {/* Ensure minimum height for text area */}
            <h3 id="dialogue-speaker" className="text-lg sm:text-xl md:text-2xl font-bold text-purple-300">{currentLine.speakerName}</h3>
            <p className="text-sm sm:text-base md:text-lg text-slate-200 mt-1 whitespace-pre-wrap leading-relaxed">
              {displayedText}
              {!isTextFullyDisplayed && <span className="animate-pulse">▍</span> /* Typing cursor */}
            </p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 text-right">
          <Button 
            onClick={advanceOrSkipTyping} 
            variant="primary" 
            size="md"
            className="!bg-purple-500 hover:!bg-purple-600"
          >
            {isTextFullyDisplayed ? (currentLineIndex < dialogueLines.length - 1 ? 'ถัดไป ➡️' : 'จบ ✨') : 'ข้าม ⏩'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DialogueDisplayModal;
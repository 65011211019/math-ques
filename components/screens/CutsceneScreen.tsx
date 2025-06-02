import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CutsceneFrame, CutsceneElement } from '../../types';
import Button from '../ui/Button';

interface CutsceneScreenProps {
  cutsceneFrames: CutsceneFrame[];
  onEnd: () => void;
}

const CutsceneScreen: React.FC<CutsceneScreenProps> = ({ cutsceneFrames, onEnd }) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [elementsVisible, setElementsVisible] = useState(false);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentFrame = cutsceneFrames[currentFrameIndex];

  const advanceFrame = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setElementsVisible(false); 
    
    if (currentFrameIndex < cutsceneFrames.length - 1) {
      setTimeout(() => { 
        setCurrentFrameIndex(prevIndex => prevIndex + 1);
      }, 150); // Slightly longer for smoother element animation reset
    } else {
      onEnd();
    }
  }, [currentFrameIndex, cutsceneFrames.length, onEnd]);

  useEffect(() => {
    setElementsVisible(true);

    if (currentFrame?.autoAdvanceDelay) {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        advanceFrame();
      }, currentFrame.autoAdvanceDelay);
    }
    
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, [currentFrame, advanceFrame]);
  
  useEffect(() => {
      setCurrentFrameIndex(0);
      setElementsVisible(false); 
      setTimeout(() => setElementsVisible(true), 50); 
  }, [cutsceneFrames]);


  if (!currentFrame) {
    return (
        <div className="w-full h-full min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-80px)] md:min-h-0 md:h-[600px] flex items-center justify-center bg-gray-900 text-white p-4 text-center rounded-lg">
            กำลังโหลดฉากคัทซีน...
        </div>
    );
  }

  const renderElement = (element: CutsceneElement, index: number) => {
    const animationClasses = elementsVisible && element.animationClasses ? element.animationClasses : 'opacity-0'; // Apply animation if visible
    
    // Responsive text sizing is now primarily handled by Tailwind classes defined in constants.ts for each text element.
    // No need for extra logic here as those classes will apply directly.

    switch (element.type) {
      case 'character':
        return (
          <div key={index} className={`${element.positionClasses} ${animationClasses} transform transition-all duration-700 ease-out`}>
            {element.sprite && <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl filter drop-shadow-lg">{element.sprite}</span>}
            {element.name && <p className="text-center text-xs sm:text-sm font-semibold mt-1 text-white bg-black/40 p-1.5 rounded-md shadow-md">{element.name}</p>}
          </div>
        );
      case 'text':
        return (
          <div key={index} className={`${element.positionClasses} ${animationClasses} transform transition-all duration-700 ease-out`}>
            {element.sprite && <span className="text-xl sm:text-2xl mr-2 filter drop-shadow-sm">{element.sprite}</span>}
            {/* Text styling (size, color, shadow) should be part of element.positionClasses or direct text classes in constants.ts */}
            <p className={`whitespace-pre-wrap leading-relaxed`}>{element.text}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`w-full h-full min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-80px)] md:min-h-0 md:h-[600px] relative overflow-hidden cursor-pointer ${currentFrame.backgroundStyle} bg-cover bg-center rounded-lg shadow-2xl`}
      onClick={currentFrame.autoAdvanceDelay ? undefined : advanceFrame}
      role="dialog"
      aria-labelledby={`cutscene_frame_${currentFrame.id}`}
      tabIndex={0}
      onKeyPress={(e) => { if(e.key === 'Enter' || e.key === ' ') advanceFrame()}}
    >
      {/* Added a subtle overlay to improve text contrast on varied backgrounds */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

      <div id={`cutscene_frame_${currentFrame.id}`} className="sr-only">Cutscene: Frame {currentFrameIndex + 1}</div>
      {currentFrame.elements.map(renderElement)}

      {!currentFrame.autoAdvanceDelay && (
        <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 z-10">
          <Button 
            onClick={advanceFrame} 
            variant="primary" 
            size="md"
            className="!bg-opacity-80 hover:!bg-opacity-100 backdrop-blur-sm"
            icon={currentFrameIndex < cutsceneFrames.length - 1 ? undefined : '✨'}
          >
            {currentFrameIndex < cutsceneFrames.length - 1 ? 'ถัดไป ➡️' : 'เริ่มการผจญภัย'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CutsceneScreen;
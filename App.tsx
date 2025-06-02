import React, { useState, useEffect, useCallback } from 'react';
import { GameScreen, PlayerStats, Stage as StageType, DialogueLine } from './types';
import { initializeGameStages, INITIAL_PLAYER_STATS, TUTORIAL_TEXT, CUTSCENES, GAME_INTRO_CUTSCENE_ID } from './constants';
import MainScreen from './components/screens/MainScreen';
import AdventureScreen from './components/screens/AdventureScreen';
import CombatScreen from './components/screens/CombatScreen';
import StageEndScreen from './components/screens/StageEndScreen';
import Modal from './components/ui/Modal';
import DialogueDisplayModal from './components/ui/DialogueDisplayModal';
import CutsceneScreenComponent from './components/screens/CutsceneScreen';

const LOCAL_STORAGE_PLAYER_STATS_KEY = 'mathQuestPlayerStats';
const LOCAL_STORAGE_UNLOCKED_STAGE_ID_KEY = 'mathQuestUnlockedStageId';
const LOCAL_STORAGE_CURRENT_SCREEN_KEY = 'mathQuestCurrentScreen';

const App: React.FC = () => {
  const [gameStages, setGameStages] = useState<StageType[]>(() => initializeGameStages());

  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    try {
      const savedStats = localStorage.getItem(LOCAL_STORAGE_PLAYER_STATS_KEY);
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        if (parsedStats && typeof parsedStats.hp === 'number' && typeof parsedStats.maxHp === 'number') {
          return parsedStats;
        }
      }
    } catch (error) {
      console.error("Error loading player stats from localStorage:", error);
    }
    return { ...INITIAL_PLAYER_STATS };
  });

  const [unlockedStageId, setUnlockedStageId] = useState<string>(() => {
    try {
      const savedUnlockedStage = localStorage.getItem(LOCAL_STORAGE_UNLOCKED_STAGE_ID_KEY);
      const stages = initializeGameStages(); 
      if (savedUnlockedStage && stages.find(s => s.id === savedUnlockedStage)) {
        return savedUnlockedStage;
      }
    } catch (error) {
        console.error("Error loading unlocked stage ID from localStorage:", error);
    }
    const initialStages = initializeGameStages();
    return initialStages.length > 0 ? initialStages[0].id : 's1';
  });

  const [currentScreen, setCurrentScreen] = useState<GameScreen>(() => {
    try {
      const savedScreen = localStorage.getItem(LOCAL_STORAGE_CURRENT_SCREEN_KEY) as GameScreen | null;
      const hasSavedProgress = !!localStorage.getItem(LOCAL_STORAGE_PLAYER_STATS_KEY);

      if (savedScreen && hasSavedProgress) {
        const nonResumableScreens: GameScreen[] = [
          GameScreen.COMBAT, GameScreen.STAGE_CLEAR, GameScreen.GAME_OVER,
          GameScreen.GAME_VICTORY, GameScreen.CUTSCENE, GameScreen.TUTORIAL
        ];
        if (nonResumableScreens.includes(savedScreen)) {
          return GameScreen.ADVENTURE_MAP; 
        }
        return savedScreen; 
      }
    } catch (error) {
      console.error("Error loading current screen from localStorage:", error);
    }
    return GameScreen.MAIN_MENU; 
  });
  
  const [currentStage, setCurrentStage] = useState<StageType | null>(null);
  const [scoreEarnedInStage, setScoreEarnedInStage] = useState<number>(0);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [activeDialogueLines, setActiveDialogueLines] = useState<DialogueLine[] | null>(null);
  const [onDialogueCompleteCallback, setOnDialogueCompleteCallback] = useState<(() => void) | null>(null);
  const [activeCutsceneId, setActiveCutsceneId] = useState<string | null>(null);
  const [onCutsceneCompleteCallback, setOnCutsceneCompleteCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PLAYER_STATS_KEY, JSON.stringify(playerStats));
    } catch (error) {
      console.error("Error saving player stats to localStorage:", error);
    }
  }, [playerStats]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_UNLOCKED_STAGE_ID_KEY, unlockedStageId);
    } catch (error) {
      console.error("Error saving unlocked stage ID to localStorage:", error);
    }
  }, [unlockedStageId]);

  useEffect(() => {
    const nonPersistentScreens: GameScreen[] = [ 
      GameScreen.COMBAT, GameScreen.STAGE_CLEAR, GameScreen.GAME_OVER,
      GameScreen.GAME_VICTORY, GameScreen.CUTSCENE, GameScreen.TUTORIAL
    ];
    if (!nonPersistentScreens.includes(currentScreen) && localStorage.getItem(LOCAL_STORAGE_PLAYER_STATS_KEY)) {
      try {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_SCREEN_KEY, currentScreen);
      } catch (error) {
        console.error("Error saving current screen to localStorage:", error);
      }
    }
  }, [currentScreen]);

  const resetStateForNewGame = useCallback((newStages: StageType[]) => {
    setPlayerStats({ ...INITIAL_PLAYER_STATS });
    setCurrentStage(null);
    setUnlockedStageId(newStages.length > 0 ? newStages[0].id : 's1');
    setActiveDialogueLines(null);
    setOnDialogueCompleteCallback(null);
    setActiveCutsceneId(null);
    setOnCutsceneCompleteCallback(null);
    setScoreEarnedInStage(0);
  }, []);
  
  const resetGameAndClearStorage = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_PLAYER_STATS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_UNLOCKED_STAGE_ID_KEY);
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_SCREEN_KEY);
    const newStages = initializeGameStages(); 
    setGameStages(newStages);
    resetStateForNewGame(newStages);
  }, [resetStateForNewGame]);
  
  const proceedToAdventureMap = useCallback(() => {
    setCurrentScreen(GameScreen.ADVENTURE_MAP);
  }, []);

  const handleStartGame = useCallback(() => {
    resetGameAndClearStorage(); 
    if (CUTSCENES[GAME_INTRO_CUTSCENE_ID]) {
      setActiveCutsceneId(GAME_INTRO_CUTSCENE_ID);
      setOnCutsceneCompleteCallback(() => proceedToAdventureMap); 
      setCurrentScreen(GameScreen.CUTSCENE);
    } else {
      proceedToAdventureMap();
    }
  }, [resetGameAndClearStorage, proceedToAdventureMap]);

  const handleSaveAndMainMenu = useCallback(() => {
    setCurrentScreen(GameScreen.MAIN_MENU);
  }, []);


  const handleShowTutorial = () => {
    setIsTutorialOpen(true);
  };

  const handleCloseTutorial = () => {
    setIsTutorialOpen(false);
  };

  const proceedToCombat = useCallback(() => {
    setCurrentScreen(GameScreen.COMBAT);
  }, []);

  const handleSelectStage = (stage: StageType) => {
    setCurrentStage(stage);
    if (stage.introDialogue && stage.introDialogue.length > 0) {
      setActiveDialogueLines(stage.introDialogue);
      setOnDialogueCompleteCallback(() => proceedToCombat); 
    } else {
      proceedToCombat();
    }
  };
  
  const showStageEndScreen = useCallback((result: 'win' | 'lose' | 'game_victory') => {
    if (result === 'win' && currentStage) {
        const currentStageIndex = gameStages.findIndex(s => s.id === currentStage.id);
        if (currentStageIndex === gameStages.length - 1) { 
            setCurrentScreen(GameScreen.GAME_VICTORY);
            return; 
        } else { 
            if (currentStageIndex < gameStages.length - 1) {
                const nextStage = gameStages[currentStageIndex + 1];
                const currentUnlockedStageActualIndex = gameStages.findIndex(s => s.id === unlockedStageId);
                if (nextStage && gameStages.findIndex(s => s.id === nextStage.id) > currentUnlockedStageActualIndex) {
                    setUnlockedStageId(nextStage.id);
                }
            }
            setCurrentScreen(GameScreen.STAGE_CLEAR);
        }
    } else if (result === 'lose') {
        setCurrentScreen(GameScreen.GAME_OVER);
    } else if (result === 'game_victory') { 
        setCurrentScreen(GameScreen.GAME_VICTORY);
    }
  }, [currentStage, gameStages, unlockedStageId]);


  const handleCombatEnd = (result: 'win' | 'lose' | 'retreat', updatedPlayerStats: PlayerStats, scoreEarned: number) => {
    setPlayerStats(updatedPlayerStats); 
    setScoreEarnedInStage(scoreEarned);

    if (result === 'retreat') {
      setCurrentScreen(GameScreen.ADVENTURE_MAP);
      return;
    }
    
    const gameVictoryCondition = result === 'win' && currentStage?.id === gameStages[gameStages.length - 1].id;
    const finalResultToUse = gameVictoryCondition ? 'game_victory' : result;
    
    let outroDialogue: DialogueLine[] | undefined = undefined;
    if (finalResultToUse === 'win' && currentStage?.outroDialogueWin) {
        outroDialogue = currentStage.outroDialogueWin;
    } else if (finalResultToUse === 'lose' && currentStage?.outroDialogueLose) {
        outroDialogue = currentStage.outroDialogueLose;
    } else if (finalResultToUse === 'game_victory' && currentStage?.outroDialogueWin) { 
        outroDialogue = currentStage.outroDialogueWin; 
    }

    if (outroDialogue && outroDialogue.length > 0) {
        setActiveDialogueLines(outroDialogue);
        setOnDialogueCompleteCallback(() => { 
             showStageEndScreen(finalResultToUse);
        });
    } else {
        showStageEndScreen(finalResultToUse);
    }
  };

  const handleDialogueModalComplete = () => {
    if (onDialogueCompleteCallback) {
      onDialogueCompleteCallback(); 
    }
    setActiveDialogueLines(null);
    setOnDialogueCompleteCallback(null);
  };

  const handleCutsceneComplete = () => {
    if (onCutsceneCompleteCallback) {
      onCutsceneCompleteCallback();
    }
    setActiveCutsceneId(null);
    setOnCutsceneCompleteCallback(null);
  };

  const handleStageEndNext = () => {
    if (currentScreen === GameScreen.GAME_OVER && currentStage) { 
        setPlayerStats(prev => ({
            ...prev, 
            hp: Math.min(prev.maxHp, Math.floor(prev.maxHp * 0.75)), 
        })); 
        if (currentStage.introDialogue && currentStage.introDialogue.length > 0) {
          setActiveDialogueLines(currentStage.introDialogue);
          setOnDialogueCompleteCallback(() => proceedToCombat);
        } else {
          proceedToCombat();
        }
    } else { 
        setCurrentScreen(GameScreen.ADVENTURE_MAP);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case GameScreen.MAIN_MENU:
        return <MainScreen onStartGame={handleStartGame} onShowTutorial={handleShowTutorial} />;
      case GameScreen.CUTSCENE:
        if (activeCutsceneId && CUTSCENES[activeCutsceneId]) {
          return <CutsceneScreenComponent 
                    key={activeCutsceneId} 
                    cutsceneFrames={CUTSCENES[activeCutsceneId]} 
                    onEnd={handleCutsceneComplete} 
                  />;
        }
        if (onCutsceneCompleteCallback) onCutsceneCompleteCallback(); 
        else proceedToAdventureMap(); 
        return null;
      case GameScreen.ADVENTURE_MAP:
        return <AdventureScreen 
                  stages={gameStages} 
                  unlockedStageId={unlockedStageId} 
                  onSelectStage={handleSelectStage} 
                  playerStats={playerStats}
                  onSaveAndMainMenu={handleSaveAndMainMenu}
                />;
      case GameScreen.COMBAT:
        if (currentStage) {
          return <CombatScreen 
                    key={`${currentStage.id}-${playerStats.hp}-${gameStages.find(s => s.id === currentStage.id)?.problems.map(p => p.id).join('')}`}
                    stage={currentStage} 
                    playerStats={playerStats} 
                    onCombatEnd={handleCombatEnd} 
                  />;
        }
        setCurrentScreen(GameScreen.ADVENTURE_MAP); 
        return null; 
      case GameScreen.STAGE_CLEAR:
        return <StageEndScreen 
                  result="win" 
                  stageName={currentStage?.name} 
                  playerStats={playerStats} 
                  scoreEarnedThisStage={scoreEarnedInStage}
                  onNext={handleStageEndNext} 
                  onSaveAndMainMenu={handleSaveAndMainMenu}
                />;
      case GameScreen.GAME_OVER:
        return <StageEndScreen 
                  result="lose" 
                  stageName={currentStage?.name} 
                  playerStats={playerStats} 
                  scoreEarnedThisStage={0}
                  onNext={handleStageEndNext} 
                  onSaveAndMainMenu={handleSaveAndMainMenu}
                />;
      case GameScreen.GAME_VICTORY:
        return <StageEndScreen
                  result="game_victory"
                  playerStats={playerStats}
                  scoreEarnedThisStage={scoreEarnedInStage}
                  onSaveAndMainMenu={handleSaveAndMainMenu}
                />;
      default:
        return <MainScreen onStartGame={handleStartGame} onShowTutorial={handleShowTutorial} />;
    }
  };

  return (
    <div className="game-container mx-auto my-2 sm:my-3 md:my-4 lg:my-5"> {/* Adjusted vertical margin */}
      {renderScreen()}
      <Modal isOpen={isTutorialOpen} onClose={handleCloseTutorial} title="วิธีเล่น Math Quest" size="lg">
        <ul className="space-y-2 list-none text-gray-700"> {/* Changed to list-none for custom styling */}
            {TUTORIAL_TEXT.map((text, index) => (
                <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2 text-lg">❖</span> {/* Custom bullet */}
                    <span>{text}</span>
                </li>
            ))}
        </ul>
      </Modal>
      <DialogueDisplayModal
        isOpen={!!activeDialogueLines}
        dialogueLines={activeDialogueLines || []}
        onComplete={handleDialogueModalComplete}
      />
    </div>
  );
};

export default App;
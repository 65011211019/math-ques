import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerStats, Problem as ProblemType, Stage } from '../../types';
import PlayerStatusDisplay from '../game/PlayerStatus';
import EnemyDisplay from '../game/EnemyDisplay';
import ProblemDisplay from '../game/ProblemDisplay';
import Button from '../ui/Button';
import { 
  POTION_HEAL_AMOUNT, PLAYER_ATTACK_POWER, ENEMY_ATTACK_POWER, 
  COMBAT_TIMER_DURATION, TIMER_PENALTY_DAMAGE,
  FOCUS_GAIN_ON_CORRECT, POWER_STRIKE_DAMAGE_MULTIPLIER,
  QUICK_ANSWER_THRESHOLD_SECONDS, QUICK_ANSWER_BONUS_SCORE
} from '../../constants';

interface CombatScreenProps {
  stage: Stage;
  playerStats: PlayerStats;
  onCombatEnd: (result: 'win' | 'lose' | 'retreat', newPlayerStats: PlayerStats, scoreEarned: number) => void;
}

type AnimationType = 'animate-idle' | 'animate-attack-player' | 'animate-attack-enemy' | 'animate-shake' | 'animate-heal' | null;

type PlayerCombatEffect = { key: string; target: 'player'; type: 'damage' | 'heal'; amount: number };
type EnemyCombatEffect = { key: string; target: 'enemy'; type: 'damage'; amount: number };
type CombatEffectType = PlayerCombatEffect | EnemyCombatEffect | null;

const CombatScreen: React.FC<CombatScreenProps> = ({ stage, playerStats, onCombatEnd }) => {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [currentEnemyHp, setCurrentEnemyHp] = useState(stage.enemyMaxHp);
  const [currentPlayerStats, setCurrentPlayerStats] = useState<PlayerStats>({...playerStats});
  
  const [message, setMessage] = useState<string>('');
  const [selectedAnswer, setSelectedAnswer]  = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [companionMessage, setCompanionMessage] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(COMBAT_TIMER_DURATION);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playerAnimation, setPlayerAnimation] = useState<AnimationType>('animate-idle');
  const [enemyAnimation, setEnemyAnimation] = useState<AnimationType>('animate-idle');
  const [combatEffect, setCombatEffect] = useState<CombatEffectType>(null);
  const effectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [isPowerStrikeActive, setIsPowerStrikeActive] = useState(false);
  const initialTimeOnProblem = useRef<number>(COMBAT_TIMER_DURATION);

  const currentProblem = stage.problems[currentProblemIndex];

  const clearAnimationsAndEffects = useCallback(() => {
    if (effectTimeoutRef.current) clearTimeout(effectTimeoutRef.current);
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    setPlayerAnimation('animate-idle');
    setEnemyAnimation('animate-idle');
    setCombatEffect(null);
  }, []);

  const triggerCombatEffect = useCallback((target: 'player' | 'enemy', type: 'damage' | 'heal', amount: number) => {
    const effectData: PlayerCombatEffect | EnemyCombatEffect = { key: Date.now().toString(), target, type, amount } as PlayerCombatEffect | EnemyCombatEffect;
    setCombatEffect(effectData);
    if (effectTimeoutRef.current) clearTimeout(effectTimeoutRef.current);
    effectTimeoutRef.current = setTimeout(() => setCombatEffect(null), 1300); // Duration of combat-effect-number animation
  }, []);
  
  const triggerAnimation = useCallback((target: 'player' | 'enemy', animation: AnimationType, duration = 600) => {
    if (target === 'player') setPlayerAnimation(animation);
    else setEnemyAnimation(animation);
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = setTimeout(()=> {
        if (target === 'player') setPlayerAnimation('animate-idle');
        else setEnemyAnimation('animate-idle');
    }, duration)
  }, []);

  const resetForNewQuestion = useCallback(() => {
    clearAnimationsAndEffects();
    setIsAnswered(false);
    setIsProcessing(false);
    setSelectedAnswer(null);
    setShowHint(false);
    setTimeLeft(COMBAT_TIMER_DURATION);
    initialTimeOnProblem.current = COMBAT_TIMER_DURATION;
    if (currentProblem) {
      setMessage(`คำถามที่ ${currentProblemIndex + 1}/${stage.numProblems}: ${stage.enemyName} กำลังเตรียมตัว...`);
    } else {
       setMessage(`${stage.enemyName} พ่ายแพ้แล้ว หรือมีบางอย่างผิดพลาด!`);
    }
  }, [clearAnimationsAndEffects, currentProblem, currentProblemIndex, stage.numProblems, stage.enemyName]);

  useEffect(() => {
    setCompanionMessage(`${stage.companion.sprite} ${stage.companion.name}: "${stage.companion.advice}"`);
    if (currentProblem) {
        resetForNewQuestion();
    }
  }, [currentProblemIndex, stage, resetForNewQuestion]);


  const advanceToNextProblemOrEnd = useCallback((playerHpAfterAction: number, statsAfterAction: PlayerStats, wasCorrect: boolean | null, timeUp: boolean = false) => {
    setIsProcessing(false);

    if (playerHpAfterAction <= 0) {
        setMessage('พลังชีวิตหมด! คุณพ่ายแพ้...');
        setTimeout(() => onCombatEnd('lose', statsAfterAction, statsAfterAction.score - playerStats.score), 2000);
        return;
    }

    // Victory handled by handleAnswer or timeUp directly.
    // This function now primarily handles advancing problems or loss due to running out of problems.
    if (currentProblemIndex < stage.problems.length - 1) {
        setCurrentProblemIndex(prevIdx => prevIdx + 1);
        // resetForNewQuestion will be called by useEffect reacting to currentProblemIndex change
    } else { // All problems for this stage are done
        if (currentEnemyHp > 0) { // Enemy still alive after all questions
            setMessage(`${stage.enemyName} ยังคงยืนหยัด! คุณทำโจทย์หมดแล้วแต่ยังเอาชนะไม่ได้...`);
            setTimeout(() => onCombatEnd('lose', statsAfterAction, statsAfterAction.score - playerStats.score), 2000);
        } 
        // If enemyHp <= 0, victory was already handled.
    }
  }, [currentEnemyHp, currentProblemIndex, stage.problems.length, onCombatEnd, playerStats.score, stage.enemyName]);


  const handleTimeUp = useCallback(() => {
    if (isAnswered || isProcessing) return;

    setIsAnswered(true);
    setIsProcessing(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    setMessage(`หมดเวลา! ${stage.enemyName} โจมตี! คุณเสีย HP ${TIMER_PENALTY_DAMAGE}`);
    
    triggerAnimation('player', 'animate-shake', 450);
    triggerAnimation('enemy', 'animate-attack-enemy', 500);
    triggerCombatEffect('player', 'damage', TIMER_PENALTY_DAMAGE);

    let newPlayerStats = {
      ...currentPlayerStats,
      hp: Math.max(0, currentPlayerStats.hp - TIMER_PENALTY_DAMAGE),
      score: Math.max(0, currentPlayerStats.score - 2) 
    };
    
    if (isPowerStrikeActive) {
      setMessage(prev => prev + " พลังโจมตีพิเศษสลายไป...");
      newPlayerStats.focus = 0;
      setIsPowerStrikeActive(false);
    }
    setCurrentPlayerStats(newPlayerStats);

    setTimeout(() => {
        advanceToNextProblemOrEnd(newPlayerStats.hp, newPlayerStats, null, true);
    }, 1800); // Slightly longer delay for timeout feedback

  }, [isAnswered, isProcessing, stage.enemyName, currentPlayerStats, triggerAnimation, triggerCombatEffect, advanceToNextProblemOrEnd, isPowerStrikeActive]);


  useEffect(() => {
    if (isAnswered || isProcessing || !currentProblem || currentPlayerStats.hp <=0 || currentEnemyHp <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    initialTimeOnProblem.current = timeLeft; 
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAnswered, isProcessing, currentProblem, handleTimeUp, timeLeft, currentPlayerStats.hp, currentEnemyHp]);


  const handleAnswer = useCallback((answer: number, isCorrect: boolean) => {
    if (isAnswered || isProcessing || !currentProblem) return;

    setIsAnswered(true);
    setIsProcessing(true);
    setSelectedAnswer(answer);
    setShowHint(false); 
    if (timerRef.current) clearInterval(timerRef.current);

    let newPlayerStats = { ...currentPlayerStats };
    let scoreChange = 0;
    let messageLog = "";
    let newEnemyHp = currentEnemyHp;
    
    const timeTaken = initialTimeOnProblem.current - timeLeft;

    if (isCorrect) {
      let damageDealt = PLAYER_ATTACK_POWER + Math.floor(Math.random() * 6); // Base damage
      
      if (isPowerStrikeActive) {
        damageDealt = Math.floor(damageDealt * POWER_STRIKE_DAMAGE_MULTIPLIER);
        messageLog += `โจมตีพิเศษทำงาน! 🔥 `;
        newPlayerStats.focus = 0; 
        setIsPowerStrikeActive(false);
      } else {
        newPlayerStats.focus = Math.min(newPlayerStats.maxFocus, newPlayerStats.focus + FOCUS_GAIN_ON_CORRECT);
      }

      if (stage.specialAbility === 'damageResist' && stage.abilityValue) {
        const resisted = Math.min(damageDealt - 1, stage.abilityValue); 
        damageDealt = Math.max(1, damageDealt - resisted); // Ensure at least 1 damage
        messageLog += `${stage.enemyName} ต้านทาน ${resisted} หน่วย! 🛡️ `;
      }
      
      newEnemyHp = Math.max(0, currentEnemyHp - damageDealt);
      
      messageLog += `ยอดเยี่ยม! ${stage.enemyName} เสีย HP ${damageDealt}! ✅`;
      triggerAnimation('player', 'animate-attack-player', 500);
      triggerAnimation('enemy', 'animate-shake', 450);
      triggerCombatEffect('enemy', 'damage', damageDealt);
      
      scoreChange = 10 + (stage.id === 's15' ? 20 : (stage.id === 's10' || stage.id === 's5' ? 10 : 0));
      
      if (timeTaken <= QUICK_ANSWER_THRESHOLD_SECONDS) {
          scoreChange += QUICK_ANSWER_BONUS_SCORE;
          messageLog += ` ตอบเร็ว! +${QUICK_ANSWER_BONUS_SCORE} คะแนน! ⚡`;
      }
      
      newPlayerStats.score += scoreChange;
      setCurrentPlayerStats(newPlayerStats);
      setCurrentEnemyHp(newEnemyHp);
      setMessage(messageLog);

      setTimeout(() => {
        if (newEnemyHp <= 0) {
          messageLog = `${stage.enemyName} ถูกปราบแล้ว! 🎉`;
          if (stage.specialAbility === 'onDefeatDamage' && stage.abilityValue) {
            const defeatDamage = stage.abilityValue;
            messageLog += ` ${stage.enemyName} ปลดปล่อยพลังสุดท้าย! คุณเสีย ${defeatDamage} HP! 💥`;
            triggerAnimation('player', 'animate-shake', 300);
            triggerCombatEffect('player', 'damage', defeatDamage);
            newPlayerStats.hp = Math.max(0, newPlayerStats.hp - defeatDamage);
            setCurrentPlayerStats({...newPlayerStats});

            if (newPlayerStats.hp <= 0) {
              setMessage(messageLog + ' ...คุณพ่ายแพ้ในที่สุด 💔');
              setIsProcessing(false);
              setTimeout(() => onCombatEnd('lose', newPlayerStats, newPlayerStats.score - playerStats.score), 2000);
              return; 
            }
          }
          setMessage(messageLog);
          setIsProcessing(false);
          setTimeout(() => onCombatEnd('win', newPlayerStats, newPlayerStats.score - playerStats.score), 2000);
        } else {
          advanceToNextProblemOrEnd(newPlayerStats.hp, newPlayerStats, true);
        }
      }, 1800);

    } else { // Incorrect answer
      const damageTaken = ENEMY_ATTACK_POWER + Math.floor(Math.random() * 6);
      newPlayerStats.hp = Math.max(0, newPlayerStats.hp - damageTaken);
      
      messageLog = `โอ๊ะ! ตอบผิด ❌ ${stage.enemyName} โจมตี! คุณเสีย HP ${damageTaken}`;
      triggerAnimation('enemy', 'animate-attack-enemy', 500);
      triggerAnimation('player', 'animate-shake', 450);
      triggerCombatEffect('player', 'damage', damageTaken);

      scoreChange = -5; 
      newPlayerStats.score = Math.max(0, newPlayerStats.score + scoreChange);
      
      if(isPowerStrikeActive){
          messageLog += " พลังโจมตีพิเศษสลายไป... 💨";
          newPlayerStats.focus = 0; 
          setIsPowerStrikeActive(false);
      }

      setCurrentPlayerStats(newPlayerStats);
      setMessage(messageLog);

      setTimeout(() => {
         advanceToNextProblemOrEnd(newPlayerStats.hp, newPlayerStats, false);
      }, 1800);
    }
  }, [
      isAnswered, isProcessing, currentProblem, currentPlayerStats, currentEnemyHp, 
      stage, playerStats.score, onCombatEnd, 
      triggerAnimation, triggerCombatEffect, isPowerStrikeActive, timeLeft, advanceToNextProblemOrEnd
    ]);

  const handleUseHint = useCallback(() => {
    if (currentPlayerStats.hints > 0 && !isAnswered && !isProcessing && !isPowerStrikeActive) {
      setCurrentPlayerStats(prev => ({ ...prev, hints: prev.hints - 1, score: Math.max(0, prev.score - 2) }));
      setShowHint(true);
      setMessage('คำใบ้ถูกใช้แล้ว! ตัวเลือกที่ถูกต้องจะถูกเปิดเผย 💡');
    }
  }, [currentPlayerStats.hints, isAnswered, isProcessing, isPowerStrikeActive]);

  const handleUsePotion = useCallback(() => {
    if (currentPlayerStats.potions > 0 && currentPlayerStats.hp < currentPlayerStats.maxHp && !isAnswered && !isProcessing && !isPowerStrikeActive) {
      const healedAmount = Math.min(POTION_HEAL_AMOUNT, currentPlayerStats.maxHp - currentPlayerStats.hp);
      setCurrentPlayerStats(prev => ({
        ...prev,
        potions: prev.potions - 1,
        hp: prev.hp + healedAmount,
      }));
      setMessage(`ใช้ยาเพิ่มพลัง! ฟื้นฟู ${healedAmount} HP! ❤️`);
      triggerAnimation('player', 'animate-heal', 800);
      triggerCombatEffect('player', 'heal', healedAmount);
    }
  }, [currentPlayerStats.potions, currentPlayerStats.hp, currentPlayerStats.maxHp, isAnswered, isProcessing, triggerAnimation, triggerCombatEffect, isPowerStrikeActive]);

  const handleUsePowerStrike = useCallback(() => {
      if (currentPlayerStats.focus >= currentPlayerStats.maxFocus && !isPowerStrikeActive && !isAnswered && !isProcessing) {
          setIsPowerStrikeActive(true);
          setMessage("เตรียมใช้โจมตีพิเศษ! ตอบคำถามต่อไปให้ถูกเพื่อพลังทำลายล้างมหาศาล! ✨");
      }
  }, [currentPlayerStats.focus, currentPlayerStats.maxFocus, isPowerStrikeActive, isAnswered, isProcessing]);


  if (!currentProblem) {
    return <div className="p-4 sm:p-8 text-center text-lg sm:text-xl">กำลังโหลดข้อมูลด่าน หรือด่านนี้ไม่มีโจทย์...</div>;
  }
  
  const timerPercentage = (timeLeft / COMBAT_TIMER_DURATION) * 100;

  return (
    <div className={`p-2 xs:p-3 sm:p-4 md:p-5 rounded-lg min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-80px)] flex flex-col ${stage.backgroundStyle} bg-opacity-80`}>
      {/* Companion & Message Bar */}
      <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-black/50 text-white rounded-lg shadow-xl text-center backdrop-blur-sm">
        <p className="text-[0.7rem] xs:text-xs sm:text-sm italic leading-tight mb-1">{companionMessage}</p>
        <p className="text-xs xs:text-sm sm:text-base font-semibold min-h-[1.5em] sm:min-h-[1.8em] leading-tight">{message || `คำถามที่ ${currentProblemIndex + 1}/${stage.numProblems}`}</p>
      </div>

      {/* Player & Enemy Display Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 items-stretch"> {/* items-stretch for equal height cards */}
        <PlayerStatusDisplay 
            stats={currentPlayerStats} 
            onUseHint={handleUseHint} 
            onUsePotion={handleUsePotion}
            onUsePowerStrike={handleUsePowerStrike}
            isPowerStrikeActive={isPowerStrikeActive}
            isCombatScreen={true} 
            animation={playerAnimation}
            combatEffect={combatEffect?.target === 'player' ? combatEffect : null}
        />
        <EnemyDisplay 
            name={stage.enemyName} 
            sprite={stage.enemySprite} 
            hp={currentEnemyHp} 
            maxHp={stage.enemyMaxHp}
            animation={enemyAnimation}
            combatEffect={combatEffect?.target === 'enemy' ? combatEffect : null}
        />
      </div>

      {/* Problem Display Area - takes remaining space */}
      <div className="flex-grow flex flex-col justify-center">
        <ProblemDisplay 
          problem={currentProblem} 
          onAnswer={handleAnswer}
          selectedAnswer={selectedAnswer}
          revealAnswer={showHint}
          isAnswered={isAnswered || isProcessing}
        />
      </div>
      
      {/* Timer Area */}
      <div className="mt-1 sm:mt-2 text-center">
        <div className="flex justify-between items-center px-1">
            <p className="text-xs sm:text-sm font-semibold text-slate-700">เวลา: {timeLeft} วินาที</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-700">คำถาม {currentProblemIndex + 1}/{stage.numProblems}</p>
        </div>
        <div className="timer-bar-container">
          <div className="timer-bar" style={{ width: `${timerPercentage}%` }}></div>
        </div>
      </div>
      
      {/* Retreat Button Area */}
      <div className="mt-2 sm:mt-3 text-center">
        <Button 
            onClick={() => onCombatEnd('retreat', currentPlayerStats, 0)} 
            variant="danger"
            size="sm"
            disabled={isProcessing}
            icon="🏳️"
        >
          หนีกลับแผนที่
        </Button>
      </div>
    </div>
  );
};

export default CombatScreen;
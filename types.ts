
export enum GameScreen {
  MAIN_MENU = 'MAIN_MENU',
  ADVENTURE_MAP = 'ADVENTURE_MAP',
  COMBAT = 'COMBAT',
  STAGE_CLEAR = 'STAGE_CLEAR',
  GAME_OVER = 'GAME_OVER',
  GAME_VICTORY = 'GAME_VICTORY',
  TUTORIAL = 'TUTORIAL',
  CUTSCENE = 'CUTSCENE',
}

export enum Operation {
  ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = '×',
  DIVIDE = '÷',
}

export type EnemySpecialAbility = 'onDefeatDamage' | 'damageResist' | 'hpDrain' | 'attackUpOnHit'; // Added more example abilities

export interface Problem {
  id: string;
  text: string;
  operand1: number;
  operand2: number;
  operation: Operation;
  correctAnswer: number;
  options: number[];
}

export interface DialogueLine {
  speakerSprite?: string;
  speakerName: string;
  text: string;
}

export interface Stage {
  id: string;
  name: string;
  worldName: string;
  description: string;
  operation: Operation | 'MIXED'; // Thematic operation for problem generation
  problems: Problem[]; // Sequence of questions for this stage's enemy
  
  enemyName: string;
  enemySprite: string;
  enemyMaxHp: number; // Total HP for this stage's enemy
  specialAbility?: EnemySpecialAbility;
  abilityValue?: number;
  numProblems: number; // Number of questions for this enemy

  companion: {
    name: string;
    advice: string; 
    sprite: string;
  };
  backgroundStyle: string;
  mapIcon: string;
  introDialogue?: DialogueLine[];
  outroDialogueWin?: DialogueLine[];
  outroDialogueLose?: DialogueLine[];
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  score: number;
  hints: number;
  potions: number;
  focus: number;
  maxFocus: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  effect: (stats: PlayerStats) => PlayerStats; 
  icon: string;
}

// For Cutscene System
export interface CutsceneElement {
  type: 'character' | 'text';
  sprite?: string; 
  name?: string; 
  text?: string; 
  positionClasses: string; // Tailwind CSS classes for positioning
  animationClasses?: string; // Tailwind CSS classes for animation (e.g., 'animate-fade-in')
}

export interface CutsceneFrame {
  id: string;
  backgroundStyle: string; // Full class string e.g. 'bg-blue-500' or 'bg-gradient-to-r from-purple-500 to-pink-500'
  elements: CutsceneElement[];
  autoAdvanceDelay?: number; // Optional: time in ms to auto-advance to next frame
}

export type Cutscene = CutsceneFrame[]; // Defines a cutscene as an array of frames
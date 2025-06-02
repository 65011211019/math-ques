
import { Stage, Operation, Problem, PlayerStats, EnemySpecialAbility, DialogueLine, Cutscene, CutsceneFrame } from './types';

export const INITIAL_PLAYER_STATS: PlayerStats = {
  hp: 100,
  maxHp: 100,
  score: 0,
  hints: 3,
  potions: 2,
  focus: 0,
  maxFocus: 100,
};

export const POTION_HEAL_AMOUNT = 30;
export const COMBAT_TIMER_DURATION = 25; // Increased slightly
export const TIMER_PENALTY_DAMAGE = 10;

export const FOCUS_GAIN_ON_CORRECT = 20; // Adjusted
export const POWER_STRIKE_DAMAGE_MULTIPLIER = 1.6; // Adjusted
export const QUICK_ANSWER_THRESHOLD_SECONDS = 7; // Adjusted
export const QUICK_ANSWER_BONUS_SCORE = 5; // Adjusted

const getProblemSignature = (operand1: number, operand2: number, operation: Operation): string => {
  if (operation === Operation.ADD || operation === Operation.MULTIPLY) {
    return `${operation}_${Math.min(operand1, operand2)}_${Math.max(operand1, operand2)}`;
  }
  return `${operation}_${operand1}_${operand2}`;
};

// Generates a sequence of problems for a single enemy in a stage
function generateProblemsForStage(
  stageIdPrefix: string, // e.g., "s1"
  op: Operation | 'MIXED',
  numProblemsToGenerate: number,
  globalGeneratedProblemSignatures: Set<string>,
  problemDifficultyMultiplier: number = 1 // For scaling difficulty in later stages
): Problem[] {
  const problems: Problem[] = [];
  const stageSpecificSignatures = new Set<string>();
  const MAX_UNIQUE_ATTEMPTS_PER_PROBLEM = 100;

  for (let i = 0; i < numProblemsToGenerate; i++) {
    let operand1: number = 0, operand2: number = 0, correctAnswer: number = 0, text: string = '';
    let currentOperation = op;
    let attempts = 0;
    let problemSignature: string = '';
    let isProblemUnique = false;

    while (!isProblemUnique && attempts < MAX_UNIQUE_ATTEMPTS_PER_PROBLEM) {
      attempts++;
      if (op === 'MIXED') {
        const ops = [Operation.ADD, Operation.SUBTRACT, Operation.MULTIPLY, Operation.DIVIDE];
        currentOperation = ops[Math.floor(Math.random() * ops.length)];
      }

      let baseOperandRange = 20 * problemDifficultyMultiplier;
      let maxResult = 100 * problemDifficultyMultiplier;
      
      if (problemDifficultyMultiplier > 1.5) maxResult = 150 * problemDifficultyMultiplier;
      if (problemDifficultyMultiplier > 2.5) maxResult = 200 * problemDifficultyMultiplier;


      switch (currentOperation) {
        case Operation.ADD:
          operand1 = Math.floor(Math.random() * (baseOperandRange * 2)) + 1;
          operand2 = Math.floor(Math.random() * (baseOperandRange * 2)) + 1;
          if (operand1 + operand2 > maxResult) {
             operand2 = Math.max(1, Math.floor(Math.random() * (maxResult - operand1)));
             if (operand2 <=0) operand2 = 1;
          }
          correctAnswer = operand1 + operand2;
          text = `${operand1} + ${operand2} = ?`;
          break;
        case Operation.SUBTRACT:
          operand1 = Math.floor(Math.random() * maxResult) + Math.floor(baseOperandRange / 2) + 1;
          operand2 = Math.floor(Math.random() * (operand1 - 1)) + 1;
          if (operand2 >= operand1) operand2 = Math.max(1, operand1 - (Math.floor(Math.random()*5)+1));
          correctAnswer = operand1 - operand2;
          text = `${operand1} - ${operand2} = ?`;
          break;
        case Operation.MULTIPLY:
          let p1 = Math.floor(Math.random() * (10 + Math.floor(5 * problemDifficultyMultiplier))) + 1;
          let p2 = Math.floor(Math.random() * (10 + Math.floor(5 * problemDifficultyMultiplier))) + 1;
          if (p1 * p2 > maxResult) {
            p2 = Math.max(1, Math.floor(maxResult / p1));
          }
          if (p1 * p2 === 0) { p1 = Math.max(1, p1); p2 = Math.max(1, p2); }

          operand1 = p1;
          operand2 = p2;
          correctAnswer = operand1 * operand2;
          text = `${operand1} ${Operation.MULTIPLY} ${operand2} = ?`;
          break;
        case Operation.DIVIDE:
          let d_divisor = Math.floor(Math.random() * (10 + Math.floor(5*problemDifficultyMultiplier))) + 2;
          let d_quotient = Math.floor(Math.random() * (12 + Math.floor(5*problemDifficultyMultiplier))) + 1;
          if (d_quotient * d_divisor > maxResult) {
             d_quotient = Math.max(1, Math.floor(maxResult/d_divisor));
          }
          if (d_quotient * d_divisor === 0) {d_quotient = Math.max(1,d_quotient); d_divisor = Math.max(2,d_divisor);}
          
          operand1 = d_quotient * d_divisor;
          operand2 = d_divisor;
          correctAnswer = d_quotient;
          text = `${operand1} ${Operation.DIVIDE} ${operand2} = ?`;
          break;
        default: // Fallback to ADD
          operand1 = Math.floor(Math.random() * 20) + 1;
          operand2 = Math.floor(Math.random() * 20) + 1;
          correctAnswer = operand1 + operand2;
          text = `${operand1} + ${operand2} = ?`;
          currentOperation = Operation.ADD;
      }
      problemSignature = getProblemSignature(operand1, operand2, currentOperation as Operation);
      if (!stageSpecificSignatures.has(problemSignature) && !globalGeneratedProblemSignatures.has(problemSignature)) {
        isProblemUnique = true;
      }
    }

    if (isProblemUnique) {
      stageSpecificSignatures.add(problemSignature);
      globalGeneratedProblemSignatures.add(problemSignature);

      const options: number[] = [correctAnswer];
      while (options.length < 4) {
        let wrongOption;
        const delta = Math.floor(Math.random() * (10 + 5 * problemDifficultyMultiplier)) + 1;
        const plusMinus = Math.random() < 0.5 ? 1 : -1;
        if (Math.random() < 0.7) {
          wrongOption = correctAnswer + (delta * plusMinus);
        } else {
          wrongOption = Math.floor(Math.random() * Math.max(10, correctAnswer + (20 * problemDifficultyMultiplier))) + 1;
        }
        if (wrongOption <=0 && correctAnswer > 0) wrongOption = correctAnswer + delta;
        else if (wrongOption <= 0 && correctAnswer <=0) wrongOption = correctAnswer + delta + (correctAnswer === 0 ? 1 : 0);
        if (wrongOption === correctAnswer || options.includes(wrongOption)) continue;
        options.push(wrongOption);
      }
      problems.push({
        id: `${stageIdPrefix}-q${i}`,
        text,
        operand1,
        operand2,
        operation: currentOperation as Operation,
        correctAnswer,
        options: options.sort(() => Math.random() - 0.5),
      });
    } else {
      console.warn(`Could not generate unique problem for question ${i} in stage ${stageIdPrefix} after ${MAX_UNIQUE_ATTEMPTS_PER_PROBLEM} attempts. Stage might have fewer problems than intended.`);
    }
  }
  return problems;
}

// Define an intermediate type for stage configuration that includes problemDifficultyMultiplier
type StageConfigWithDifficulty = Omit<Stage, 'problems'> & {
  problemDifficultyMultiplier?: number;
};


export function initializeGameStages(): Stage[] {
  const globalGeneratedProblemSignatures = new Set<string>();

  const stagesData: StageConfigWithDifficulty[] = [
    // --- STAGE 1 ---
    {
      id: 's1', name: 'ด่านที่ 1: ชายป่าเริ่มต้น', worldName: 'ชายป่าแห่ง Numeria',
      description: 'ก้าวแรกสู่การเป็นนักเวทคณิตศาสตร์! สัตว์ประหลาดตัวน้อยรอท้าทายการบวกของเจ้าอยู่',
      operation: Operation.ADD, numProblems: 3, enemyName: 'สไลม์น้อยจอมซน', enemySprite: '🐌', enemyMaxHp: 40,
      companion: { name: 'ภูตน้อยเริ่มต้น', advice: 'การบวกคือพื้นฐาน! รวมตัวเลขให้ถูกต้องเพื่อปล่อยพลังเวท!', sprite: '✨' },
      backgroundStyle: 'bg-green-100 border-green-500', mapIcon: '🌳',
      introDialogue: [
        { speakerSprite: '✨', speakerName: 'ภูตน้อย', text: 'ยินดีต้อนรับ นักเวทฝึกหัด! ข้าคือภูตนำทางของเจ้า ที่นี่คือชายป่าแห่ง Numeria ที่ซึ่งการผจญภัยของเจ้าเริ่มต้น!' },
        { speakerSprite: '✨', speakerName: 'ภูตน้อย', text: 'ดูนั่นสิ! สไลม์น้อยกำลังขวางทางเราอยู่ จงใช้พลังการบวกที่เจ้าเรียนมาเพื่อจัดการมัน!' },
        { speakerSprite: '🧙', speakerName: 'นักเวทฝึกหัด', text: 'เข้าใจแล้ว! ข้าจะพยายาม!' }
      ],
      outroDialogueWin: [ { speakerSprite: '✨', speakerName: 'ภูตน้อย', text: 'เยี่ยมมาก! เจ้ามีแววเป็นนักเวทผู้ยิ่งใหญ่! เตรียมตัวให้พร้อมสำหรับความท้าทายต่อไปนะ!' } ],
      outroDialogueLose: [ { speakerSprite: '✨', speakerName: 'ภูตน้อย', text: 'ไม่เป็นไรนะ! การพ่ายแพ้คือบทเรียน สู้ๆ!' } ]
    },
    // --- STAGE 2 ---
    {
      id: 's2', name: 'ด่านที่ 2: ลำธารกระซิบ', worldName: 'ลำธารแห่งการลบ',
      description: 'เสียงกระซิบจากลำธารท้าทายทักษะการลบของเจ้า ค้างคาวเจ้าเล่ห์เฝ้ารออยู่!',
      operation: Operation.SUBTRACT, numProblems: 4, enemyName: 'ค้างคาวหินจอมกวน', enemySprite: '🦇', enemyMaxHp: 55,
      specialAbility: 'damageResist', abilityValue: 1,
      companion: { name: 'ภูตน้อยเริ่มต้น', advice: 'การลบคือการหาผลต่าง! ศัตรูตัวนี้อาจมีเกราะป้องกันเล็กน้อย!', sprite: '✨' },
      backgroundStyle: 'bg-blue-100 border-blue-500', mapIcon: '🏞️',
      introDialogue: [
        { speakerSprite: '✨', speakerName: 'ภูตน้อย', text: 'เรามาถึงลำธารกระซิบแล้ว... ว่ากันว่ามีค้างคาวนิสัยไม่ดีชอบแกล้งนักเดินทางแถวนี้' },
        { speakerSprite: '🦇', speakerName: 'ค้างคาวหิน', text: 'ใครกันที่มารบกวนเวลาพักผ่อนของข้า! เตรียมตัวโดนดีซะเถอะ!' },
      ],
      outroDialogueWin: [ { speakerSprite: '✨', speakerName: 'ภูตน้อย', text: 'ยอดไปเลย! เจ้าจัดการค้างคาวเกราะบางได้สำเร็จ! ทักษะการลบของเจ้าพัฒนาขึ้นมาก!' } ],
      outroDialogueLose: [ { speakerSprite: '✨', speakerName: 'ภูตน้อย', text: 'พยายามอีกหน่อยนะ! การลบอาจจะซับซ้อน แต่เจ้าทำได้!'}]
    },
    // --- STAGE 3 ---
    {
      id: 's3', name: 'ด่านที่ 3: ป่าลึกพิศวง', worldName: 'ป่าคูณอาถรรพ์',
      description: 'ในป่าลึก พลังแห่งการคูณจะถูกทดสอบ ก็อบลินจอมเวทใช้พลังทวีคูณโจมตี!',
      operation: Operation.MULTIPLY, numProblems: 4, enemyName: 'ก็อบลินนักคูณ', enemySprite: '👺', enemyMaxHp: 70,
      companion: { name: 'ภูตพฤกษา', advice: 'การคูณทำให้พลังเพิ่มทวีคูณ! จงระวังพลังของมันให้ดี!', sprite: '🌳' },
      backgroundStyle: 'bg-yellow-100 border-yellow-500', mapIcon: '🌲',
      introDialogue: [
        { speakerSprite: '🌳', speakerName: 'ภูตพฤกษา', text: 'ยินดีต้อนรับสู่ป่าของข้า นักเวทน้อย... ข้าสัมผัสได้ถึงพลังที่แข็งแกร่งจากตัวเจ้า แต่ระวังก็อบลินที่นี่ด้วย มันเชี่ยวชาญเวทมนตร์การคูณ'},
        { speakerSprite: '👺', speakerName: 'ก็อบลินนักคูณ', text: 'ฮ่าๆๆ! เหยื่อใหม่มาแล้ว! พลังของข้าจะทวีคูณจนเจ้าต้องร้องขอชีวิต!'}
      ],
      outroDialogueWin: [ { speakerSprite: '🌳', speakerName: 'ภูตพฤกษา', text: 'เหลือเชื่อ! เจ้าเอาชนะเวทการคูณของมันได้! เจ้าแข็งแกร่งขึ้นมากจริงๆ' } ],
      outroDialogueLose: [ { speakerSprite: '🌳', speakerName: 'ภูตพฤกษา', text: 'เวทการคูณของมันร้ายกาจนัก ตั้งสติแล้วลองใหม่นะ'}]
    },
    // --- STAGE 4 ---
    {
      id: 's4', name: 'ด่านที่ 4: ถ้ำผลึกสะท้อน', worldName: 'ถ้ำหารส่วน',
      description: 'ถ้ำผลึกลึกลับท้าทายด้วยปริศนาการหาร ปีศาจแมงมุมรอแบ่งส่วนพลังของเจ้า!',
      operation: Operation.DIVIDE, numProblems: 5, enemyName: 'แมงมุมผลึกจอมแบ่ง', enemySprite: '🕷️', enemyMaxHp: 80,
      companion: { name: 'ภูตพฤกษา', advice: 'การหารคือการแบ่งส่วนอย่างยุติธรรม! จงหาว่าแต่ละส่วนมีค่าเท่าใด!', sprite: '🌳' },
      backgroundStyle: 'bg-indigo-100 border-indigo-500', mapIcon: '💠',
      introDialogue: [
        { speakerSprite: '🌳', speakerName: 'ภูตพฤกษา', text: 'ข้างหน้าคือถ้ำผลึก ที่นั่นมีแมงมุมร้ายกาจเฝ้าอยู่ มันชอบใช้พลังการหารทำให้นักเดินทางสับสน'},
        { speakerSprite: '🧙', speakerName: 'นักเวทฝึกหัด', text: 'ข้าจะไม่ยอมให้มันมาขวางทางข้าแน่!'}
      ],
      outroDialogueWin: [ { speakerSprite: '🌳', speakerName: 'ภูตพฤกษา', text: 'การหารก็ไม่อาจต้านทานเจ้าได้! เจ้าพร้อมสำหรับความท้าทายที่ใหญ่ขึ้นแล้ว!' } ],
      outroDialogueLose: [ { speakerSprite: '🌳', speakerName: 'ภูตพฤกษา', text: 'ใยของมันซับซ้อนเหมือนโจทย์การหารเลยสินะ ลองดูอีกครั้ง!'}]
    },
    // --- STAGE 5 ---
    {
      id: 's5', name: 'ด่านที่ 5: ที่ราบสูงคำราม', worldName: 'ที่ราบสูงแห่งการทดสอบ',
      description: 'บททดสอบแรกจากแม่ทัพของราชาเลขลบ! ต้องใช้ทุกทักษะที่เรียนมา!',
      operation: 'MIXED', numProblems: 5, enemyName: 'ออร์คหัวหน้าหน่วย', enemySprite: '🐗', enemyMaxHp: 100,
      specialAbility: 'attackUpOnHit', abilityValue: 2, // Gets stronger each time it hits player
      companion: { name: 'นักปราชญ์โบราณ', advice: 'ศัตรูตัวนี้แข็งแกร่งและใช้หลายศาสตร์! รอบคอบเข้าไว้!', sprite: '🦉' },
      backgroundStyle: 'bg-red-100 border-red-500', mapIcon: '⛰️',
      introDialogue: [
        { speakerSprite: '🦉', speakerName: 'นักปราชญ์โบราณ', text: 'เจ้าหนู... ข้าคือนักปราชญ์ผู้เฝ้าดูดินแดนนี้มานาน เจ้าได้แสดงให้เห็นถึงศักยภาพที่ยิ่งใหญ่' },
        { speakerSprite: '🦉', speakerName: 'นักปราชญ์โบราณ', text: 'แต่ข้างหน้านั่นคือ ออร์คหัวหน้าหน่วย หนึ่งในขุนพลของราชาเลขลบ มันจะทดสอบทุกสิ่งที่เจ้าได้เรียนมา!' },
        { speakerSprite: '🐗', speakerName: 'ออร์คหัวหน้าหน่วย', text: 'โฮกกก! เจ้ากล้าดียังไงมาถึงที่นี่! ข้าจะบดขยี้เจ้าซะ!'}
      ],
      outroDialogueWin: [ { speakerSprite: '🦉', speakerName: 'นักปราชญ์โบราณ', text: 'น่าทึ่งมาก! เจ้าล้มออร์คหัวหน้าหน่วยได้! แสดงว่าเจ้าพร้อมที่จะเผชิญหน้ากับอันตรายที่ใหญ่หลวงกว่านี้แล้ว' } ],
      outroDialogueLose: [ { speakerSprite: '🦉', speakerName: 'นักปราชญ์โบราณ', text: 'มันแข็งแกร่งมาก... การพ่ายแพ้ครั้งนี้จงเป็นบทเรียนอันล้ำค่า' } ]
    },
    // --- STAGE 6 ---
    {
      id: 's6', name: 'ด่านที่ 6: ทะเลทรายลวงตา', worldName: 'ทะเลทรายอนันต์',
      description: 'ภาพลวงตาและความร้อนระอุ ทดสอบสมาธิและเลขคณิตขั้นสูง',
      operation: 'MIXED', numProblems: 6, enemyName: 'ภูติทรายมายา', enemySprite: '🏜️', enemyMaxHp: 120,
      specialAbility: 'hpDrain', abilityValue: 3, // Drains HP each turn
      companion: { name: 'นักปราชญ์โบราณ', advice: 'อย่าหลงกลภาพลวงตา! มีสมาธิกับโจทย์!', sprite: '🦉' },
      backgroundStyle: 'bg-orange-100 border-orange-500', mapIcon: '🌵',
      introDialogue: [{speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'ทะเลทรายนี้เต็มไปด้วยปริศนาและภาพลวงตา จงมีสมาธิให้มั่น!'}],
      outroDialogueWin: [{speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'เจ้าผ่านการทดสอบแห่งทะเลทรายมาได้! ความมุ่งมั่นของเจ้าน่าชื่นชม'}],
      outroDialogueLose: [{speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'ภาพลวงตามันแข็งแกร่งกว่าที่คิด ลองอีกครั้งนะ บางทีเจ้าอาจมองเห็นคำตอบที่ซ่อนอยู่'}]
    },
    // --- STAGE 7 ---
    {
      id: 's7', name: 'ด่านที่ 7: หอคอยเมฆา', worldName: 'หอคอยสู่สวรรค์',
      description: 'ปีนหอคอยสูงเสียดฟ้า ที่ซึ่งโจทย์ซับซ้อนและลมแรง',
      operation: 'MIXED', numProblems: 6, enemyName: 'กริฟฟินเวหา', enemySprite: '🦅', enemyMaxHp: 130,
      problemDifficultyMultiplier: 1.2,
      companion: { name: 'นักปราชญ์โบราณ', advice: 'ยิ่งสูงยิ่งหนาวโจทย์ยิ่งยาก! ระวังกรงเล็บของมันด้วย!', sprite: '🦉' },
      backgroundStyle: 'bg-sky-200 border-sky-600', mapIcon: '☁️',
      introDialogue: [
        { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'หอคอยเมฆานี้สูงเสียดฟ้า ว่ากันว่าผู้ใดพิชิตได้ จะเข้าใกล้ความจริงแห่งตัวเลข'},
        { speakerSprite:'🦅', speakerName:'กริฟฟินเวหา', text:'กรรร! ผู้ใดบุกรุกอาณาเขตของข้า! จงแสดงความสามารถของเจ้าซะ!'}
      ],
      outroDialogueWin: [{speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'เจ้าบินได้สูงกว่าที่คิด! กริฟฟินยอมรับในตัวเจ้าแล้ว'}],
      outroDialogueLose: [{speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'ลมพายุแห่งความสับสนพัดแรงไปหน่อยสินะ พักแล้วลองใหม่!'}]
    },
    // --- STAGE 8 ---
    {
      id: 's8', name: 'ด่านที่ 8: ภูเขาไฟคำราม', worldName: 'แก่นภูเขาไฟพิโรธ',
      description: 'ลาวาร้อนระอุและปริศนาเลขคณิตที่แผดเผา ปะทะภูตอัคคีผู้พิทักษ์',
      operation: 'MIXED', numProblems: 6, enemyName: 'ภูตอัคคีโกรธา', enemySprite: '🔥', enemyMaxHp: 140,
      problemDifficultyMultiplier: 1.3,
      companion: { name: 'นักปราชญ์โบราณ', advice: 'ความร้อนแรงของภูเขาไฟนี้ ทดสอบสติปัญญาของเจ้า! ระวังการโจมตีที่รุนแรง', sprite: '🦉' },
      backgroundStyle: 'bg-red-200 border-red-600', mapIcon: '🌋',
      introDialogue: [
        { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'ระวังไอความร้อนนะนักเวทน้อย! ที่นี่คือแก่นภูเขาไฟ ที่มีภูตอัคคีเฝ้าอยู่!'},
        { speakerSprite:'🔥', speakerName:'ภูตอัคคี', text:'ฟู่่ววว! ผู้ใดกล้ารบกวนการพักผ่อนของข้า! จงมอดไหม้ไปกับความโกรธาแห่งข้าเสีย!'}
      ],
      outroDialogueWin: [ { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'เจ้าดับไฟโกรธาของมันได้! เก่งมาก! ความเย็นแห่งปัญญาของเจ้าช่างน่ากลัว!'} ],
      outroDialogueLose: [ { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'ความร้อนแรงของมันอาจทำให้สับสน ลองทำใจให้เย็นแล้วสู้ใหม่อีกครั้งนะ'} ]
    },
    // --- STAGE 9 ---
    {
      id: 's9', name: 'ด่านที่ 9: วิหารใต้สมุทร', worldName: 'นครบาดาลลึกลับ',
      description: 'ไขปริศนาแห่งท้องทะเลลึก เผชิญหน้ากับผู้พิทักษ์วิหารโบราณใต้เกลียวคลื่น',
      operation: 'MIXED', numProblems: 7, enemyName: 'พรายน้ำผู้พิทักษ์วิหาร', enemySprite: '🦑', enemyMaxHp: 160,
      specialAbility: 'hpDrain', abilityValue: 4,
      problemDifficultyMultiplier: 1.4,
      companion: { name: 'นักปราชญ์โบราณ', advice: 'ความลับของวิหารนี้ถูกซ่อนไว้ด้วยตัวเลข จงมีสมาธิภายใต้แรงกดดันของน้ำลึก!', sprite: '🦉' },
      backgroundStyle: 'bg-teal-200 border-teal-600', mapIcon: '🌊',
      introDialogue: [
        { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'วิหารใต้น้ำนี้มีความลับมากมาย... และผู้พิทักษ์ที่น่าเกรงขามรออยู่'},
        { speakerSprite:'🦑', speakerName:'พรายน้ำ', text:'ซู่...ซ่า... ผู้ใดล่วงล้ำเข้ามาในอาณาเขตศักดิ์สิทธิ์ของข้า... จงแสดงปัญญาของเจ้าหรือจมดิ่งสู่ก้นบึ้ง'}
      ],
      outroDialogueWin: [ { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'เจ้าไขความลับของวิหารได้แล้ว! กระแสน้ำแห่งความรู้ไหลเวียนในตัวเจ้า'} ],
      outroDialogueLose: [ { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'พลังน้ำวนของมันอาจทำให้สับสน ลองตั้งสติแล้วดำดิ่งลงไปแก้มืออีกครั้ง'} ]
    },
    // --- STAGE 10 ---
    {
      id: 's10', name: 'ด่านที่ 10: ป้อมปราการมืด', worldName: 'ป้อมปราการขุนพลทมิฬ',
      description: 'เผชิญหน้ากับขุนพลอีกคนของราชาเลขลบ การต่อสู้ที่ดุเดือด!',
      operation: 'MIXED', numProblems: 7, enemyName: 'อัศวินดำแห่งความสิ้นหวัง', enemySprite: '🐴', enemyMaxHp: 200,
      specialAbility: 'onDefeatDamage', abilityValue: 20, problemDifficultyMultiplier: 1.5,
      companion: { name: 'นักปราชญ์โบราณ', advice: 'นี่คือการทดสอบครั้งสำคัญ! พลังของเขาแข็งแกร่งมาก!', sprite: '🦉' },
      backgroundStyle: 'bg-gray-700 border-gray-900', mapIcon: ' крепость', // Russian for fortress, example icon
      introDialogue: [
        { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'ป้อมปราการนี้คือที่มั่นของอัศวินดำ ขุนพลผู้ภักดีต่อราชาเลขลบ! จงระวังให้ดี!'},
        { speakerSprite:'🐴', speakerName:'อัศวินดำ', text:'เจ้ากล้าดียังไงมาถึงที่นี่! ความสิ้นหวังจะกลืนกินเจ้า!'}
      ],
      outroDialogueWin: [{speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'แสงแห่งความหวังของเจ้าแข็งแกร่งกว่าความมืดของเขา! ยอดเยี่ยม!'}],
      outroDialogueLose: [{speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'เงาทมิฬของเขายังคงแข็งแกร่ง แต่อย่ายอมแพ้! แสงสว่างยังรออยู่'}]
    },
    // --- STAGE 11 ---
    {
      id: 's11', name: 'ด่านที่ 11: สุสานกษัตริย์ถูกลืม', worldName: 'หุบเขาแห่งความเงียบงัน',
      description: 'ปลุกวิญญาณโบราณที่หลับใหลด้วยพลังคณิตศาสตร์ของคุณ สุสานนี้เต็มไปด้วยอาถรรพ์!',
      operation: 'MIXED', numProblems: 7, enemyName: 'ฟาโรห์อาคมโบราณ', enemySprite: '👻', enemyMaxHp: 220,
      specialAbility: 'onDefeatDamage', abilityValue: 25,
      problemDifficultyMultiplier: 1.6,
      companion: { name: 'นักปราชญ์โบราณ', advice: 'วิญญาณในสุสานนี้ยังคงผูกพันกับตัวเลข จงปลดปล่อยพวกเขาด้วยปัญญา!', sprite: '🦉' },
      backgroundStyle: 'bg-yellow-200 border-yellow-700',
      mapIcon: '⚰️',
      introDialogue: [
        { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'สุสานนี้ถูกลืมเลือนไปตามกาลเวลา... แต่พลังงานลึกลับและอาถรรพ์ยังคงอยู่'},
        { speakerSprite:'👻', speakerName:'ฟาโรห์', text:'ใคร...ใครกล้าปลุกข้าจากการหลับใหลอันยาวนาน... จงตอบคำถามข้า...หรือรับคำสาปแห่งข้าไป!'}
      ],
      outroDialogueWin: [ { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'วิญญาณได้รับการปลดปล่อยแล้ว ขอบใจเจ้ามากที่นำทางพวกเขาด้วยแสงแห่งคณิตศาสตร์'} ],
      outroDialogueLose: [ { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'อาถรรพ์ของฟาโรห์ยังคงรุนแรง ลองอีกครั้ง บางทีเจ้าอาจจะถอดรหัสคำสาปได้'} ]
    },
    // --- STAGE 12 ---
    {
      id: 's12', name: 'ด่านที่ 12: นครเมฆาลอยฟ้า', worldName: 'อาณาจักรเหนือเมฆ',
      description: 'นครสูงเสียดฟ้าที่ปกป้องด้วยผู้พิทักษ์เวหา โจทย์เลขจะซับซ้อนดุจสายลม',
      operation: 'MIXED', numProblems: 8, enemyName: 'อสูรเวหาพิทักษ์นคร', enemySprite: '🌪️', enemyMaxHp: 240,
      problemDifficultyMultiplier: 1.75,
      companion: { name: 'นักปราชญ์โบราณ', advice: 'ณ ที่สูงแห่งนี้ สติปัญญาคืออาวุธที่สำคัญที่สุด! ระวังพายุตัวเลขของมัน!', sprite: '🦉' },
      backgroundStyle: 'bg-sky-300 border-sky-700',
      mapIcon: '🏰',
      introDialogue: [
        { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'นครเมฆา... ว่ากันว่าเป็นที่สถิตของปัญญาโบราณ แต่ก็มีผู้พิทักษ์ที่แข็งแกร่งคอยดูแล'},
        { speakerSprite:'🌪️', speakerName:'อสูรเวหา', text:'ซู่วววว! เจ้ามนุษย์ตัวเล็ก กล้าดีอย่างไรมาถึงอาณาจักรของข้า! จงพิสูจน์ว่าเจ้าคู่ควร!'}
      ],
      outroDialogueWin: [ { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'เจ้าพิชิตนครเมฆาได้! ความรู้ของเจ้าเพิ่มพูนขึ้นอีกขั้น! สายลมแห่งปัญญานำทางเจ้า!'} ],
      outroDialogueLose: [ { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'พายุแห่งความสับสนของมันรุนแรงนัก ลองสงบจิตใจแล้วทะยานขึ้นไปใหม่'} ]
    },
    // --- STAGE 13 ---
    {
      id: 's13', name: 'ด่านที่ 13: ห้องทดลองของนักแปรธาตุวิปลาส', worldName: 'หอคอยนักแปรธาตุ',
      description: 'สูตรยาและส่วนผสมตัวเลขที่อันตราย! เผชิญหน้ากับสิ่งที่นักแปรธาตุสร้างขึ้น!',
      operation: 'MIXED', numProblems: 8, enemyName: 'สารผสมไม่เสถียร', enemySprite: '🧪', enemyMaxHp: 260,
      specialAbility: 'attackUpOnHit', abilityValue: 4,
      problemDifficultyMultiplier: 1.85,
      companion: { name: 'นักปราชญ์โบราณ', advice: 'นักแปรธาตุผู้นี้หลงใหลในตัวเลขที่ควบคุมไม่ได้! ระวังการเปลี่ยนแปลงของมัน!', sprite: '🦉' },
      backgroundStyle: 'bg-purple-200 border-purple-600',
      mapIcon: '⚗️',
      introDialogue: [
        { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'ห้องทดลองนี้เต็มไปด้วยพลังงานที่ไม่มั่นคง... ผลงานของนักแปรธาตุผู้หมกมุ่นในเลขศาสตร์'},
        { speakerSprite:'🧪', speakerName:'สารผสม', text:'ฟู่...ฟู่...ปุดๆ...คำนวณ...ไม่ถูกต้อง...!!'}
      ],
      outroDialogueWin: [ { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'เจ้าควบคุมความโกลาหลของมันได้! เหลือเชื่อจริงๆ! เจ้าเข้าใจสมการที่ซับซ้อนของมันแล้ว'} ],
      outroDialogueLose: [ { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'การทดลองของมันเปลี่ยนแปลงตลอดเวลา! จงปรับตัวแล้วลองใหม่นะ'} ]
    },
    // --- STAGE 14 ---
    {
      id: 's14', name: 'ด่านที่ 14: โถงทางเดินสุดท้าย', worldName: 'ก่อนพบราชา',
      description: 'ทางเดินสุดท้ายก่อนถึงตัวราชาเลขลบ ทหารองครักษ์ที่แข็งแกร่งที่สุดขวางทางอยู่',
      operation: 'MIXED', numProblems: 8, enemyName: 'โกเลมศิลาโบราณ', enemySprite: '🗿', enemyMaxHp: 280,
      specialAbility: 'damageResist', abilityValue: 5, problemDifficultyMultiplier: 2.0,
      companion: { name: 'นักปราชญ์โบราณ', advice: 'นี่คือปราการสุดท้ายก่อนถึงราชา! จงใช้ทุกสิ่งที่เจ้ามี!', sprite: '🦉' },
      backgroundStyle: 'bg-purple-300 border-purple-700', mapIcon: '🛡️',
      introDialogue: [
        { speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'โถงทางเดินนี้คือบททดสอบสุดท้ายก่อนเผชิญหน้ากับราชาเลขลบ โกเลมศิลานี้ถูกสร้างด้วยเวทโบราณ!'},
        { speakerSprite:'🗿', speakerName:'โกเลมศิลา', text:'ผู้...บุกรุก...จะต้อง...ไม่ผ่าน...!'}
      ],
      outroDialogueWin: [{speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'เจ้าทลายปราการศิลาได้! ราชาเลขลบรออยู่ข้างหน้าแล้ว!'}],
      outroDialogueLose: [{speakerSprite:'🦉', speakerName:'นักปราชญ์', text:'พลังป้องกันของมันแข็งแกร่งดุจหินผา แต่ทุกสิ่งย่อมมีจุดอ่อน ลองค้นหาดูใหม่นะ'}]
    },
    // --- STAGE 15 (Final Boss) ---
    {
      id: 's15', name: 'ด่านที่ 15: บัลลังก์ราชาเลขลบ', worldName: 'ปราสาททมิฬศูนย์กลาง',
      description: 'การเผชิญหน้าครั้งสุดท้าย! จงใช้ความรู้คณิตศาสตร์ทั้งหมดเพื่อโค่นราชาปีศาจเลขลบ!',
      operation: 'MIXED', numProblems: 10, // Example: 10 hard problems for the boss
      enemyName: 'ราชาปีศาจเลขลบ', enemySprite: '😈', enemyMaxHp: 500, // High HP
      specialAbility: 'onDefeatDamage', abilityValue: 25, // Final attack
      problemDifficultyMultiplier: 2.5, // Hardest problems
      companion: { name: 'นักปราชญ์โบราณ', advice: 'ถึงเวลาแล้วนักเวท! อนาคตของ Numeria อยู่ในมือเจ้า!', sprite: '🦉' },
      backgroundStyle: 'bg-black border-red-600', mapIcon: '👑',
      introDialogue: [
        { speakerSprite: '🦉', speakerName: 'นักปราชญ์โบราณ', text: 'ในที่สุด... เราก็มาถึงบัลลังก์ของมัน... ราชาปีศาจเลขลบ!' },
        { speakerSprite: '😈', speakerName: 'ราชาเลขลบ', text: 'ฮ่าๆๆๆ! เจ้าเด็กโง่เขลา! คิดหรือว่าจะมาหยุดข้าได้ง่ายๆ พลังแห่งความสับสนวุ่นวายทางตัวเลขของข้าจะกลืนกินเจ้า!' },
        { speakerSprite: '🧙', speakerName: 'นักเวทฝึกหัด', text: 'เพื่อสันติสุขของ Numeria! ข้าจะเอาชนะท่านให้ได้!' }
      ],
      outroDialogueWin: [
        { speakerSprite: '🧙', speakerName: 'นักเวทฝึกหัด', text: 'สำเร็จแล้ว...! ราชาเลขลบถูกปราบแล้ว!' },
        { speakerSprite: '🦉', speakerName: 'นักปราชญ์โบราณ', text: 'เจ้าทำได้! เจ้าคือวีรบุรุษผู้ปลดปล่อย Numeria! แสงสว่างแห่งคณิตศาสตร์ได้กลับคืนมาแล้ว!' }
      ],
      outroDialogueLose: [
        { speakerSprite: '😈', speakerName: 'ราชาเลขลบ', text: 'อ่อนหัดนัก! Numeria จะต้องจมดิ่งสู่ความมืดมิดแห่งตัวเลขต่อไป! ฮ่าๆๆ!' },
        { speakerSprite: '🦉', speakerName: 'นักปราชญ์โบราณ', text: 'พลังของมันมหาศาลเกินไป... แต่ตราบใดที่ยังมีความหวัง เราต้องลุกขึ้นสู้อีกครั้ง!' }
      ]
    }
  ];

  const initializedStages: Stage[] = stagesData.map(stageConfig => {
    const { problemDifficultyMultiplier, ...restOfStageData } = stageConfig;
    
    const problems: Problem[] = generateProblemsForStage(
        restOfStageData.id, 
        restOfStageData.operation, 
        restOfStageData.numProblems, 
        globalGeneratedProblemSignatures,
        problemDifficultyMultiplier || 1 // Use the multiplier if provided, else default to 1
    );
    
    return {
      ...restOfStageData,
      problems,
    } as Stage; // Cast to Stage as problemDifficultyMultiplier is now removed.
  });

  return initializedStages;
}

export const TUTORIAL_TEXT = [
  "ยินดีต้อนรับสู่ Math Quest: ดินแดนตัวเลขเวทมนตร์!",
  `เป้าหมาย: เดินทางผ่าน ${initializeGameStages().length} ด่าน และปราบราชาปีศาจเลขลบ`,
  "การต่อสู้: แต่ละด่านมีศัตรู 1 ตัว ศัตรูจะมีโจทย์เลขหลายข้อ (ตามระดับด่าน) ให้แก้",
  "ตอบถูก: โจมตีศัตรู! และได้รับ 'พลังสมาธิ'",
  "ตอบผิด หรือ เวลาหมด: ผู้เล่นถูกโจมตี เสีย HP ❤️ และไปยังโจทย์ข้อถัดไป (ถ้ามี)",
  "ชนะด่าน: เมื่อ HP ศัตรูหมดลง",
  "แพ้ด่าน: เมื่อ HP ผู้เล่นหมด หรือ แก้โจทย์ทุกข้อในด่านแล้วแต่ HP ศัตรูยังไม่หมด",
  "พลังสมาธิ: เมื่อเต็ม สามารถใช้ 'โจมตีพิเศษ' เพื่อเพิ่มพลังโจมตีในการตอบถูกครั้งถัดไป!",
  `โบนัส: ตอบเร็วภายใน ${QUICK_ANSWER_THRESHOLD_SECONDS} วินาที รับ ${QUICK_ANSWER_BONUS_SCORE} คะแนนพิเศษ!`,
  "ศัตรูพิเศษ: ศัตรูบางตัวอาจมีความสามารถพิเศษ ระวังให้ดี!",
  "HP หมด: เกมโอเวอร์ แต่สามารถลองใหม่ได้ (HP จะฟื้นเล็กน้อย เมื่อกด 'ลองอีกครั้ง')",
  "ไอเท็ม: ใช้ 💡 คำใบ้ (Hint) หรือ 🧪 ยาเพิ่มพลัง (Potion)",
  "คะแนน: ได้รับคะแนนจากการตอบถูก, ตอบเร็ว, และการผ่านด่าน",
  "โจทย์เลขจะถูกสร้างขึ้นใหม่ทุกครั้งที่เริ่มเกม และจะไม่ซ้ำกันภายในเกมนั้นๆ เพื่อความท้าทายที่หลากหลายในทุกการเล่น!",
  "บทสนทนา: อ่านเรื่องราวและคำแนะนำจากตัวละครต่างๆ",
  "คัทซีน: รับชมเรื่องราวเปิดตัวและเหตุการณ์สำคัญ!",
  "ขอให้สนุกกับการผจญภัยและฝึกสมองไปพร้อมกันนะ!"
];

export const PLAYER_ATTACK_POWER = 15; // Base damage per correct answer
export const ENEMY_ATTACK_POWER = 12; // Base damage from enemy
// Boss/Miniboss specific power can be tuned via their base HP and numProblems, or special abilities

export const GAME_INTRO_CUTSCENE_ID = 'gameIntro';

export const CUTSCENES: { [key: string]: Cutscene } = {
  [GAME_INTRO_CUTSCENE_ID]: [
    {
      id: 'intro1',
      backgroundStyle: 'bg-gradient-to-br from-sky-400 to-blue-600',
      elements: [
        { 
          type: 'text', 
          text: 'ณ ดินแดน Numeria ที่สงบสุข...', 
          // Responsive text size added here
          positionClasses: 'absolute top-1/3 left-1/2 -translate-x-1/2 text-white text-xl sm:text-2xl md:text-3xl font-bold text-center p-3 sm:p-4 md:p-6 bg-black/40 rounded-xl shadow-2xl', 
          animationClasses: 'animate-fade-in opacity-0'
        },
      ],
      autoAdvanceDelay: 3500,
    },
    {
      id: 'intro2',
      backgroundStyle: 'bg-gradient-to-br from-red-700 via-red-500 to-orange-600',
      elements: [
        { 
          type: 'character', 
          sprite: '😈', 
          name: 'ราชาเลขลบ', 
          // Character sprite size is already responsive in CutsceneScreen.tsx via text-7xl md:text-8xl
          positionClasses: 'absolute top-1/4 left-1/2 -translate-x-1/2', 
          animationClasses: 'animate-bounce' 
        },
        { 
          type: 'text', 
          text: 'ทันใดนั้น... ราชาปีศาจเลขลบ 😈 ได้ปรากฏตัวขึ้น!', 
          // Responsive text size
          positionClasses: 'absolute bottom-1/4 left-1/2 -translate-x-1/2 text-white text-lg sm:text-xl md:text-2xl text-center p-2 sm:p-3 md:p-4 bg-black/60 rounded-lg shadow-xl', 
          animationClasses: 'animate-fade-in opacity-0' 
        },
        { 
          type: 'text', 
          text: 'เริ่มสร้างความโกลาหลไปทั่วดินแดนด้วยพลังคณิตศาสตร์แห่งความมืด!', 
          // Responsive text size
          positionClasses: 'absolute bottom-10 sm:bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 text-yellow-300 text-base sm:text-lg md:text-xl text-center px-2', 
          animationClasses: 'animate-fade-in opacity-0'
        },
      ],
      autoAdvanceDelay: 5000,
    },
    {
      id: 'intro3',
      backgroundStyle: 'bg-gradient-to-br from-green-400 to-teal-500',
      elements: [
        { 
          type: 'character', 
          sprite: '🧙', 
          name: 'นักเวทฝึกหัด', 
          // Character sprite size is already responsive
          positionClasses: 'absolute top-1/2 left-1/4 -translate-y-1/2 opacity-0',
          animationClasses: 'animate-slide-in-left' 
        },
        { 
          type: 'text', 
          text: 'เจ้าหนู... 🧙\nนักเวทฝึกหัดผู้กล้าหาญ...\nคือความหวังเดียวที่จะนำสมดุลกลับคืนมา!', 
          // Responsive text and padding
          positionClasses: 'absolute top-1/2 right-1/4 -translate-y-1/2 text-indigo-800 text-sm sm:text-base md:text-xl font-semibold p-3 sm:p-4 md:p-6 bg-white/80 rounded-xl shadow-2xl text-center opacity-0', 
          animationClasses: 'animate-slide-in-right'
        },
      ],
    }
    // Add more frames for richer story
  ]
  // You can add more cutscenes here, e.g. for mid-game events or before the final boss
  // 'beforeFinalBoss': [ ...frames... ]
};

export const CUBE_W     = 2;
export const CUBE_D     = 2;
export const ECTS_SCALE = 2 / 3;
export const CUBE_GAP   = 0.3;
export const GROUP_PAD  = 0.6;
export const GROUP_GAP  = 1.5;
export const LEVEL_STEP = 9;

export const LEVEL_INDEX = Object.freeze({
  FAILED_TWICE: -2, 
  FAILED_ONCE: -1, 
  BASE: 0,
  GRADE_4: 1, 
  GRADE_4_5: 2, 
  GRADE_5: 3, 
  GRADE_5_5: 4, 
  GRADE_6: 5,
});

export const LEVEL_LABELS = Object.freeze({
  [-2]: '2× Nicht bestanden', 
  [-1]: '1× Nicht bestanden',
  [ 0]: 'Ausstehend',
  [ 1]: 'Note 4.0', 
  [ 2]: 'Note 4.5', 
  [ 3]: 'Note 5.0',
  [ 4]: 'Note 5.5', 
  [ 5]: 'Note 6.0',
});

export const STATUS = Object.freeze({
  NOT_STARTED: 'not_started', 
  IN_PROGRESS: 'in_progress',
  FAILED_ONCE: 'failed_once', 
  FAILED_TWICE: 'failed_twice',
  COMPLETED: 'completed',
});

export const COLOR = Object.freeze({
  FAILED_TWICE: '#cc2222', 
  FAILED_ONCE: '#cc7700',
  NOT_STARTED:  '#777777', 
  IN_PROGRESS: '#3366cc',
  GRADE_4: '#1a5c1a', 
  GRADE_4_5: '#2a7a2a', 
  GRADE_5: '#3a9a3a',
  GRADE_5_5: '#5aba5a', 
  GRADE_6: '#80d080',
});

export const levelZ = index => index * LEVEL_STEP;

export const gradeToLevelIndex = grade =>
  ({ 4.0: 1, 4.5: 2, 5.0: 3, 5.5: 4, 6.0: 5 })[grade] ?? LEVEL_INDEX.BASE;

export function statusToLevelIndex(status, grade) {
  if (status === STATUS.COMPLETED)    return gradeToLevelIndex(grade);
  if (status === STATUS.FAILED_ONCE)  return LEVEL_INDEX.FAILED_ONCE;
  if (status === STATUS.FAILED_TWICE) return LEVEL_INDEX.FAILED_TWICE;
  return LEVEL_INDEX.BASE;
}

export function statusToColor(status, grade) {
  if (status === STATUS.COMPLETED)    return gradeToColor(grade);
  if (status === STATUS.FAILED_ONCE)  return COLOR.FAILED_ONCE;
  if (status === STATUS.FAILED_TWICE) return COLOR.FAILED_TWICE;
  if (status === STATUS.IN_PROGRESS)  return COLOR.IN_PROGRESS;
  return COLOR.NOT_STARTED;
}

export const gradeToColor = grade =>
  ({ 4.0: COLOR.GRADE_4, 4.5: COLOR.GRADE_4_5, 5.0: COLOR.GRADE_5,
     5.5: COLOR.GRADE_5_5, 6.0: COLOR.GRADE_6 })[grade] ?? COLOR.NOT_STARTED;

export const levelIndexToColor = index =>
  ({ [-2]: COLOR.FAILED_TWICE, [-1]: COLOR.FAILED_ONCE, [0]: '#2a3050',
     [1]: COLOR.GRADE_4, [2]: COLOR.GRADE_4_5, [3]: COLOR.GRADE_5,
     [4]: COLOR.GRADE_5_5, [5]: COLOR.GRADE_6 })[index] ?? '#444';

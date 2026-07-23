// Pure XP/level math — no database access. Level is always derived from a
// member's total XP (sum of xp_events), never stored, so this curve can be
// retuned or relabeled ("Level" → any future rank name) without a migration.

export function xpRequiredForLevel(level: number): number {
  if (level <= 0) return 0;
  return 50 * level * (level + 1);
}

export function levelForXp(xp: number): number {
  let level = 0;
  while (xpRequiredForLevel(level + 1) <= xp) {
    level += 1;
  }
  return level;
}

export type LevelProgress = {
  level: number;
  xp: number;
  currentThreshold: number;
  nextThreshold: number;
  xpIntoLevel: number;
  xpForThisLevel: number;
  progressRatio: number;
};

export function progressToNextLevel(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const currentThreshold = xpRequiredForLevel(level);
  const nextThreshold = xpRequiredForLevel(level + 1);
  const xpIntoLevel = xp - currentThreshold;
  const xpForThisLevel = nextThreshold - currentThreshold;

  return {
    level,
    xp,
    currentThreshold,
    nextThreshold,
    xpIntoLevel,
    xpForThisLevel,
    progressRatio: xpForThisLevel > 0 ? xpIntoLevel / xpForThisLevel : 1,
  };
}

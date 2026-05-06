/**
 * Utility functions for calculating dashboard statistics and user progress.
 */

interface StreakResult {
  current: number;
  longest: number;
}

/**
 * Formats a date to YYYY-MM-DD string.
 */
function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Calculates day difference between two date strings.
 */
function getDayDiff(d1Str: string, d2Str: string): number {
  const d1 = new Date(d1Str);
  const d2 = new Date(d2Str);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculates current and longest streaks from an array of activity timestamps.
 */
export function calculateStreak(activityDates: string[]): StreakResult {
  if (!activityDates?.length) return { current: 0, longest: 0 };

  const uniqueDates = Array.from(
    new Set(activityDates.map((date) => formatDateKey(new Date(date)))),
  ).sort((a, b) => a.localeCompare(b));

  if (!uniqueDates.length) return { current: 0, longest: 0 };

  // 1. Calculate Longest Streak
  let longest = 1;
  let currentLongRun = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = getDayDiff(uniqueDates[i], uniqueDates[i - 1]);
    if (diff === 1) {
      currentLongRun++;
      longest = Math.max(longest, currentLongRun);
    } else {
      currentLongRun = 1;
    }
  }

  // 2. Calculate Current Streak
  const todayStr = formatDateKey(new Date());
  const latestDate = uniqueDates[uniqueDates.length - 1];
  const diffFromToday = getDayDiff(todayStr, latestDate);

  let current = 0;
  if (diffFromToday === 0 || diffFromToday === 1) {
    current = 1;
    for (let i = uniqueDates.length - 1; i > 0; i--) {
      const diff = getDayDiff(uniqueDates[i], uniqueDates[i - 1]);
      if (diff === 1) current++;
      else break;
    }
  }

  return { current, longest };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
}

/**
 * Maps question completed milestones to achievements.
 */
export function calculateAchievements(
  questionsCompleted: number,
  totalPoints: number,
  currentStreak: number,
  longestStreak: number,
): Achievement[] {
  const achievements: Achievement[] = [];
  const now = new Date().toISOString();

  const addIf = (cond: boolean, id: string, name: string, desc: string) => {
    if (cond)
      achievements.push({ id, name, description: desc, unlockedAt: now });
  };

  addIf(
    questionsCompleted >= 10,
    "questions-10",
    "Getting Started",
    "Completed 10 questions",
  );
  addIf(
    questionsCompleted >= 50,
    "questions-50",
    "Learning Fast",
    "Completed 50 questions",
  );
  addIf(
    questionsCompleted >= 100,
    "questions-100",
    "Century Club",
    "Completed 100 questions",
  );
  addIf(
    totalPoints >= 100,
    "points-100",
    "Point Collector",
    "Earned 100 points",
  );
  addIf(totalPoints >= 500, "points-500", "Point Master", "Earned 500 points");
  addIf(currentStreak >= 7, "streak-7", "Week Warrior", "7 day streak");
  addIf(currentStreak >= 30, "streak-30", "Monthly Master", "30 day streak");
  addIf(
    longestStreak >= 30,
    "longest-streak-30",
    "Consistency Champion",
    "Longest streak of 30 days",
  );

  return achievements;
}

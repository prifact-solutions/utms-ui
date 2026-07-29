export interface AchievementsStats {
  badges_earned: number;
  courses_completed: number;
  courses_in_progress: number;
  estimated_hours: number;
  avg_exam_score_pct: number | null;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  progress: number;
  target: number;
  tone: 'gold' | 'silver' | 'grey';
}

export interface AchievementCourse {
  program_id: number;
  title: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'INACTIVE' | string;
  completion_pct: number;
  avg_exam_score: number;
}

export interface AchievementsResponse {
  stats: AchievementsStats;
  badges: AchievementBadge[];
  courses: AchievementCourse[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correct_index: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export interface Result {
  id: string;
  player_name: string;
  score: number;
  total: number;
  percentage: number;
  time_seconds: number;
  created_at: string;
}

export interface Stats {
  total_attempts: number;
  avg_percentage: number;
  top_score: number;
  avg_time_seconds: number;
}

export interface AnswerRecord {
  question_id: string;
  selected: number;
  correct: boolean;
}

export type QuizPhase = 'home' | 'quiz' | 'result' | 'leaderboard' | 'admin';

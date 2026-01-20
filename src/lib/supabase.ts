import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Brand {
  id: string;
  name: string;
  wordle_answer: string[];
  apple_game_word: string;
  hint_image: string;
  place_quiz_question: string;
  place_quiz_answer: string;
  place_url: string;
  is_active: boolean;
  created_at: string;
}

export interface PointHistory {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  check_date: string;
  streak: number;
  created_at: string;
}

export interface GamePlay {
  id: string;
  user_id: string;
  game_type: string;
  brand_id: string;
  score: number;
  created_at: string;
}

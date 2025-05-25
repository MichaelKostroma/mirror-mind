import { User } from "@supabase/supabase-js";

export type { User };

export interface Decision {
  id: string;
  user_id: string;
  title: string;
  situation: string;
  decision: string;
  reasoning?: string | null;
  created_at: string;
  analysis_status: "pending" | "completed" | "failed";
  analysis_category?: string | null;
  cognitive_biases?: string[] | null;
  missed_alternatives?: string[] | null;
  analysis_summary?: string | null;
}

export interface AnalysisResult {
  category: string;
  cognitive_biases: string[];
  missed_alternatives: string[];
  summary: string;
}

export interface DecisionData {
  title: string;
  situation: string;
  decision: string;
  reasoning?: string;
}
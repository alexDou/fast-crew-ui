import type { PoetCardType } from "./poet.type";

export interface PoemSourceQuestionType {
  id: string;
  text: string;
}

export interface PoemSourceReadType {
  id: number;
  media_path: string;
  status: string;
  created_at: string;
}

export interface PoemSourceStatusResponseType {
  ready: boolean;
  status: string;
  poem_source_id: number;
  message: string | null;
  questions: PoemSourceQuestionType[];
  poet_candidates: PoetCardType[];
}

export interface PoemSourceAnswerSubmissionType {
  answers: Record<string, string>;
  poet_id: number | null;
}

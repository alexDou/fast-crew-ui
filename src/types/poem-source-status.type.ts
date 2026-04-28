import type { BackendProcessingStatusType } from "@/constants/status";

import type { PoetCardType } from "./poet.type";

export interface PoemSourceQuestionType {
  id: string;
  text: string;
}

export interface PoemSourceStatusResponseType {
  ready: boolean;
  status: BackendProcessingStatusType;
  poem_source_id: number;
  message?: string;
  questions?: PoemSourceQuestionType[];
  poet_candidates?: PoetCardType[];
}

export interface PoemSourceAnswerSubmissionRequestType {
  answers: Record<string, string>;
  poet_id: number | null;
}

export interface PoemSourceAnswerSubmissionResponseType {
  message: string;
  status: BackendProcessingStatusType;
  poem_source_id: number;
}

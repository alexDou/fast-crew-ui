import type { BackendProcessingStatusType } from "@/constants/status";

export interface PoemSourceQuestionType {
  id: string;
  text: string;
  kind?: string;
}

export interface PoemSourceStatusResponseType {
  ready: boolean;
  status: BackendProcessingStatusType;
  poem_source_id: number;
  message?: string;
  questions?: PoemSourceQuestionType[];
}

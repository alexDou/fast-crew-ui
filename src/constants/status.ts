/** Upload form has not started yet. */
export const TUNER_UI_STATUS = {
  IDLE: "idle",
  ERROR: "error"
} as const;

/** Backend poem_source.status values (shared with the API). */
export const POEM_SOURCE_STATUS = {
  PROCESSING: "processing",
  STAGE_1: "stage_1",
  GENERATING: "generating",
  COMPLETE: "complete",
  ERROR: "error"
} as const;

export type PoemSourceStatusType = (typeof POEM_SOURCE_STATUS)[keyof typeof POEM_SOURCE_STATUS];

export type TunerUiStatusType = (typeof TUNER_UI_STATUS)[keyof typeof TUNER_UI_STATUS];

/** @deprecated Use POEM_SOURCE_STATUS — kept for incremental migration in tests. */
export const PROCESSING_STATUS = {
  IDLE: TUNER_UI_STATUS.IDLE,
  PROCESSING: POEM_SOURCE_STATUS.PROCESSING,
  SUCCESS: POEM_SOURCE_STATUS.COMPLETE,
  ERROR: POEM_SOURCE_STATUS.ERROR
} as const;

export type ProcessingStatusType =
  | TunerUiStatusType
  | PoemSourceStatusType
  | (typeof PROCESSING_STATUS)[keyof typeof PROCESSING_STATUS];

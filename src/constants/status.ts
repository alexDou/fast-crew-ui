export const PROCESSING_STATUS = {
  IDLE: "idle",
  PROCESSING: "processing",
  SUCCESS: "success",
  ERROR: "error"
} as const;

export type ProcessingStatusType = (typeof PROCESSING_STATUS)[keyof typeof PROCESSING_STATUS];

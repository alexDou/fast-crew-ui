export const PROCESSING_STATUS = {
  IDLE: "idle",
  PROCESSING: "processing",
  STAGE_1: "stage_1",
  GENERATING: "generating",
  COMPLETE: "complete",
  ERROR: "error"
} as const;

export type ProcessingStatusType = (typeof PROCESSING_STATUS)[keyof typeof PROCESSING_STATUS];

export type BackendProcessingStatusType = ProcessingStatusType | "success";

export function normalizeProcessingStatus(
  status: BackendProcessingStatusType
): ProcessingStatusType {
  if (status === "success") {
    return PROCESSING_STATUS.COMPLETE;
  }

  return status;
}

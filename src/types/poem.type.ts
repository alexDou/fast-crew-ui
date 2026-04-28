export interface PoemType {
  id: number;
  poem: string;
  poet_id: number | null;
  poet_name?: string;
}

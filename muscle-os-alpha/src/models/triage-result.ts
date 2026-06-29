export interface TriageResult {
  result: 'Green' | 'Yellow' | 'Red';
  flagged: string[];
  answers: Record<string, string>;
}

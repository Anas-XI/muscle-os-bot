export type SessionStatus = 'active' | 'completed' | 'expired';
export type EntryPath = 'plateau' | 'recovery' | 'starting' | 'returning';

export interface Session {
  id: string;
  status: SessionStatus;
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  triageResult?: 'green' | 'yellow' | 'red';
  entryPath?: EntryPath;
  recommendationJson?: string;
  acceptanceStatus?: 'accepted' | 'rejected' | 'pending';
}

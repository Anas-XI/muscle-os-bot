export interface AnalyticsEvent {
  id: string;
  sessionId: string;
  eventType: string;
  timestamp: Date;
  metadataJson?: string;
}

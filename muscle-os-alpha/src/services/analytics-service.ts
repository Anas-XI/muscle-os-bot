import { v4 as uuid } from 'uuid';
import { db } from '../database/db';
import type { AnalyticsEvent } from '../models/analytics-event';

export class AnalyticsService {
  async track(sessionId: string, eventType: string, metadata?: Record<string, unknown>): Promise<void> {
    const event: AnalyticsEvent = {
      id: uuid(),
      sessionId,
      eventType,
      timestamp: new Date(),
      metadataJson: metadata ? JSON.stringify(metadata) : undefined,
    };
    await db.analyticsEvents.add(event);
  }

  async getMetrics(): Promise<{
    totalSessions: number;
    completedSessions: number;
    acceptedRecommendations: number;
    blockedRed: number;
    avgTimeToDiagnosis: number;
  }> {
    const all = await db.analyticsEvents.toArray();
    const totalSessions = all.filter((e) => e.eventType === 'session_started').length;
    const completedSessions = all.filter((e) => e.eventType === 'session_completed').length;
    const acceptedRecommendations = all.filter((e) => e.eventType === 'recommendation_accepted').length;
    const blockedRed = all.filter((e) => e.eventType === 'triage_red_blocked').length;

    const diagEvents = all
      .filter((e) => e.eventType === 'recommendation_generated' && e.metadataJson)
      .map((e) => JSON.parse(e.metadataJson!));

    const avgTimeToDiagnosis =
      diagEvents.length > 0
        ? diagEvents.reduce((sum: number, m: Record<string, unknown>) => sum + (m.timeToDiagnosisSeconds as number || 0), 0) /
          diagEvents.length
        : 0;

    return { totalSessions, completedSessions, acceptedRecommendations, blockedRed, avgTimeToDiagnosis };
  }
}

export const analyticsService = new AnalyticsService();

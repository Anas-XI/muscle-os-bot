import { v4 as uuid } from 'uuid';
import { db } from '../database/db';
import type { Session, SessionStatus, EntryPath } from '../models/session';
import type { ChatMessage, MessageRole, MessageType } from '../models/chat-message';

const STALE_WINDOW_DAYS = 90;

export class SessionService {
  async createSession(): Promise<Session> {
    const now = new Date();
    const session: Session = {
      id: uuid(),
      status: 'active',
      startedAt: now,
      updatedAt: now,
      acceptanceStatus: 'pending',
    };
    await db.sessions.add(session);
    return session;
  }

  async addMessage(
    sessionId: string,
    role: MessageRole,
    content: string,
    type: MessageType = 'text',
    metadataJson?: string
  ): Promise<ChatMessage> {
    const msg: ChatMessage = {
      id: uuid(),
      sessionId,
      role,
      content,
      type,
      timestamp: new Date(),
      metadataJson,
    };
    await db.messages.add(msg);
    await db.sessions.update(sessionId, { updatedAt: new Date() });
    return msg;
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    return db.messages
      .where('sessionId')
      .equals(sessionId)
      .sortBy('timestamp');
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<void> {
    updates.updatedAt = new Date();
    await db.sessions.update(id, updates);
  }

  async latestSession(): Promise<Session | null> {
    const sessions = await db.sessions
      .where('status')
      .equals('active')
      .reverse()
      .sortBy('startedAt');
    return sessions[0] ?? null;
  }

  async completeSession(id: string): Promise<void> {
    await db.sessions.update(id, {
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  isStale(session: Session): boolean {
    const diff = Date.now() - new Date(session.updatedAt).getTime();
    return diff > STALE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  }

  async deleteOldSessions(): Promise<void> {
    const all = await db.sessions.toArray();
    const stale = all.filter((s) => {
      const diff = Date.now() - new Date(s.updatedAt).getTime();
      return diff > STALE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    });
    for (const s of stale) {
      await db.sessions.update(s.id, { status: 'expired' });
    }
  }
}

export const sessionService = new SessionService();

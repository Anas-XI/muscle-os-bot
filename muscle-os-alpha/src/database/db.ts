import Dexie, { type Table } from 'dexie';
import type { Session } from '../models/session';
import type { ChatMessage } from '../models/chat-message';
import type { AnalyticsEvent } from '../models/analytics-event';
import type { FoodItem } from '../models/food-item';
import type { MealLog, WeightLog } from '../models/meal-log';

export class MuscleOSDB extends Dexie {
  sessions!: Table<Session, string>;
  messages!: Table<ChatMessage, string>;
  analyticsEvents!: Table<AnalyticsEvent, string>;
  foodItems!: Table<FoodItem, string>;
  mealLogs!: Table<MealLog, string>;
  weightLogs!: Table<WeightLog, string>;

  constructor() {
    super('MuscleOS');
    this.version(3).stores({
      sessions: 'id, status, startedAt',
      messages: 'id, sessionId, timestamp',
      analyticsEvents: 'id, sessionId, eventType, timestamp',
      foodItems: 'id, name, category, barcode',
      mealLogs: 'id, date, mealName',
      weightLogs: 'id, date',
    });
  }
}

export const db = new MuscleOSDB();

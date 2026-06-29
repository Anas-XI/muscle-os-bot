export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'quickReply' | 'triageResult' | 'recommendation';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  timestamp: Date;
  metadataJson?: string;
}

import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../models/chat-message';

interface Props {
  message: ChatMessage;
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) return null;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-emerald-600 text-white rounded-br-md'
            : 'bg-zinc-800 text-zinc-100 rounded-bl-md border border-zinc-700'
        }`}
      >
        <div className="markdown text-sm leading-relaxed">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        <div className={`text-[10px] mt-1 ${isUser ? 'text-emerald-200' : 'text-zinc-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

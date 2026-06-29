import { useState } from 'react';
import { ChatScreen } from './screens/ChatScreen';
import { CalorieScreen } from './screens/CalorieScreen';

type Screen = 'chat' | 'calories';

export default function App() {
  const [screen, setScreen] = useState<Screen>('chat');

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
      {/* Top navigation */}
      <nav className="flex border-b border-zinc-800 shrink-0">
        <button
          onClick={() => setScreen('chat')}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            screen === 'chat'
              ? 'text-emerald-400 border-b-2 border-emerald-500 bg-zinc-900'
              : 'text-zinc-600 hover:text-zinc-400 bg-zinc-950'
          }`}
        >
          💬 Coach
        </button>
        <button
          onClick={() => setScreen('calories')}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            screen === 'calories'
              ? 'text-emerald-400 border-b-2 border-emerald-500 bg-zinc-900'
              : 'text-zinc-600 hover:text-zinc-400 bg-zinc-950'
          }`}
        >
          🔥 Calories
        </button>
      </nav>

      {screen === 'chat' && <ChatScreen />}
      {screen === 'calories' && <CalorieScreen />}
    </div>
  );
}

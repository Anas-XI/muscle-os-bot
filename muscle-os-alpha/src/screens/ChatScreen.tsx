import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../stores/chat-store';
import { ChatBubble } from '../components/ChatBubble';
import { StreamingText } from '../components/StreamingText';
import { QuickReplyBar } from '../components/QuickReplyBar';
import { RecommendationCard } from '../components/RecommendationCard';
import { OnboardingSummary } from '../components/OnboardingSummary';
import { IntakeScreen } from './IntakeScreen';
import { SettingsModal } from '../components/SettingsModal';
export function ChatScreen() {
  const {
    lmStudioConnected,
    lmStudioModel,
    lmStudioError,
    messages,
    isStreaming,
    streamedContent,
    currentSession,
    conversationPhase,
    triageResult,
    currentRecommendation,
    synergyInsights,
    interventionHistory,
    reviewDate,
    initialize,
    startNewSession,
    sendMessage,
    acceptRecommendation,
    rejectRecommendation,
    handleEntrySelection,
    submitReview,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [checking, setChecking] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setChecking(true);
    await initialize();
    setChecking(false);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedContent, conversationPhase]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Check if we should show triage
  const needsTriage = currentSession && !triageResult && messages.length === 0;
  const showGreeting = conversationPhase === 'greeting' && messages.length === 0 && !checking;

  // Loading state
  if (checking) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-zinc-500">Loading...</div>
        </div>
      </div>
    );
  }

  // LM Studio not connected or model issue
  if (!lmStudioConnected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 text-2xl">🔌</div>
        <h2 className="text-lg font-semibold text-zinc-200 mb-2">LM Studio Not Running</h2>
        {lmStudioError ? (
          <div className="bg-red-900/20 border border-red-800 rounded-xl px-4 py-3 mb-4 max-w-sm w-full">
            <p className="text-xs text-red-400 font-medium mb-1">Server error:</p>
            <p className="text-sm text-zinc-300">{lmStudioError}</p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 mb-6 max-w-sm">
            Start LM Studio, load <strong>gemma-4-4b-it</strong>, and enable the API server on port <strong>1234</strong>.
          </p>
        )}
        <button
          onClick={init}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Retry Connection
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 underline"
        >
          Change Settings
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h1 className="text-sm font-semibold text-zinc-200">Muscle OS</h1>
        </div>
        <div className="flex items-center gap-3">
          {lmStudioModel && (
            <span className="text-[10px] text-zinc-600 max-w-[120px] truncate" title={lmStudioModel}>
              {lmStudioModel}
            </span>
          )}
          {currentSession && (
            <span className="text-[10px] text-zinc-600">
              Session: {currentSession.id.slice(0, 6)}
            </span>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            title="LM Studio settings"
          >
            ⚙
          </button>
          <button
            onClick={() => startNewSession()}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            New
          </button>
        </div>
      </header>

      {/* Model error banner */}
      {lmStudioConnected && lmStudioError && (
        <div className="mx-3 mt-2 mb-0 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3 shrink-0">
          <div className="flex items-start gap-2">
            <span className="text-red-400 text-sm mt-0.5">⚠️</span>
            <div>
              <p className="text-xs text-red-400 font-semibold mb-1">Model Error</p>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{lmStudioError}</p>
            </div>
          </div>
          <button
            onClick={init}
            className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 underline"
          >
            Retry connection
          </button>
        </div>
      )}

      {/* Full-screen phases: Intake Assessment + Summary */}
      {conversationPhase === 'intake_assessment' && <IntakeScreen />}
      {conversationPhase === 'summary' && <OnboardingSummary />}

      {/* Standard phases: chat area */}
      {conversationPhase !== 'intake_assessment' && conversationPhase !== 'summary' && (
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {/* Greeting — only on fresh session */}
        {showGreeting && !needsTriage && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center text-lg">
                💪
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-200">Muscle OS</div>
                <div className="text-[10px] text-zinc-500">Evidence-based fitness coach</div>
              </div>
            </div>

            {/* Triage prompt */}
            {needsTriage && (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-4 mb-4">
                <p className="text-sm text-zinc-300 mb-3">
                  Before we start — I need to run a quick safety check. This takes about 2 minutes.
                </p>
                <button
                  onClick={() => useChatStore.setState({ conversationPhase: 'triage' as const })}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Start Safety Check
                </button>
                <button
                  onClick={() => useChatStore.setState({ conversationPhase: 'intake_assessment' as const })}
                  className="w-full py-2 mt-2 text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
                >
                  Skip safety check
                </button>
              </div>
            )}

            {/* Entry selection */}
            {!needsTriage && (
              <div>
                <div className="bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3 border border-zinc-700 mb-4">
                  <p className="text-sm text-zinc-200">Hey! What's going on with your training?</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming response */}
        {isStreaming && streamedContent && (
          <div className="flex justify-start mb-3">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-zinc-800 text-zinc-100 rounded-bl-md border border-zinc-700">
              <StreamingText content={streamedContent} />
            </div>
          </div>
        )}

        {/* Recommendation card */}
        {currentRecommendation && conversationPhase === 'recommendation' && (
          <RecommendationCard
            recommendation={currentRecommendation}
            onAccept={acceptRecommendation}
            onReject={rejectRecommendation}
          />
        )}

        {/* Red triage blocker */}
        {triageResult?.result === 'Red' && (
          <div className="bg-red-900/20 border border-red-800 rounded-2xl p-4 my-4">
            <div className="text-red-400 font-semibold text-sm mb-2">⚠️ Safety Check — Action Required</div>
            <p className="text-sm text-zinc-300 mb-3">
              Based on your answers, I'm not able to provide coaching right now. Please speak with a healthcare provider before starting any training program.
            </p>
            <div className="text-xs text-zinc-500">
              Flagged: {triageResult.flagged.join(', ')}
            </div>
          </div>
        )}

        {/* Diagnosis question indicator */}
        {conversationPhase === 'diagnosis_questions' && messages.length === 0 && (
          <div className="bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3 border border-zinc-700 mb-4">
            <p className="text-sm text-zinc-200">
              {(() => {
                const q = useChatStore.getState().diagnosisQuestions[useChatStore.getState().currentQuestionIndex];
                return q ? q.label : 'Let me ask you a few questions...';
              })()}
            </p>
          </div>
        )}

        {/* Synergy insights */}
        {synergyInsights.length > 0 && conversationPhase === 'recommendation' && (
          <div className="bg-indigo-900/20 border border-indigo-800 rounded-2xl p-4 my-2">
            <div className="text-indigo-400 font-semibold text-xs mb-1">Cross-Pillar Synergy</div>
            <p className="text-sm text-zinc-300 leading-relaxed">{synergyInsights[0]}</p>
          </div>
        )}

        {/* Intervention history */}
        {interventionHistory.length > 0 && conversationPhase === 'recommendation' && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-3 my-2">
            <div className="text-zinc-500 font-medium text-xs mb-1">Previous Interventions</div>
            {interventionHistory.map((h, i) => (
              <div key={i} className="text-xs text-zinc-400 flex items-start gap-2 mb-1">
                <span className="text-zinc-600 mt-0.5">•</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Review phase */}
        {conversationPhase === 'review' && (
          <div className="bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3 border border-zinc-700 mb-4">
            <p className="text-sm text-zinc-200">
              Its been {reviewDate || 'a while'} — how did the intervention go?
            </p>
          </div>
        )}

        {/* Adjustment phase */}
        {conversationPhase === 'adjustment' && (
          <div className="bg-amber-900/20 border border-amber-800 rounded-2xl p-4 my-2">
            <div className="text-amber-400 font-semibold text-sm mb-1">Secondary Diagnosis Needed</div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              The intervention didnt produce the expected result. We need to revisit the diagnosis
              with fresh data. Consider: was it an adherence problem or a plan problem?
            </p>
          </div>
        )}

        {/* Spacer for scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      )}

      {/* Standard phases: bottom controls (hidden during full-screen phases) */}
      {conversationPhase !== 'intake_assessment' && conversationPhase !== 'summary' && (
      <>
      <div className="shrink-0">
        {(conversationPhase === 'triage' ||
          conversationPhase === 'diagnosis_questions' ||
          conversationPhase === 'recommendation' ||
          conversationPhase === 'entry_selection' ||
          conversationPhase === 'review' ||
          conversationPhase === 'adjustment' ||
          conversationPhase === 'reassessment') && <QuickReplyBar />}
      </div>

      {/* Input bar — only show when text input is appropriate */}
      {lmStudioError ? (
        <div className="px-4 py-3 border-t border-zinc-800 shrink-0 bg-zinc-950">
          <div className="bg-zinc-900 rounded-xl px-4 py-3 text-center">
            <p className="text-sm text-zinc-500">Fix the model error above to continue.</p>
          </div>
        </div>
      ) : (conversationPhase === 'greeting' && !needsTriage) ||
        conversationPhase === 'diagnosing' ||
        conversationPhase === 'followup' ||
        conversationPhase === 'review' ||
        conversationPhase === 'adjustment' ||
        conversationPhase === 'reassessment' ? (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-800 shrink-0 bg-zinc-950">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isStreaming}
            className="flex-1 bg-zinc-800 text-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none border border-zinc-700 focus:border-emerald-600 transition-colors placeholder:text-zinc-600 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
          >
            ➤
          </button>
        </div>
      ) : null}

      {/* Entry selection buttons (shown when no triage and no phase started) */}
      {conversationPhase === 'greeting' && !needsTriage && messages.length === 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-4 shrink-0">
          <button onClick={() => handleEntrySelection('plateau')} className="quick-btn">Not seeing results</button>
          <button onClick={() => handleEntrySelection('recovery')} className="quick-btn">Feel tired all the time</button>
          <button onClick={() => handleEntrySelection('starting')} className="quick-btn">Just getting started</button>
          <button onClick={() => handleEntrySelection('returning')} className="quick-btn">Coming back after break</button>
        </div>
      )}
      </>
      )}

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={init}
      />
    </div>
  );
}

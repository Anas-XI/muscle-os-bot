import { useChatStore } from '../stores/chat-store';
import { QUESTIONNAIRE } from '../services/safety-triage-service';

export function QuickReplyBar() {
  const {
    conversationPhase,
    handleEntrySelection,
    handleDiagnosisAnswer,
    setTriageAnswer,
    triageAnswers,
    currentQuestionIndex,
    diagnosisQuestions,
    triageResult,
    isStreaming,
    synergyInsights,
    reviewDate,
    interventionHistory,
    scheduleReview,
    submitReview,
  } = useChatStore();

  // Entry selection phase
  if (conversationPhase === 'entry_selection' && !triageResult) {
    return (
      <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1">
        <button onClick={() => handleEntrySelection('plateau')} className="quick-btn">Not seeing results</button>
        <button onClick={() => handleEntrySelection('recovery')} className="quick-btn">Feel tired all the time</button>
        <button onClick={() => handleEntrySelection('starting')} className="quick-btn">Just getting started</button>
        <button onClick={() => handleEntrySelection('returning')} className="quick-btn">Coming back after break</button>
      </div>
    );
  }

  // Triage phase — show question options
  if (conversationPhase === 'triage') {
    const sortedQIds = Object.keys(QUESTIONNAIRE).sort();
    const unanswered = sortedQIds.find((qid) => {
      if (qid === 'A4b' && triageAnswers['A4'] !== 'suspected') return false;
      return !triageAnswers[qid];
    });

    if (unanswered) {
      const spec = QUESTIONNAIRE[unanswered];
      const options = Object.keys(spec.responses);
      return (
        <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => setTriageAnswer(unanswered, opt)}
              className="quick-btn"
            >
              {opt.replace(/_/g, ' ').replace(/\//g, ' / ')}
            </button>
          ))}
        </div>
      );
    }
    return null;
  }

  // Diagnosis questions phase
  if (conversationPhase === 'diagnosis_questions') {
    const q = diagnosisQuestions[currentQuestionIndex];
    if (q) {
      return (
        <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleDiagnosisAnswer(opt)}
              className="quick-btn"
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      );
    }
    return null;
  }

  // Recommendation phase
  if (conversationPhase === 'recommendation') {
    return (
      <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1 flex-col">
        {synergyInsights.length > 0 && (
          <div className="text-xs text-zinc-500 mb-2 px-1">
            <span className="text-emerald-500 font-medium">Synergy detected: </span>
            {synergyInsights[0]}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => useChatStore.getState().acceptRecommendation()}
            className="quick-btn bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
          >
            Makes sense — I'll try it
          </button>
          <button
            onClick={() => useChatStore.getState().rejectRecommendation()}
            className="quick-btn border-zinc-600 text-zinc-300"
          >
            Not sure
          </button>
        </div>
      </div>
    );
  }

  // Review phase — ask how the intervention went
  if (conversationPhase === 'review') {
    return (
      <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1">
        <div className="w-full text-xs text-zinc-500 mb-1 px-1">
          {interventionHistory.length > 0 && (
            <span className="text-zinc-400">Last intervention: {interventionHistory[interventionHistory.length - 1]}</span>
          )}
        </div>
        <button onClick={() => submitReview(true, 'worked')} className="quick-btn bg-emerald-600/80 hover:bg-emerald-500 text-white border-emerald-500">
          It worked — making progress
        </button>
        <button onClick={() => submitReview(false, 'no change')} className="quick-btn border-amber-600 text-amber-400">
          No change yet
        </button>
        <button onClick={() => submitReview(false, 'worse')} className="quick-btn border-red-600 text-red-400">
          Things got worse
        </button>
      </div>
    );
  }

  // Adjustment phase — secondary diagnostic prompt
  if (conversationPhase === 'adjustment') {
    return (
      <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1">
        <button onClick={() => useChatStore.getState().startFollowUpSession()} className="quick-btn border-zinc-600">
          Start fresh diagnosis
        </button>
        <button onClick={() => useChatStore.getState().startNewSession()} className="quick-btn border-zinc-600">
          New session
        </button>
      </div>
    );
  }

  // Reassessment phase
  if (conversationPhase === 'reassessment') {
    return (
      <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1">
        <button onClick={() => handleEntrySelection('plateau')} className="quick-btn">Check for new bottleneck</button>
        <button onClick={() => {
          useChatStore.setState({ conversationPhase: 'followup' });
        }} className="quick-btn border-zinc-600">Ask a question</button>
      </div>
    );
  }

  // Disable input during streaming
  if (isStreaming) {
    return (
      <div className="px-4 pb-3 pt-1">
        <div className="text-xs text-zinc-500 italic">Muscle OS is thinking...</div>
      </div>
    );
  }

  return null;
}

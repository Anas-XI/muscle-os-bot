import { useState } from 'react';
import { useChatStore } from '../stores/chat-store';
import { QUESTIONNAIRE } from '../services/safety-triage-service';

export function TriageScreen() {
  const { triageAnswers, setTriageAnswer, submitTriage, triageResult } = useChatStore();
  const [submitting, setSubmitting] = useState(false);

  const sortedQIds = Object.keys(QUESTIONNAIRE).sort();

  const allAnswered = sortedQIds.every((qid) => {
    if (qid === 'A4b' && triageAnswers['A4'] !== 'suspected') return true;
    return !!triageAnswers[qid];
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    await submitTriage();
    setSubmitting(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <h1 className="text-sm font-semibold text-zinc-200">Safety Check</h1>
          <span className="text-[10px] text-zinc-600 ml-auto">~2 minutes</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="text-sm text-zinc-400 mb-6">
          Quick questions to make sure my advice is safe for you. Answer honestly.
        </p>

        <div className="space-y-2">
          {sortedQIds.map((qid) => {
            if (qid === 'A4b' && triageAnswers['A4'] !== 'suspected') return null;
            const spec = QUESTIONNAIRE[qid];
            const options = Object.keys(spec.responses);
            const selected = triageAnswers[qid];

            return (
              <div key={qid} className="bg-zinc-900 rounded-xl border border-zinc-800 p-3">
                <div className="text-sm text-zinc-300 mb-2">{spec.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {options.map((opt) => {
                    const display = opt
                      .replace(/_/g, ' ')
                      .replace(/\//g, ' / ')
                      .replace(/\b\w/g, (c) => c.toUpperCase());
                    return (
                      <button
                        key={opt}
                        onClick={() => setTriageAnswer(qid, opt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selected === opt
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {display}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-zinc-800 shrink-0">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          {submitting ? 'Checking...' : allAnswered ? 'Complete Check' : 'Answer all questions to continue'}
        </button>
      </div>
    </div>
  );
}

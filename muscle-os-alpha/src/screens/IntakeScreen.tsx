import { useState } from 'react';
import { useChatStore } from '../stores/chat-store';
import { INTAKE_QUESTIONS } from '../services/intake-service';

export function IntakeScreen() {
  const { intakeAnswers, setIntakeAnswer, submitIntake } = useChatStore();
  const [submitting, setSubmitting] = useState(false);

  const sections = [1, 2, 3, 4, 5, 6, 7, 8];
  const sectionLabels = ['Training History', 'Body Composition & Goals', 'Cardio & Activity', 'Nutrition & Dieting', 'Recovery & Sleep', 'Lifestyle & Constraints', 'Adherence & Psychology', 'Female Health'];

  const questionsBySection = sections.map((s) =>
    INTAKE_QUESTIONS.filter((q) => q.section === s && (!q.skipIf || !q.skipIf(intakeAnswers)))
  );

  const allRequiredAnswered = INTAKE_QUESTIONS.every((q) => {
    if (q.options.length === 1) return true;
    if (q.skipIf && q.skipIf(intakeAnswers)) return true;
    return !!intakeAnswers[q.id];
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    await submitIntake();
    setSubmitting(false);
  };

  const visibleQuestions = INTAKE_QUESTIONS.filter((q) => !q.skipIf || !q.skipIf(intakeAnswers));
  const answeredCount = visibleQuestions.filter((q) => q.options.length === 1 || !!intakeAnswers[q.id]).length;
  const totalRequired = visibleQuestions.length;
  const progress = Math.round((answeredCount / totalRequired) * 100);

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <h1 className="text-sm font-semibold text-zinc-200">Your Profile</h1>
          <span className="text-[10px] text-zinc-600 ml-auto">~8 minutes</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] text-zinc-500 shrink-0">{answeredCount}/{totalRequired}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="text-sm text-zinc-400 mb-6">
          Tell me about your training history, nutrition, recovery, and lifestyle so I can tailor the program to you.
        </p>

        {sections.map((sectionIdx, si) => {
          const questions = questionsBySection[si];
          if (questions.length === 0) return null;
          const sectionAnswered = questions.every((q) => q.options.length === 1 || !!intakeAnswers[q.id]);
          return (
            <div key={sectionIdx} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  sectionAnswered ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-500'
                }`}>{si + 1}</div>
                <h2 className="text-sm font-semibold text-zinc-300">{sectionLabels[si]}</h2>
                {sectionAnswered && <span className="text-[10px] text-emerald-500">Done</span>}
              </div>
              <div className="space-y-2">
                {questions.map((q) => {
                  if (q.options.length === 1) return null;
                  const selected = intakeAnswers[q.id];
                  return (
                    <div key={q.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-3">
                      <div className="text-sm text-zinc-300 mb-2">{q.label}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {q.options.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setIntakeAnswer(q.id, opt.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              selected === opt.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-zinc-800 shrink-0">
        <button
          onClick={handleSubmit}
          disabled={!allRequiredAnswered || submitting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          {submitting ? 'Analysing...' : allRequiredAnswered ? 'Complete Profile' : 'Answer all questions to continue'}
        </button>
      </div>
    </div>
  );
}

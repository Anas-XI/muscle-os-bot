import { useChatStore } from '../stores/chat-store';

export function OnboardingSummary() {
  const { intakeAssessment, conversationPhase, handleEntrySelection } = useChatStore();

  if (!intakeAssessment || conversationPhase !== 'summary') return null;

  const { scores, flags, archetype, pillarPriorities, constraintProfile } = intakeAssessment;

  const scoreBars: { label: string; score: number; max: number; color: string }[] = [
    { label: 'Training', score: scores.trainingHistory, max: 15, color: 'bg-emerald-500' },
    { label: 'Nutrition', score: scores.nutrition, max: 15, color: 'bg-blue-500' },
    { label: 'Recovery', score: scores.recovery, max: 20, color: 'bg-violet-500' },
    { label: 'Adherence', score: scores.adherence, max: 10, color: 'bg-amber-500' },
  ];

  const archetypeDescriptions: Record<string, string> = {
    'Beginner': 'New to structured training. Focus on technique, consistency, and building the habit. You have massive room for progress with basic programming.',
    'Intermediate Plateaued': 'Solid foundation but progress has slowed. Need periodization, fatigue management, and targeted adjustments.',
    'Busy Professional': 'Time-constrained with competing demands. Efficiency is everything — full-body sessions, minimum effective dose, template-driven nutrition.',
    'Fat Loss Client': 'Primary goal is fat loss. Nutrition is the main lever. Training supports the deficit and preserves muscle.',
    'Strength Athlete': 'Experienced lifter focused on performance. Individualization, n-of-1 titration, and advanced periodization are key.',
    'Masters Athlete': '40+ or recovery-constrained. Recovery capacity is reduced. Lower volume, longer recovery windows, joint-friendly exercise selection.',
  };

  const whatWeProvide = [
    'Evidence-based training protocols matched to your experience level and goals',
    'Nutrition guidance with protein targets, meal structure, and micronutrient screening',
    'Recovery and sleep optimization based on your current stress and sleep profile',
    'Constraint-aware programming that fits your schedule and equipment',
    'Feedback loop system with structured measurement → adjustment → re-measurement cycles',
    'Micronutrient deficiency screening linked to symptoms like cramps, fatigue, poor sleep',
    'Progressive overload framework with periodization for continued adaptation',
    'Adherence tools and behavioral strategies matched to your consistency patterns',
  ];

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h1 className="text-sm font-semibold text-zinc-200">Your Muscle OS Profile</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Archetype card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Archetype</div>
          <div className="text-lg font-bold text-zinc-100 mb-2">{archetype}</div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {archetypeDescriptions[archetype] || 'Personalized coaching profile.'}
          </p>
        </div>

        {/* Score bars */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Assessment Scores</div>
          <div className="space-y-3">
            {scoreBars.map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">{bar.label}</span>
                  <span className="text-zinc-500">{bar.score}/{bar.max}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full ${bar.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(bar.score / bar.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between text-xs">
            <span className="text-zinc-400 font-semibold">Total</span>
            <span className="text-zinc-300 font-semibold">{scores.total}/60</span>
          </div>
        </div>

        {/* Flags & Constraints */}
        {flags.length > 0 && (
          <div className="bg-zinc-900 rounded-2xl border border-amber-800/40 p-4">
            <div className="text-[10px] text-amber-500 uppercase tracking-wider mb-2">Flags & Constraints</div>
            <div className="flex flex-wrap gap-1.5">
              {flags.map((f) => (
                <span key={f} className="px-2 py-1 bg-amber-900/30 border border-amber-800/40 rounded-lg text-[11px] text-amber-300">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pillar Priorities */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Priority Focus Areas</div>
          <ol className="space-y-1.5">
            {pillarPriorities.map((p, i) => (
              <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                <span className="text-zinc-500 font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* What Muscle OS Provides */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-4">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">What Muscle OS Provides</div>
          <div className="space-y-1.5">
            {whatWeProvide.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Continue to coaching */}
      <div className="px-4 py-3 border-t border-zinc-800 shrink-0 space-y-2">
        <button
          onClick={() => handleEntrySelection('plateau')}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Start Coaching — I Want to Improve
        </button>
        <div className="flex gap-2">
          <button onClick={() => handleEntrySelection('starting')} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors">
            I'm New
          </button>
          <button onClick={() => handleEntrySelection('returning')} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors">
            I'm Returning
          </button>
          <button onClick={() => handleEntrySelection('recovery')} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors">
            I'm Tired
          </button>
        </div>
      </div>
    </div>
  );
}

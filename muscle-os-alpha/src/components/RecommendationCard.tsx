import type { Recommendation } from '../models/recommendation';

interface Props {
  recommendation: Recommendation;
  onAccept: () => void;
  onReject: () => void;
}

function tierColor(tier: string): string {
  switch (tier) {
    case 'Established': return 'bg-emerald-600/20 text-emerald-400';
    case 'Emerging': return 'bg-amber-600/20 text-amber-400';
    case 'Exploratory': return 'bg-orange-600/20 text-orange-400';
    default: return 'bg-zinc-600/20 text-zinc-400';
  }
}

export function RecommendationCard({ recommendation, onAccept, onReject }: Props) {
  const confidenceColor =
    recommendation.confidence === 'High' ? 'text-emerald-400' :
    recommendation.confidence === 'Medium' ? 'text-amber-400' :
    'text-zinc-400';

  return (
    <div className="mx-4 my-3 rounded-2xl border border-zinc-700 bg-zinc-900 overflow-hidden">
      <div className="bg-emerald-600/10 px-4 py-2 border-b border-zinc-700">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Your Plan</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-0.5">Most Likely Cause</div>
          <div className="text-sm text-zinc-200">{recommendation.mostLikelyCause}</div>
        </div>
        <div className="flex gap-4">
          <div>
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-0.5">Confidence</div>
            <div className={`text-sm font-semibold ${confidenceColor}`}>{recommendation.confidence}</div>
          </div>
          <div>
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-0.5">Next Review</div>
            <div className="text-sm text-zinc-200">{recommendation.nextReviewDate}</div>
          </div>
        </div>
        <div>
          <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-0.5">Recommended Action</div>
          <div className="text-sm text-zinc-200">{recommendation.recommendedAction}</div>
        </div>
        <div>
          <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-0.5">Why This</div>
          <div className="text-sm text-zinc-400">{recommendation.why}</div>
        </div>
        {recommendation.evidence && recommendation.evidence.length > 0 && (
          <div>
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1.5">Evidence</div>
            <div className="space-y-1">
              {recommendation.evidence.map((ev, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${tierColor(ev.tier)}`}>
                    {ev.tier}
                  </span>
                  <span className="text-xs text-zinc-300">{ev.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex border-t border-zinc-700">
        <button
          onClick={onAccept}
          className="flex-1 py-3 text-sm font-medium text-emerald-400 hover:bg-emerald-600/10 transition-colors border-r border-zinc-700"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="flex-1 py-3 text-sm font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
        >
          Ask more
        </button>
      </div>
    </div>
  );
}

import { parseRecommendation, type Recommendation } from '../models/recommendation';

export { parseRecommendation };
export type { Recommendation };

export function formatRecommendation(r: Recommendation): string {
  return `**Most Likely Cause:** ${r.mostLikelyCause}
**Confidence:** ${r.confidence}
**Recommended Action:** ${r.recommendedAction}
**Next Review:** ${r.nextReviewDate}
**Why This:** ${r.why}`;
}

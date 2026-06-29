export interface EvidenceRef {
  label: string;
  tier: 'Established' | 'Emerging' | 'Exploratory' | 'No direct evidence';
  source: string;
}

export interface Recommendation {
  mostLikelyCause: string;
  confidence: 'Low' | 'Medium' | 'High';
  recommendedAction: string;
  nextReviewDate: string;
  why: string;
  evidence?: EvidenceRef[];
}

export function parseRecommendation(text: string): Recommendation | null {
  const cause = text.match(/\*\*Most Likely Cause:\*\*\s*(.+)/);
  const confidence = text.match(/\*\*Confidence:\*\*\s*(Low|Medium|High)/);
  const action = text.match(/\*\*Recommended Action:\*\*\s*(.+)/);
  const review = text.match(/\*\*Next Review:\*\*\s*(.+)/);
  const why = text.match(/\*\*Why This:\*\*\s*(.+)/);

  if (!cause || !confidence || !action || !review || !why) {
    return null;
  }

  // Parse evidence references
  const evidence: EvidenceRef[] = [];
  const evidenceLines = text.match(/\*\*Evidence:\*\*([\s\S]*?)(?:\n\*\*|\n$|$)/);
  if (evidenceLines) {
    const lines = evidenceLines[1].trim().split('\n');
    for (const line of lines) {
      const match = line.match(/-\s*(.+?)\s+\((.+?)\)\s*--?\s*(.+)/);
      if (match) {
        evidence.push({
          label: match[1].trim(),
          tier: match[2].trim() as EvidenceRef['tier'],
          source: match[3].trim(),
        });
      }
    }
  }

  return {
    mostLikelyCause: cause[1].trim(),
    confidence: confidence[1] as 'Low' | 'Medium' | 'High',
    recommendedAction: action[1].trim(),
    nextReviewDate: review[1].trim(),
    why: why[1].trim(),
    evidence: evidence.length > 0 ? evidence : undefined,
  };
}

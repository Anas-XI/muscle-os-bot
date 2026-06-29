import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { ChatMessage, MessageRole, MessageType } from '../models/chat-message';
import type { Session } from '../models/session';
import type { Recommendation } from '../models/recommendation';
import type { TriageResult } from '../models/triage-result';
import type { IntakeAssessment } from '../models/intake-assessment';
import { sessionService } from '../services/session-service';
import { analyticsService } from '../services/analytics-service';
import { streamChat, checkConnection, LmStudioError, resetConnectionState } from '../services/lm-studio-client';
import { buildSystemPrompt } from '../config/diagnostics';
import { parseRecommendation } from '../models/recommendation';
import {
  getPlateauQuestions,
  getRecoveryQuestions,
  getNewUserQuestions,
  getReturningQuestions,
  diagnosePlateau,
  diagnoseRecovery,
} from '../services/diagnosis-engine';
import { diagnose as decisionEngineDiagnose, getSynergyRecommendations } from '../services/decision-engine';
import { getNutritionSnapshot } from '../services/nutrition-bridge-service';
import { assessConflicts, getGoalCompatibility } from '../services/conflict-resolution-engine';

export type ConversationPhase =
  | 'greeting'
  | 'entry_selection'
  | 'triage'
  | 'intake_assessment'
  | 'summary'
  | 'diagnosis_questions'
  | 'diagnosing'
  | 'recommendation'
  | 'followup'
  | 'review'
  | 'adjustment'
  | 'reassessment';

interface ChatState {
  lmStudioConnected: boolean;
  lmStudioModel: string | null;
  lmStudioError: string | null;
  currentSession: Session | null;
  conversationPhase: ConversationPhase;
  messages: ChatMessage[];
  isStreaming: boolean;
  streamedContent: string;
  triageResult: TriageResult | null;
  triageAnswers: Record<string, string>;
  intakeAssessment: IntakeAssessment | null;
  intakeAnswers: Record<string, string>;
  entryPath: string | null;
  findings: Record<string, unknown>;
  currentQuestionIndex: number;
  diagnosisQuestions: { key: string; label: string; options: string[] }[];
  diagnosisAnswers: Record<string, string>;
  currentRecommendation: Recommendation | null;
  recommendationText: string;
  reviewDate: string | null;
  interventionHistory: string[];
  synergyInsights: string[];
  decisionEngineResult: string | null;

  initialize: () => Promise<void>;
  startNewSession: () => Promise<void>;
  startFollowUpSession: () => Promise<void>;
  resumeSession: (session: Session) => Promise<void>;
  addMessage: (role: MessageRole, content: string, type?: MessageType, metadata?: string) => Promise<ChatMessage>;
  sendMessage: (content: string) => Promise<void>;
  handleEntrySelection: (path: string) => void;
  setTriageAnswer: (questionId: string, answer: string) => void;
  submitTriage: () => Promise<void>;
  setIntakeAnswer: (questionId: string, answer: string) => void;
  submitIntake: () => Promise<void>;
  handleDiagnosisAnswer: (answer: string) => void;
  appendStreamedContent: (chunk: string) => void;
  finishStreaming: () => void;
  acceptRecommendation: () => Promise<void>;
  rejectRecommendation: () => Promise<void>;
  scheduleReview: (date: string) => void;
  submitReview: (worked: boolean, notes: string) => Promise<void>;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  lmStudioConnected: false,
  lmStudioModel: null,
  lmStudioError: null,
  currentSession: null,
  conversationPhase: 'greeting',
  messages: [],
  isStreaming: false,
  streamedContent: '',
  triageResult: null,
  triageAnswers: {},
  intakeAssessment: null,
  intakeAnswers: {},
  entryPath: null,
  findings: {},
  currentQuestionIndex: 0,
  diagnosisQuestions: [],
  diagnosisAnswers: {},
  currentRecommendation: null,
  recommendationText: '',
  reviewDate: null,
  interventionHistory: [],
  synergyInsights: [],
  decisionEngineResult: null,

  initialize: async () => {
    resetConnectionState();
    const result = await checkConnection();
    set({ lmStudioConnected: result.connected, lmStudioModel: result.modelName, lmStudioError: result.error });

    const latest = await sessionService.latestSession();
    if (latest && !sessionService.isStale(latest)) {
      set({ currentSession: latest, conversationPhase: 'greeting' });
      const msgs = await sessionService.getMessages(latest.id);
      set({ messages: msgs });

      const lastAssistantMsg = [...msgs].reverse().find((m) => m.role === 'assistant');
      if (lastAssistantMsg) {
        const rec = parseRecommendation(lastAssistantMsg.content);
        if (rec) {
          set({
            conversationPhase: 'recommendation',
            currentRecommendation: rec,
            recommendationText: lastAssistantMsg.content,
          });
          return;
        }
      }
    }
  },

  startNewSession: async () => {
    const session = await sessionService.createSession();
    set({
      currentSession: session,
      messages: [],
      conversationPhase: 'greeting',
      triageResult: null, triageAnswers: {},
      intakeAssessment: null, intakeAnswers: {},
      entryPath: null, findings: {},
      currentQuestionIndex: 0, diagnosisQuestions: [], diagnosisAnswers: {},
      currentRecommendation: null, recommendationText: '',
      reviewDate: null, interventionHistory: [], synergyInsights: [], decisionEngineResult: null,
    });
    await analyticsService.track(session.id, 'session_started', { isReentry: false });
  },

  startFollowUpSession: async () => {
    const state = get();
    const history = state.interventionHistory;
    const session = await sessionService.createSession();
    set({
      currentSession: session,
      messages: [],
      conversationPhase: 'greeting',
      triageResult: null, triageAnswers: {},
      intakeAssessment: null, intakeAnswers: {},
      entryPath: null, findings: {},
      currentQuestionIndex: 0, diagnosisQuestions: [], diagnosisAnswers: {},
      currentRecommendation: null, recommendationText: '',
      reviewDate: null, interventionHistory: history,
      synergyInsights: [], decisionEngineResult: null,
    });
    await analyticsService.track(session.id, 'session_started', { isReentry: true, previousInterventions: history.length });
  },

  resumeSession: async (session: Session) => {
    const msgs = await sessionService.getMessages(session.id);
    set({ currentSession: session, messages: msgs });
    await sessionService.updateSession(session.id, { status: 'active' });
    await analyticsService.track(session.id, 'session_resumed');
  },

  addMessage: async (role, content, type = 'text', metadata?) => {
    const session = get().currentSession;
    if (!session) throw new Error('No active session');
    const msg = await sessionService.addMessage(session.id, role, content, type, metadata);
    set((s) => ({ messages: [...s.messages, msg] }));
    return msg;
  },

  sendMessage: async (content: string) => {
    const state = get();
    if (!state.lmStudioConnected) {
      await get().addMessage('assistant', "I can't reach LM Studio. Make sure it's running on port 1234.");
      return;
    }

    await get().addMessage('user', content);
    set({ isStreaming: true, streamedContent: '' });

    // Get live nutrition data from tracker
    const nutritionSnapshot = await getNutritionSnapshot();

    const systemPrompt = buildSystemPrompt({
      triageResult: state.triageResult?.result ?? 'Green',
      entryPath: state.entryPath ?? 'unknown',
      findings: state.findings,
      intakeAssessment: state.intakeAssessment ?? undefined,
      interventionHistory: state.interventionHistory.length > 0 ? state.interventionHistory : undefined,
      synergyInsights: state.synergyInsights.length > 0 ? state.synergyInsights : undefined,
      previousRecommendation: state.currentRecommendation ? `${state.currentRecommendation.mostLikelyCause} → ${state.currentRecommendation.recommendedAction}` : undefined,
      nutritionSnapshot: nutritionSnapshot.summary,
    });

    const conversation = [
      { role: 'system', content: systemPrompt },
      ...get().messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content })),
    ];

    const startTime = Date.now();
    let fullContent = '';

    try {
      for await (const chunk of streamChat(conversation)) {
        fullContent += chunk;
        get().appendStreamedContent(chunk);
      }
    } catch (err) {
      const msg = err instanceof LmStudioError ? err.message : 'Something went wrong. Try again.';
      get().appendStreamedContent(msg);
      fullContent += msg;
    }

    await get().addMessage('assistant', fullContent);
    set({ isStreaming: false, streamedContent: '' });

    const timeToDiagnosis = Math.round((Date.now() - startTime) / 1000);
    const rec = parseRecommendation(fullContent);
    if (rec) {
      set({ conversationPhase: 'recommendation', currentRecommendation: rec, recommendationText: fullContent });
      const session = get().currentSession;
      if (session) {
        await sessionService.updateSession(session.id, { recommendationJson: JSON.stringify(rec) });
        await analyticsService.track(session.id, 'recommendation_generated', { timeToDiagnosisSeconds: timeToDiagnosis });
      }
    }
  },

  handleEntrySelection: (path: string) => {
    set({ entryPath: path });

    // Get goal from intake if available for goal-specific questions
    const intakeGoal = get().intakeAssessment?.answers?.Q6 ?? '';
    const goalMap: Record<string, string> = {
      'lose_significant': 'fat_loss',
      'lose_moderate': 'fat_loss',
      'lose_small': 'fat_loss',
      'maintain': 'recomp',
      'gain_muscle': 'hypertrophy',
      'not_sure': 'hypertrophy',
    };
    const mappedGoal = goalMap[intakeGoal] ?? 'hypertrophy';

    if (path === 'plateau') {
      set({ conversationPhase: 'diagnosis_questions', diagnosisQuestions: getPlateauQuestions(mappedGoal), currentQuestionIndex: 0, diagnosisAnswers: {} });
    } else if (path === 'recovery') {
      set({ conversationPhase: 'diagnosis_questions', diagnosisQuestions: getRecoveryQuestions(), currentQuestionIndex: 0, diagnosisAnswers: {} });
    } else if (path === 'starting') {
      set({ conversationPhase: 'diagnosis_questions', diagnosisQuestions: getNewUserQuestions(), currentQuestionIndex: 0, diagnosisAnswers: {} });
    } else if (path === 'returning') {
      set({ conversationPhase: 'diagnosis_questions', diagnosisQuestions: getReturningQuestions(), currentQuestionIndex: 0, diagnosisAnswers: {} });
    }
  },

  setTriageAnswer: (questionId, answer) => {
    set((s) => ({ triageAnswers: { ...s.triageAnswers, [questionId]: answer } }));
  },

  submitTriage: async () => {
    const { computeTriage } = await import('../services/safety-triage-service');
    const result = computeTriage(get().triageAnswers);
    set({ triageResult: result });

    const session = get().currentSession;
    if (session) {
      await sessionService.updateSession(session.id, { triageResult: result.result.toLowerCase() as 'green' | 'yellow' | 'red' });
    }

    if (result.result === 'Red') {
      if (session) await analyticsService.track(session.id, 'triage_red_blocked', { flagged: result.flagged });
      set({ conversationPhase: 'recommendation' });
    } else {
      if (session) await analyticsService.track(session.id, 'triage_completed', { result: result.result });
      set({ conversationPhase: 'intake_assessment' });
    }
  },

  setIntakeAnswer: (questionId, answer) => {
    set((s) => ({ intakeAnswers: { ...s.intakeAnswers, [questionId]: answer } }));
  },

  submitIntake: async () => {
    const { computeIntakeAssessment } = await import('../services/intake-service');
    const assessment = computeIntakeAssessment(get().intakeAnswers);
    set({ intakeAssessment: assessment, conversationPhase: 'summary' });

    const session = get().currentSession;
    if (session) {
      await analyticsService.track(session.id, 'intake_completed', {
        archetype: assessment.archetype,
        totalScore: assessment.scores.total,
        flags: assessment.flags,
      });
    }
  },

  handleDiagnosisAnswer: (answer: string) => {
    const state = get();
    const idx = state.currentQuestionIndex;
    const q = state.diagnosisQuestions[idx];
    if (!q) return;

    const newAnswers = { ...state.diagnosisAnswers, [q.key]: answer };

    if (idx + 1 < state.diagnosisQuestions.length) {
      set({ diagnosisAnswers: newAnswers, currentQuestionIndex: idx + 1 });
    } else {
      const boolMap: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(newAnswers)) {
        boolMap[k] = v.toLowerCase() === 'yes';
      }

      // Extract actual goal from intake assessment
      const intakeGoal = state.intakeAssessment?.answers?.Q6 ?? 'hypertrophy';
      const goalMap: Record<string, string> = {
        'lose_significant': 'fat_loss',
        'lose_moderate': 'fat_loss',
        'lose_small': 'fat_loss',
        'maintain': 'recomp',
        'gain_muscle': 'hypertrophy',
        'not_sure': 'hypertrophy',
      };
      const mappedGoal = goalMap[intakeGoal] ?? 'hypertrophy';

      let findings: Record<string, unknown> = {};
      if (state.entryPath === 'plateau') {
        findings = { ...diagnosePlateau(mappedGoal, boolMap) };
      } else if (state.entryPath === 'recovery') {
        findings = { ...diagnoseRecovery(boolMap) };
      } else if (state.entryPath === 'starting') {
        findings = { goal: mappedGoal, profile: state.intakeAssessment?.archetype ?? 'intermediate', tracking: true, trainingHistory: true };
      } else if (state.entryPath === 'returning') {
        findings = { daysAway: newAnswers.daysAway ?? 'unknown', previousActivity: newAnswers.previousActivity ?? 'unknown' };
      }

      // Run decision engine with synergy matrix
      if (state.intakeAssessment) {
        const deCtx = {
          goal: mappedGoal,
          archetype: state.intakeAssessment.archetype,
          flags: state.intakeAssessment.flags,
          scores: state.intakeAssessment.scores,
          constraints: state.intakeAssessment.constraintProfile,
          findings: findings as Record<string, boolean | string | number>,
        };
        const deResult = decisionEngineDiagnose(deCtx);
        const synergies = getSynergyRecommendations(deCtx);

        findings.decisionEngineCategory = deResult.primary?.category ?? 'none';
        findings.decisionEngineBottleneck = deResult.primary?.bottleneck ?? 'unknown';
        findings.decisionEngineAction = deResult.primary?.suggestedAction ?? '';
        findings.decisionEngineConfidence = deResult.primary?.confidence ?? 'Medium';
        findings.synergies = synergies.map(s => s.description);

        // Check for goal conflicts
        const goalCompatibility = getGoalCompatibility(mappedGoal as any, state.intakeAssessment?.answers?.Q10 as any);
        if (goalCompatibility === 'conflicting') {
          findings.goalConflict = true;
          const conflictResult = assessConflicts([mappedGoal as any, state.intakeAssessment?.answers?.Q10 as any]);
          findings.goalConflictResolution = conflictResult.recommendation;
        }

        set({
          synergyInsights: synergies.map(s => s.description),
          decisionEngineResult: deResult.primary?.bottleneck ?? null,
        });
      }

      set({ diagnosisAnswers: newAnswers, findings, diagnosisQuestions: [], conversationPhase: 'diagnosing' });
      get().sendMessage(`I'm here for help with ${state.entryPath}. My goal: ${mappedGoal}. Findings: ${JSON.stringify(findings)}`);
    }
  },

  appendStreamedContent: (chunk) => {
    set((s) => ({ streamedContent: s.streamedContent + chunk }));
  },

  finishStreaming: () => {
    set({ isStreaming: false, streamedContent: '' });
  },

  acceptRecommendation: async () => {
    const session = get().currentSession;
    const rec = get().currentRecommendation;
    if (session) {
      await sessionService.updateSession(session.id, { acceptanceStatus: 'accepted' });
      await analyticsService.track(session.id, 'recommendation_accepted');

      // Track intervention in history
      const historyEntry = `${rec?.mostLikelyCause ?? 'unknown'} → ${rec?.recommendedAction ?? 'unknown'}`;
      set(s => ({
        interventionHistory: [...s.interventionHistory, historyEntry],
        reviewDate: rec?.nextReviewDate ?? '2 weeks',
      }));
    }
  },

  rejectRecommendation: async () => {
    const session = get().currentSession;
    if (session) {
      await sessionService.updateSession(session.id, { acceptanceStatus: 'rejected' });
      await analyticsService.track(session.id, 'recommendation_rejected');
    }
  },

  scheduleReview: (date: string) => {
    set({ reviewDate: date });
  },

  submitReview: async (worked: boolean, notes: string) => {
    const session = get().currentSession;
    if (session) {
      await analyticsService.track(session.id, worked ? 'review_positive' : 'review_negative', { notes });

      if (worked) {
        set({ conversationPhase: 'reassessment' });
        await get().addMessage('assistant', 'Great that the intervention worked! Lets reassess and see if theres a new bottleneck to address, or if we should continue with the current protocol.');
      } else {
        // Secondary Diagnostic Framework — vault's rule: if it didn't work, you misdiagnosed
        set({ conversationPhase: 'adjustment' });
        await get().addMessage('assistant', 'The intervention didnt produce the expected result. This means our initial diagnosis was incomplete. Lets run the secondary diagnostic framework to find what we missed.');
      }
    }
  },

  reset: () => {
    set({
      currentSession: null, conversationPhase: 'greeting', messages: [],
      isStreaming: false, streamedContent: '',
      lmStudioModel: null, lmStudioError: null,
      triageResult: null, triageAnswers: {},
      intakeAssessment: null, intakeAnswers: {},
      entryPath: null, findings: {},
      currentQuestionIndex: 0, diagnosisQuestions: [], diagnosisAnswers: {},
      currentRecommendation: null, recommendationText: '',
      reviewDate: null, interventionHistory: [], synergyInsights: [], decisionEngineResult: null,
    });
  },
}));

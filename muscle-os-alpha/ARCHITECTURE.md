# Muscle OS Alpha — Architecture

## Overview

Muscle OS Alpha is a desktop chat application that validates whether Muscle OS
recommendations help plateaued intermediate lifters make better decisions.

Built with React + TypeScript + Vite. Runs in browser (dev) or Electron (prod).
Connects to a local LM Studio instance running gemma-4-4b-it for AI coaching.

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI | React 19 + Tailwind CSS 4 | Chat interface, triage screen, quick replies |
| State | Zustand 5 | Single store for all app state |
| Storage | Dexie.js (IndexedDB) | Session persistence, message history, analytics |
| AI | LM Studio (gemma-4-4b-it) | Natural language coaching via OpenAI-compat API |
| Desktop | Electron (optional) | Native window, no CORS issues |
| Build | Vite 6 | Fast HMR, production builds in <3s |

## Directory Structure

```
src/
├── config/              # LM Studio URL, system prompt builder
├── models/              # TypeScript interfaces (no codegen)
├── services/            # Pure logic — ports from Python MoS
│   ├── safety-triage-service.ts   # compute_triage() port (22Q → G/Y/R)
│   ├── diagnosis-engine.ts         # Entry paths + diagnosis logic
│   ├── session-service.ts          # Session CRUD + stale detection
│   ├── lm-studio-client.ts         # OpenAI-compat API with streaming
│   ├── recommendation-service.ts   # Output formatting
│   └── analytics-service.ts        # Local event tracking
├── stores/
│   └── chat-store.ts               # Zustand store (single, not fragmented)
├── screens/
│   ├── ChatScreen.tsx              # Main chat interface
│   └── TriageScreen.tsx            # 22-question safety check
├── components/
│   ├── ChatBubble.tsx              # Message bubble with markdown
│   ├── StreamingText.tsx           # Token-by-token typewriter effect
│   ├── QuickReplyBar.tsx           # Context-sensitive button row
│   └── RecommendationCard.tsx      # Structured recommendation display
├── database/
│   └── db.ts                       # Dexie/IndexedDB setup
├── App.tsx
├── main.tsx
└── index.css
```

## Data Flow

```
User opens app
  → SessionService checks IndexedDB for active session
    → Found < 7d old → "Welcome back, still working on X?"
    → None or stale → fresh session

Fresh session flow:
  1. Safety Triage (22 questions, ~2 min)
     → Red: hard stop, referral message
     → Yellow/Green: proceed
  2. Entry selection (4 quick reply buttons)
     → Plateau | Recovery | Starting | Returning
  3. Diagnosis questions (context-sensitive, quick replies)
     → Answers collected → findings computed (pure Dart logic, 0ms)
  4. LLM Diagnosis (findings injected into system prompt)
     → Gemma 4B via LM Studio streaming API
     → Structured recommendation: cause, confidence, action, review, why
  5. Recommendation card displayed
     → Accept / Not Sure / Ask More
  6. Session saved + analytics tracked
```

## LM Studio Integration

- **URL:** `http://localhost:1234/v1`
- **Model:** `gemma-4-4b-it`
- **API:** OpenAI-compatible chat completions with SSE streaming
- **System prompt** injected with real-time diagnostics (triage result, entry path, findings)
- **Error handling:** Connection check on init, retry button, graceful degradation
- **Temperature:** 0.3 (consistent coaching), max 2048 tokens

## Key Ports from Python

| Python File | TS Service | Lines | Notes |
|---|---|---|---|
| `arbitration_engine.py` (compute_triage) | `safety-triage-service.ts` | ~90 | Full 22-question map + risk scoring |
| `mos_cli.py` (diagnosis paths) | `diagnosis-engine.ts` | ~160 | Entry classification, plateau/recovery/starting paths |
| `session_state.py` (minus prereq registry) | `session-service.ts` | ~100 | Create, save, resume, stale detection |
| `mos_cli.py` (evidence mapping) | `recommendation-service.ts` | ~20 | Parse LLM structured output |

## Analytics Events

| Event | Trigger |
|---|---|
| `session_started` | New session created |
| `triage_completed` | Safety check done |
| `triage_red_blocked` | Red user stopped |
| `recommendation_generated` | LLM returned structured output |
| `recommendation_accepted` | User accepted |
| `recommendation_rejected` | User tapped "Not Sure" |
| `session_completed` | User finished |

All stored in IndexedDB `analyticsEvents` table. Query with `analyticsService.getMetrics()`.

## Running

```bash
# Dev (browser)
npm run dev

# Production build
npm run build

# With Electron (after npm run electron:install)
npm run electron:dev
```

## Build Verification

- `npm install` (or `npm install --omit=optional` if electron fails)
- `npx vite build` → clean build in ~3s
- `npm run dev` → opens on localhost:5173
- LM Studio must be running on port 1234 with `gemma-4-4b-it` loaded

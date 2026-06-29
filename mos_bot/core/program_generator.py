import json
import os
import requests
from mos_bot.config import LM_STUDIO_URL, PROGRAMS_DIR, LLM_API_KEY, LLM_API_URL, LLM_MODEL

SYSTEM_PROMPT = """You are Muscle OS, an evidence-based AI coaching system. 
You have access to the Muscle OS vault — a structured knowledge base of training, 
nutrition, sleep, recovery, and injury protocols.

Your job: generate a complete, personalized coaching program from the user profile 
provided. Use the vault documents to inform every decision.

FORMAT RULES:
- Use markdown with headers, tables, and code blocks
- Structure: Profile Summary → Constraint Analysis → Program Overview → 
  Training (Phase 1 + Phase 2) → Nutrition → Sleep → Supplements → 
  Rehab/Prehab → Measurement KPIs → Adjustment Triggers → 
  Exercise Alternatives → Week 1 Action Plan → Sources
- Cite vault documents in Sources section
- Be specific: exact sets, reps, RIR, weights, grams, timing
- If constraints conflict, resolve explicitly and explain the resolution
- Never recommend anything that conflicts with the triage result
- If ed_risk is true: set calories to maintenance only, no deficit

COACHING HIERARCHY (always apply in this order):
Safety > Adherence > Recovery > Nutrition > Training > Optimisation"""


def _lm_available() -> bool:
    """Quick health check — returns True if LM Studio is reachable."""
    try:
        r = requests.get(f"{LM_STUDIO_URL}/v1/models", timeout=3)
        r.raise_for_status()
        return True
    except Exception:
        return False


def _build_headers() -> dict:
    headers = {"Content-Type": "application/json"}
    if LLM_API_KEY:
        headers["Authorization"] = f"Bearer {LLM_API_KEY}"
    return headers


def _build_url() -> str:
    if LLM_API_URL:
        return f"{LLM_API_URL.rstrip('/')}/chat/completions"
    return f"{LM_STUDIO_URL}/v1/chat/completions"


def _build_model_list() -> list:
    if LLM_MODEL:
        return [LLM_MODEL]
    return ["gemma-4-e4b-it", "qwen3.6-27b"]


def generate_program(profile: dict, vault_context: str) -> str:
    use_cloud = bool(LLM_API_KEY and LLM_API_URL)
    if not use_cloud and (not LM_STUDIO_URL or not _lm_available()):
        return None

    user_message = (
        f"User Profile:\n{json.dumps(profile, indent=2)}\n\n"
        f"Vault Knowledge:\n{vault_context}\n\n"
        f"Generate a complete coaching program for this user."
    )

    payload = {
        "model": "",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.4,
        "max_tokens": 2000,
        "stream": False,
    }

    url = _build_url()
    headers = _build_headers()
    models = _build_model_list()
    timeout = 120 if use_cloud else 600

    for model in models:
        payload["model"] = model
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=timeout)
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            if content:
                break
        except Exception:
            if model == models[-1]:
                return None
            continue
    else:
        return None

    os.makedirs(PROGRAMS_DIR, exist_ok=True)
    path = os.path.join(PROGRAMS_DIR, f"{profile['user_id']}_program.md")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return content

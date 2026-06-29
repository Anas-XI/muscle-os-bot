import os
from mos_bot.config import VAULT_ROOT

MAX_CHARS = 12000
MAX_PER_DOC = 4000


def _read(*parts) -> str:
    full = os.path.join(VAULT_ROOT, *parts)
    if os.path.exists(full):
        with open(full, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    return ""


def _truncate(content: str, max_chars: int) -> str:
    if len(content) <= max_chars:
        return content
    return content[:max_chars] + "\n\n[... truncated ...]"


def get_vault_context(profile: dict) -> str:
    candidates = []

    def add(path_parts, priority):
        content = _read(*path_parts) if isinstance(path_parts, tuple) else _read(path_parts)
        if content:
            label = path_parts[-1] if isinstance(path_parts, tuple) else path_parts.split("/")[-1]
            candidates.append((priority, label, content))

    add("Muscle OS Core Engine.md", 0)

    goal = profile.get("goal", "")
    if goal in ("hypertrophy", "bulk") or "build muscle" in goal.lower():
        add(("04_TOOLS", "Decision Trees", "Bulking Decision Tree.md"), 1)
    elif goal in ("fat_loss", "cut") or "lose fat" in goal.lower():
        for fn in ["Cutting Decision Tree.md", "Fat Loss Plateau Decision Tree.md"]:
            p = ("04_TOOLS", "Decision Trees", fn)
            if os.path.exists(os.path.join(VAULT_ROOT, *p)):
                add(p, 1)
                break
    elif goal in ("strength",) or "stronger" in goal.lower():
        for fn in ["Strength Decision Tree.md", "Strength Plateau Decision Tree.md"]:
            p = ("04_TOOLS", "Decision Trees", fn)
            if os.path.exists(os.path.join(VAULT_ROOT, *p)):
                add(p, 1)
                break

    injuries = profile.get("injuries", [])
    has_injuries = bool(injuries and not (len(injuries) == 1 and not injuries[0]))
    if has_injuries:
        add(("04_TOOLS", "Injury-Training Compatibility Matrix.md"), 1)
        rehab = os.path.join(VAULT_ROOT, "04_PROTOCOLS", "Rehab")
        if os.path.isdir(rehab):
            for fname in os.listdir(rehab):
                if not fname.endswith(".md"):
                    continue
                for inj in injuries:
                    words = inj.lower().split()
                    if any(kw in fname.lower().replace("-", " ").replace("_", " ") for kw in words):
                        add(("04_PROTOCOLS", "Rehab", fname), 1)
                        break

    sleep = profile.get("sleep_hours", 8)
    if isinstance(sleep, (int, float)) and sleep < 7:
        studies = os.path.join(VAULT_ROOT, "01_RESEARCH", "Studies")
        if os.path.isdir(studies):
            for fname in sorted(os.listdir(studies)):
                if "sleep" in fname.lower() and fname.endswith(".md"):
                    add(("01_RESEARCH", "Studies", fname), 2)
                    break

    alc = profile.get("alcohol_weekly", 0)
    if isinstance(alc, (int, float)) and alc >= 5:
        add(("02_PILLARS", "Pillar 3 - Sleep Maxing.md"), 1)

    urine = profile.get("urine_color", "")
    cramps = profile.get("muscle_cramps", False)
    if urine in ("dark_yellow", "amber_brown") or cramps:
        add(("04_PROTOCOLS", "Hydration Protocol.md"), 2)

    work = profile.get("work_schedule", "")
    if work in ("night", "rotating", "early"):
        add(("04_PROTOCOLS", "Shift Work & Circadian Rhythm Protocol.md"), 2)
        add(("07_PROFILES", "Shift Worker Profile.md"), 2)

    bloodwork = profile.get("last_bloodwork", "")
    if bloodwork in ("2yr_plus", "never"):
        add(("05_SYSTEMS", "Bloodwork Recommendation Engine.md"), 2)

    mh = profile.get("mental_health_concern", "")
    if mh in ("moderate", "significant"):
        add(("05_SYSTEMS", "Muscle OS Safety Triage.md"), 2)

    gut = profile.get("gut_health", "none")
    fermented = profile.get("fermented_foods", "")
    if gut != "none" or fermented in ("rarely_never",):
        add(("04_PROTOCOLS", "Fiber Progression Protocol.md"), 2)

    mobility = profile.get("mobility_limitations", [])
    joint_pain = profile.get("joint_pain", "")
    if mobility or joint_pain not in ("", "no_pain"):
        add(("03_ASSESSMENTS", "Posture Assessment System.md"), 2)

    add(("02_PILLARS", "Pillar 1 - Diet Maxing.md"), 3)
    add(("02_PILLARS", "Pillar 2 - Training Maxing.md"), 3)
    add(("02_PILLARS", "Pillar 3 - Sleep Maxing.md"), 3)

    for p in [
        ("05_SYSTEMS", "Constraint Resolution Engine.md"),
        ("05_SYSTEMS", "Muscle OS Feedback Loop System.md"),
        ("04_TOOLS", "Exercises", "Exercise Index.md"),
    ]:
        add(p, 4)

    candidates.sort(key=lambda x: x[0])

    budget = MAX_CHARS
    chunks = []
    for _, _, content in candidates:
        if budget <= 0:
            break
        per_doc = min(MAX_PER_DOC, budget)
        truncated = _truncate(content, per_doc)
        chunks.append(truncated)
        budget -= len(truncated)

    return "\n\n---\n\n".join(chunks)

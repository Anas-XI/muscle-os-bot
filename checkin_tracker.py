from dataclasses import dataclass, field


@dataclass
class CheckInRecord:
    timestamp: str = ""
    weight_kg: float = 0.0
    waist_cm: float = 0.0
    readiness: int = 5
    adherence_pct: int = 100
    soreness: int = 3
    sleep_hours: float = 7.0
    top_set_reps: list = field(default_factory=list)


class CheckInStore:
    def __init__(self, path: str):
        self.path = path
        self._records: dict[str, list[CheckInRecord]] = {}

    def add(self, user_id: str, record: CheckInRecord):
        self._records.setdefault(user_id, []).append(record)

    def load_all(self, user_id: str) -> list[CheckInRecord]:
        return self._records.get(user_id, [])


def analyse_trends(records: list[CheckInRecord]) -> list[dict]:
    return []


def suggest_adjustments(trends: list[dict], goal: str, current_calories: int = 2500) -> list[str]:
    return []


def format_trends(trends: list[dict]) -> str:
    return ""


def format_adjustments(adj: list[str]) -> str:
    return ""

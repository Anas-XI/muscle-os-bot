"""Test program_generator.py — LLM call mocked, output parsed correctly."""

import sys
import os
import json
import unittest.mock as mock
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "mos_bot"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "Muscle Operating System", "00_META", "scripts"))

from mos_bot.core.program_generator import generate_program


def test_generate_program_returns_markdown():
    profile = {"user_id": "test", "name": "Test", "goal": "hypertrophy", "bodyweight_kg": 80,
               "height_cm": 175, "age": 25, "training_days": 4}

    mock_response = {
        "choices": [{"message": {"content": "# Test Program\n\n## Nutrition\n\nEat food."}}]
    }

    with mock.patch("requests.post") as mock_post:
        mock_post.return_value.ok = True
        mock_post.return_value.json.return_value = mock_response

        result = generate_program(profile, "vault context here")

    assert result is not None
    assert "# Test Program" in result
    assert "Nutrition" in result


def test_generate_program_handles_connection_error():
    profile = {"user_id": "test", "name": "Test", "goal": "hypertrophy", "bodyweight_kg": 80,
               "height_cm": 175, "age": 25, "training_days": 4}

    with mock.patch("requests.post") as mock_post:
        mock_post.side_effect = Exception("Connection refused")
        result = generate_program(profile, "vault context")

    assert result is None


def test_generate_program_falls_back_to_secondary_model():
    profile = {"user_id": "test", "name": "Test", "goal": "hypertrophy", "bodyweight_kg": 80,
               "height_cm": 175, "age": 25, "training_days": 4}
    vault = "some vault context"

    mock_response = {
        "choices": [{"message": {"content": "# Fallback Program\n\nTraining plan."}}]
    }

    with mock.patch("requests.post") as mock_post, \
         mock.patch("mos_bot.core.program_generator.LLM_API_KEY", ""), \
         mock.patch("mos_bot.core.program_generator.LLM_API_URL", ""), \
         mock.patch("mos_bot.core.program_generator.LLM_MODEL", ""), \
         mock.patch("mos_bot.core.program_generator._lm_available", return_value=True):
        first_call = mock.MagicMock()
        first_call.ok = False
        first_call.raise_for_status.side_effect = Exception("Primary failed")
        second_call = mock.MagicMock()
        second_call.ok = True
        second_call.json.return_value = mock_response
        mock_post.side_effect = [first_call, second_call]

        result = generate_program(profile, vault)

    assert result is not None
    assert "Fallback Program" in result

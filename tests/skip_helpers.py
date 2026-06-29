import os
import pytest

VAULT_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Muscle Operating System")
vault_available = os.path.isdir(VAULT_ROOT)

skip_if_no_vault = pytest.mark.skipif(
    not vault_available,
    reason="Muscle Operating System vault not present (CI)",
)

import subprocess
from pathlib import Path

from tests.hooks.conftest import RunHook, fixture, git_init


def test_prints_git_state_and_progress(run_hook: RunHook, tmp_path: Path) -> None:
    git_init(tmp_path, branch="feat/login")
    (tmp_path / "docs").mkdir()
    (tmp_path / "docs" / "PROGRESS.md").write_text("# Progress\n## Next\n- ship login\n")
    subprocess.run(["git", "add", "."], cwd=tmp_path, check=True)
    subprocess.run(["git", "commit", "-qm", "feat: first"], cwd=tmp_path, check=True)
    (tmp_path / "dirty.py").write_text("x = 1\n")

    result = run_hook("session_start.py", fixture("session_start"), project_dir=tmp_path)

    assert result.returncode == 0
    out = result.stdout
    assert "Branch: feat/login" in out
    assert "?? dirty.py" in out
    assert "feat: first" in out
    assert "- ship login" in out


def test_works_outside_git_and_without_progress(run_hook: RunHook, tmp_path: Path) -> None:
    result = run_hook("session_start.py", fixture("session_start"), project_dir=tmp_path)
    assert result.returncode == 0
    assert "Not a git repository" in result.stdout
    assert "PROGRESS.md missing" in result.stdout

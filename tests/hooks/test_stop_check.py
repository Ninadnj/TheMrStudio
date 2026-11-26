import json
from pathlib import Path

import pytest

from tests.hooks.conftest import RunHook, fixture, git_init

GREEN = "check-fast:\n\t@echo all green\n"
RED = "check-fast:\n\t@echo 'FAILED tests/unit/test_x.py::test_y'; exit 1\n"


@pytest.fixture
def project(tmp_path: Path) -> Path:
    proj = tmp_path / "proj"
    proj.mkdir()
    git_init(proj)
    return proj


def _stop(active: bool = False) -> dict[str, object]:
    return fixture("stop", stop_hook_active=active)


def test_green_check_allows_stop(run_hook: RunHook, project: Path) -> None:
    (project / "Makefile").write_text(GREEN)
    assert run_hook("stop_check.py", _stop(), project_dir=project).returncode == 0


def test_red_check_blocks_with_output(run_hook: RunHook, project: Path) -> None:
    (project / "Makefile").write_text(RED)
    result = run_hook("stop_check.py", _stop(), project_dir=project)
    assert result.returncode == 2
    assert "check-fast FAILED" in result.stderr
    assert "test_x.py::test_y" in result.stderr


def test_gives_up_after_max_retries_when_stop_hook_active(run_hook: RunHook, project: Path) -> None:
    (project / "Makefile").write_text(RED)
    env = {"STOP_HOOK_MAX_RETRIES": "2"}
    assert run_hook("stop_check.py", _stop(False), project_dir=project, env=env).returncode == 2
    assert run_hook("stop_check.py", _stop(True), project_dir=project, env=env).returncode == 2
    final = run_hook("stop_check.py", _stop(True), project_dir=project, env=env)
    assert final.returncode == 0  # loop broken
    assert "still failing" in json.loads(final.stdout)["systemMessage"]


def test_new_user_turn_resets_retry_budget(run_hook: RunHook, project: Path) -> None:
    (project / "Makefile").write_text(RED)
    env = {"STOP_HOOK_MAX_RETRIES": "1"}
    run_hook("stop_check.py", _stop(False), project_dir=project, env=env)
    assert run_hook("stop_check.py", _stop(True), project_dir=project, env=env).returncode == 0
    # stop_hook_active=false means a fresh turn: check runs (and blocks) again
    assert run_hook("stop_check.py", _stop(False), project_dir=project, env=env).returncode == 2


def test_unchanged_tree_after_green_skips_check(run_hook: RunHook, project: Path) -> None:
    counter = project.parent / "runs.log"  # outside the repo, so it doesn't change the tree
    (project / "Makefile").write_text(f"check-fast:\n\t@echo run >> {counter}\n")
    for _ in range(3):
        assert run_hook("stop_check.py", _stop(), project_dir=project).returncode == 0
    assert counter.read_text().count("run") == 1  # 2nd and 3rd calls hit the cache


def test_any_change_invalidates_the_cache(run_hook: RunHook, project: Path) -> None:
    (project / "Makefile").write_text(GREEN)
    assert run_hook("stop_check.py", _stop(), project_dir=project).returncode == 0
    (project / "Makefile").write_text(RED)  # changed file -> new fingerprint -> re-run
    assert run_hook("stop_check.py", _stop(), project_dir=project).returncode == 2


def test_non_ascii_paths_are_fingerprinted(run_hook: RunHook, project: Path) -> None:
    counter = project.parent / "runs.log"
    (project / "Makefile").write_text(f"check-fast:\n\t@echo run >> {counter}\n")
    odd = project / "café.py"
    odd.write_text("x = 1\n")
    run_hook("stop_check.py", _stop(), project_dir=project)
    odd.write_text("x = 2\n")  # content change in a non-ASCII path must invalidate the cache
    run_hook("stop_check.py", _stop(), project_dir=project)
    assert counter.read_text().count("run") == 2


def test_bad_retry_setting_does_not_crash(run_hook: RunHook, project: Path) -> None:
    (project / "Makefile").write_text(GREEN)
    env = {"STOP_HOOK_MAX_RETRIES": "lots"}
    assert run_hook("stop_check.py", _stop(True), project_dir=project, env=env).returncode == 0

import shutil
from pathlib import Path

import pytest

from tests.hooks.conftest import ROOT, RunHook, fixture, git_init

BIOME_BIN = ROOT / "node_modules" / ".bin"


@pytest.fixture
def project(tmp_path: Path) -> Path:
    """A throwaway project with this repo's Biome config and binary."""
    proj = tmp_path / "proj"
    (proj / "node_modules" / ".bin").mkdir(parents=True)
    (proj / "node_modules" / ".bin" / "biome").symlink_to(BIOME_BIN / "biome")
    shutil.copy(ROOT / "biome.jsonc", proj / "biome.jsonc")
    (proj / ".gitignore").write_text("node_modules\n")
    (proj / "client" / "src").mkdir(parents=True)
    git_init(proj)
    return proj


def _payload(path: Path) -> dict[str, object]:
    return fixture("post_tool_use_write", tool_input={"file_path": str(path)})


def test_formats_clean_file_and_passes(run_hook: RunHook, project: Path) -> None:
    target = project / "client" / "src" / "ok.ts"
    target.write_text("export const x={a:1}\n")
    result = run_hook("post_edit_lint.py", _payload(target), project_dir=project)
    assert result.returncode == 0, result.stderr
    assert target.read_text() == "export const x = { a: 1 };\n"


def test_lint_error_blocks_with_details(run_hook: RunHook, project: Path) -> None:
    target = project / "client" / "src" / "bad.ts"
    target.write_text("export function f(a: number) {\n  if (a == 1) debugger;\n  return a;\n}\n")
    result = run_hook("post_edit_lint.py", _payload(target), project_dir=project)
    assert result.returncode == 2
    assert "noDebugger" in result.stderr
    assert "bad.ts" in result.stderr


def test_syntax_error_blocks(run_hook: RunHook, project: Path) -> None:
    target = project / "client" / "src" / "broken.ts"
    target.write_text("export const = ;\n")
    assert run_hook("post_edit_lint.py", _payload(target), project_dir=project).returncode == 2


def test_unused_import_is_kept_mid_edit(run_hook: RunHook, project: Path) -> None:
    target = project / "client" / "src" / "imports.ts"
    target.write_text('import { join } from "node:path";\n')
    assert run_hook("post_edit_lint.py", _payload(target), project_dir=project).returncode == 0
    assert "join" in target.read_text()


def test_invalid_json_blocks(run_hook: RunHook, project: Path) -> None:
    target = project / "client" / "src" / "data.json"
    target.write_text('{"a": 1,,}')
    assert run_hook("post_edit_lint.py", _payload(target), project_dir=project).returncode == 2


def test_other_files_and_missing_files_are_ignored(run_hook: RunHook, project: Path) -> None:
    notes = project / "notes.md"
    notes.write_text("debugger")
    assert run_hook("post_edit_lint.py", _payload(notes), project_dir=project).returncode == 0
    gone = project / "client" / "src" / "gone.ts"
    assert run_hook("post_edit_lint.py", _payload(gone), project_dir=project).returncode == 0


def test_files_outside_project_are_not_touched(run_hook: RunHook, tmp_path: Path) -> None:
    project = tmp_path / "proj"
    project.mkdir()
    outside = tmp_path / "elsewhere.ts"
    outside.write_text("export const x={a:1}\n")
    result = run_hook("post_edit_lint.py", _payload(outside), project_dir=project)
    assert result.returncode == 0
    assert outside.read_text() == "export const x={a:1}\n"

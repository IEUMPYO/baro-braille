"""
execute.py (ship 워크플로우) 안전망 테스트.
"""

import json
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

sys.path.insert(0, str(Path(__file__).parent))
import execute as ex


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def tmp_project(tmp_path):
    """phases/, CLAUDE.md, docs/ 를 갖춘 임시 프로젝트 구조."""
    phases_dir = tmp_path / "phases"
    phases_dir.mkdir()

    claude_md = tmp_path / "CLAUDE.md"
    claude_md.write_text("# Rules\n- rule one\n- rule two")

    docs_dir = tmp_path / "docs"
    docs_dir.mkdir()
    (docs_dir / "arch.md").write_text("# Architecture\nSome content")
    (docs_dir / "guide.md").write_text("# Guide\nAnother doc")

    return tmp_path


@pytest.fixture
def phase_dir(tmp_project):
    """step 3개를 가진 phase 디렉토리 (type/scope 포함)."""
    d = tmp_project / "phases" / "0-mvp"
    d.mkdir()

    index = {
        "project": "TestProject",
        "phase": "mvp",
        "steps": [
            {"step": 0, "name": "setup", "type": "chore", "scope": "config",
             "status": "completed", "summary": "프로젝트 초기화 완료"},
            {"step": 1, "name": "core", "type": "feat", "scope": "core",
             "status": "completed", "summary": "핵심 로직 구현"},
            {"step": 2, "name": "ui", "type": "feat", "scope": "ui", "status": "pending"},
        ],
    }
    (d / "index.json").write_text(json.dumps(index, indent=2, ensure_ascii=False))
    (d / "step2.md").write_text("# Step 2: UI\n\nUI를 구현하세요.")

    return d


@pytest.fixture
def top_index(tmp_project):
    """phases/index.json (top-level)."""
    top = {
        "phases": [
            {"dir": "0-mvp", "status": "pending"},
            {"dir": "1-polish", "status": "pending"},
        ]
    }
    p = tmp_project / "phases" / "index.json"
    p.write_text(json.dumps(top, indent=2))
    return p


@pytest.fixture
def executor(tmp_project, phase_dir):
    """테스트용 StepExecutor 인스턴스. git/gh 호출은 별도 mock 필요."""
    with patch.object(ex, "ROOT", tmp_project):
        inst = ex.StepExecutor("0-mvp")
    inst._root = str(tmp_project)
    inst._phases_dir = tmp_project / "phases"
    inst._phase_dir = phase_dir
    inst._phase_dir_name = "0-mvp"
    inst._index_file = phase_dir / "index.json"
    inst._top_index_file = tmp_project / "phases" / "index.json"
    return inst


# ---------------------------------------------------------------------------
# _stamp
# ---------------------------------------------------------------------------

class TestStamp:
    def test_returns_kst_timestamp(self, executor):
        assert "+0900" in executor._stamp()

    def test_format_is_iso(self, executor):
        dt = datetime.strptime(executor._stamp(), "%Y-%m-%dT%H:%M:%S%z")
        assert dt.tzinfo is not None

    def test_is_current_time(self, executor):
        before = datetime.now(ex.StepExecutor.TZ).replace(microsecond=0)
        result = executor._stamp()
        after = datetime.now(ex.StepExecutor.TZ).replace(microsecond=0) + timedelta(seconds=1)
        parsed = datetime.strptime(result, "%Y-%m-%dT%H:%M:%S%z")
        assert before <= parsed <= after


# ---------------------------------------------------------------------------
# _read_json / _write_json
# ---------------------------------------------------------------------------

class TestJsonHelpers:
    def test_roundtrip(self, tmp_path):
        data = {"key": "값", "nested": [1, 2, 3]}
        p = tmp_path / "test.json"
        ex.StepExecutor._write_json(p, data)
        assert ex.StepExecutor._read_json(p) == data

    def test_save_ensures_ascii_false(self, tmp_path):
        p = tmp_path / "test.json"
        ex.StepExecutor._write_json(p, {"한글": "테스트"})
        raw = p.read_text()
        assert "한글" in raw and "\\u" not in raw

    def test_load_nonexistent_raises(self, tmp_path):
        with pytest.raises(FileNotFoundError):
            ex.StepExecutor._read_json(tmp_path / "nope.json")


# ---------------------------------------------------------------------------
# type map / _meta / _parse_number
# ---------------------------------------------------------------------------

class TestTypeMap:
    def test_title_prefix(self):
        assert ex.StepExecutor.TITLE_PREFIX["feat"] == "[Feature]"
        assert ex.StepExecutor.TITLE_PREFIX["chore"] == "[Chore]"

    def test_label(self):
        assert ex.StepExecutor.LABEL["feat"] == "feat"
        assert ex.StepExecutor.LABEL["docs"] == "documentation"

    def test_commit_template(self):
        msg = ex.StepExecutor.COMMIT_TEMPLATE.format(typ="feat", issue=7, scope="ui", summary="done")
        assert msg == "feat(#7/ui): done"


class TestMeta:
    def test_defaults_to_feat_and_name(self, executor):
        assert executor._meta({"step": 2, "name": "ui"}) == ("feat", "ui", "ui")

    def test_explicit_type_and_scope(self, executor):
        assert executor._meta(
            {"step": 0, "name": "cfg", "type": "chore", "scope": "config"}
        ) == ("chore", "config", "cfg")


class TestParseNumber:
    @pytest.mark.parametrize("text,expected", [
        ("https://github.com/o/r/issues/12\n", 12),
        ("https://github.com/o/r/pull/7", 7),
        ("", None),
        ("garbage", None),
    ])
    def test_parse(self, text, expected):
        assert ex.StepExecutor._parse_number(text) == expected


# ---------------------------------------------------------------------------
# _load_guardrails
# ---------------------------------------------------------------------------

class TestLoadGuardrails:
    def test_loads_claude_md_and_docs(self, executor, tmp_project):
        with patch.object(ex, "ROOT", tmp_project):
            result = executor._load_guardrails()
        assert "# Rules" in result and "# Architecture" in result and "# Guide" in result

    def test_docs_sorted_alphabetically(self, executor, tmp_project):
        with patch.object(ex, "ROOT", tmp_project):
            result = executor._load_guardrails()
        assert result.index("arch") < result.index("guide")

    def test_no_claude_md(self, executor, tmp_project):
        (tmp_project / "CLAUDE.md").unlink()
        with patch.object(ex, "ROOT", tmp_project):
            result = executor._load_guardrails()
        assert "CLAUDE.md" not in result and "Architecture" in result

    def test_empty_project(self, tmp_path):
        with patch.object(ex, "ROOT", tmp_path):
            (tmp_path / "phases" / "dummy").mkdir(parents=True)
            (tmp_path / "phases" / "dummy" / "index.json").write_text(
                json.dumps({"project": "T", "phase": "t", "steps": []}))
            inst = ex.StepExecutor.__new__(ex.StepExecutor)
            assert inst._load_guardrails() == ""


# ---------------------------------------------------------------------------
# _build_step_context
# ---------------------------------------------------------------------------

class TestBuildStepContext:
    def test_includes_completed_with_summary(self, phase_dir):
        index = json.loads((phase_dir / "index.json").read_text())
        result = ex.StepExecutor._build_step_context(index)
        assert "Step 0 (setup): 프로젝트 초기화 완료" in result
        assert "Step 1 (core): 핵심 로직 구현" in result

    def test_excludes_pending(self, phase_dir):
        index = json.loads((phase_dir / "index.json").read_text())
        assert "ui" not in ex.StepExecutor._build_step_context(index)

    def test_empty_when_no_completed(self):
        index = {"steps": [{"step": 0, "name": "a", "status": "pending"}]}
        assert ex.StepExecutor._build_step_context(index) == ""


# ---------------------------------------------------------------------------
# _build_preamble
# ---------------------------------------------------------------------------

class TestBuildPreamble:
    def test_includes_project_name(self, executor):
        assert "TestProject" in executor._build_preamble("", "")

    def test_includes_guardrails(self, executor):
        assert "GUARD_CONTENT" in executor._build_preamble("GUARD_CONTENT", "")

    def test_includes_step_context(self, executor):
        assert "이전 Step 산출물" in executor._build_preamble("", "## 이전 Step 산출물\n\n- x")

    def test_forbids_commit(self, executor):
        # ship 워크플로우: Claude는 커밋하지 않는다
        result = executor._build_preamble("", "")
        assert "커밋" in result
        assert "하지 마라" in result

    def test_includes_rules(self, executor):
        result = executor._build_preamble("", "")
        assert "작업 규칙" in result and "AC" in result

    def test_no_retry_section_by_default(self, executor):
        assert "이전 시도 실패" not in executor._build_preamble("", "")

    def test_retry_section_with_prev_error(self, executor):
        result = executor._build_preamble("", "", prev_error="타입 에러 발생")
        assert "이전 시도 실패" in result and "타입 에러 발생" in result

    def test_includes_index_path(self, executor):
        assert "/phases/0-mvp/index.json" in executor._build_preamble("", "")


# ---------------------------------------------------------------------------
# _update_top_index
# ---------------------------------------------------------------------------

class TestUpdateTopIndex:
    def test_completed(self, executor, top_index):
        executor._top_index_file = top_index
        executor._update_top_index("completed")
        mvp = next(p for p in json.loads(top_index.read_text())["phases"] if p["dir"] == "0-mvp")
        assert mvp["status"] == "completed" and "completed_at" in mvp

    def test_error(self, executor, top_index):
        executor._top_index_file = top_index
        executor._update_top_index("error")
        mvp = next(p for p in json.loads(top_index.read_text())["phases"] if p["dir"] == "0-mvp")
        assert mvp["status"] == "error" and "failed_at" in mvp

    def test_other_phases_unchanged(self, executor, top_index):
        executor._top_index_file = top_index
        executor._update_top_index("completed")
        polish = next(p for p in json.loads(top_index.read_text())["phases"] if p["dir"] == "1-polish")
        assert polish["status"] == "pending"

    def test_no_top_index_file(self, executor, tmp_path):
        executor._top_index_file = tmp_path / "nonexistent.json"
        executor._update_top_index("completed")  # should not raise


# ---------------------------------------------------------------------------
# step 필드 헬퍼
# ---------------------------------------------------------------------------

class TestStepFields:
    def test_read_field(self, executor):
        assert executor._read_step_field(0, "summary") == "프로젝트 초기화 완료"
        assert executor._read_step_field(2, "summary") is None

    def test_set_fields(self, executor):
        executor._set_step_fields(2, issue_number=42, pr_number=43)
        assert executor._read_step_field(2, "issue_number") == 42
        assert executor._read_step_field(2, "pr_number") == 43


# ---------------------------------------------------------------------------
# _create_branch (mocked)
# ---------------------------------------------------------------------------

class TestCreateBranch:
    def test_creates_new_branch(self, executor):
        calls = []
        def fake_git(*args):
            calls.append(args)
            if args[0] == "rev-parse":
                return MagicMock(returncode=1)  # 존재하지 않음
            return MagicMock(returncode=0, stdout="", stderr="")
        executor._run_git = fake_git
        executor._create_branch("feat/#1-ui")
        assert ("checkout", "-b", "feat/#1-ui") in calls

    def test_checks_out_existing_branch(self, executor):
        calls = []
        def fake_git(*args):
            calls.append(args)
            if args[0] == "rev-parse":
                return MagicMock(returncode=0)  # 존재함
            return MagicMock(returncode=0, stdout="", stderr="")
        executor._run_git = fake_git
        executor._create_branch("feat/#1-ui")
        assert ("checkout", "feat/#1-ui") in calls

    def test_checkout_fails_exits(self, executor):
        def fake_git(*args):
            if args[0] == "rev-parse":
                return MagicMock(returncode=1)
            return MagicMock(returncode=1, stdout="", stderr="dirty")
        executor._run_git = fake_git
        with pytest.raises(SystemExit) as exc:
            executor._create_branch("feat/#1-ui")
        assert exc.value.code == 1


# ---------------------------------------------------------------------------
# _commit_ship (mocked)
# ---------------------------------------------------------------------------

class TestCommitShip:
    def test_commit_message_format(self, executor):
        calls = []
        def fake_git(*args):
            calls.append(args)
            if args[:2] == ("diff", "--cached"):
                return MagicMock(returncode=1)  # staged 변경 있음
            return MagicMock(returncode=0, stdout="", stderr="")
        executor._run_git = fake_git

        result = executor._commit_ship({"step": 2, "name": "ui", "type": "feat", "scope": "ui"}, 42)

        commit_calls = [c for c in calls if c[0] == "commit"]
        assert result is True
        assert len(commit_calls) == 1
        assert commit_calls[0][2] == "feat(#42/ui): ui"

    def test_uses_summary_when_present(self, executor):
        executor._set_step_fields(2, summary="업로드 화면 구현")
        calls = []
        def fake_git(*args):
            calls.append(args)
            if args[:2] == ("diff", "--cached"):
                return MagicMock(returncode=1)
            return MagicMock(returncode=0, stdout="", stderr="")
        executor._run_git = fake_git

        executor._commit_ship({"step": 2, "name": "ui", "type": "feat", "scope": "ui"}, 42)
        commit_calls = [c for c in calls if c[0] == "commit"]
        assert commit_calls[0][2] == "feat(#42/ui): 업로드 화면 구현"

    def test_no_change_returns_false(self, executor):
        def fake_git(*args):
            if args[:2] == ("diff", "--cached"):
                return MagicMock(returncode=0)  # staged 변경 없음
            return MagicMock(returncode=0, stdout="", stderr="")
        executor._run_git = fake_git
        result = executor._commit_ship({"step": 2, "name": "ui", "type": "feat", "scope": "ui"}, 42)
        assert result is False


# ---------------------------------------------------------------------------
# _gh_issue_create (mocked)
# ---------------------------------------------------------------------------

class TestGhIssueCreate:
    def test_reuses_existing_issue(self, executor):
        executor._set_step_fields(2, issue_number=99)
        # gh는 호출되지 않아야 함
        executor._run_gh = MagicMock(side_effect=AssertionError("gh should not be called"))
        num = executor._gh_issue_create({"step": 2, "name": "ui", "type": "feat", "scope": "ui"})
        assert num == 99

    def test_creates_and_parses_number(self, executor):
        def fake_gh(*args):
            if args[0] == "issue":
                return MagicMock(returncode=0, stdout="https://github.com/o/r/issues/55\n", stderr="")
            return MagicMock(returncode=0, stdout="", stderr="")
        executor._run_gh = fake_gh
        num = executor._gh_issue_create({"step": 2, "name": "ui", "type": "feat", "scope": "ui"})
        assert num == 55
        assert executor._read_step_field(2, "issue_number") == 55

    def test_create_failure_returns_none(self, executor):
        def fake_gh(*args):
            if args[0] == "issue":
                return MagicMock(returncode=1, stdout="", stderr="boom")
            return MagicMock(returncode=0, stdout="", stderr="")
        executor._run_gh = fake_gh
        assert executor._gh_issue_create({"step": 2, "name": "ui", "type": "feat", "scope": "ui"}) is None


# ---------------------------------------------------------------------------
# _invoke_claude (mocked)
# ---------------------------------------------------------------------------

class TestInvokeClaude:
    def test_invokes_claude_with_correct_args(self, executor):
        mock_result = MagicMock(returncode=0, stdout='{"result": "ok"}', stderr="")
        with patch("subprocess.run", return_value=mock_result) as mock_run:
            executor._invoke_claude({"step": 2, "name": "ui"}, "PREAMBLE\n")
        cmd = mock_run.call_args[0][0]
        assert cmd[0] == "claude" and "-p" in cmd and "--dangerously-skip-permissions" in cmd
        assert "PREAMBLE" in cmd[-1] and "UI를 구현하세요" in cmd[-1]

    def test_saves_output_json(self, executor):
        mock_result = MagicMock(returncode=0, stdout='{"ok": true}', stderr="")
        with patch("subprocess.run", return_value=mock_result):
            executor._invoke_claude({"step": 2, "name": "ui"}, "preamble")
        data = json.loads((executor._phase_dir / "step2-output.json").read_text())
        assert data["step"] == 2 and data["exitCode"] == 0

    def test_nonexistent_step_file_exits(self, executor):
        with pytest.raises(SystemExit) as exc:
            executor._invoke_claude({"step": 99, "name": "nope"}, "preamble")
        assert exc.value.code == 1

    def test_timeout_is_1800(self, executor):
        mock_result = MagicMock(returncode=0, stdout="{}", stderr="")
        with patch("subprocess.run", return_value=mock_result) as mock_run:
            executor._invoke_claude({"step": 2, "name": "ui"}, "preamble")
        assert mock_run.call_args[1]["timeout"] == 1800


# ---------------------------------------------------------------------------
# progress_indicator
# ---------------------------------------------------------------------------

class TestProgressIndicator:
    def test_context_manager(self):
        import time
        with ex.progress_indicator("test") as pi:
            time.sleep(0.15)
        assert pi.elapsed >= 0.1


# ---------------------------------------------------------------------------
# main() CLI
# ---------------------------------------------------------------------------

class TestMainCli:
    def test_no_args_exits(self):
        with patch("sys.argv", ["execute.py"]):
            with pytest.raises(SystemExit) as exc:
                ex.main()
            assert exc.value.code == 2  # argparse

    def test_invalid_phase_dir_exits(self):
        with patch("sys.argv", ["execute.py", "nonexistent"]):
            with patch.object(ex, "ROOT", Path("/tmp/fake_nonexistent")):
                with pytest.raises(SystemExit) as exc:
                    ex.main()
                assert exc.value.code == 1

    def test_missing_index_exits(self, tmp_project):
        (tmp_project / "phases" / "empty").mkdir()
        with patch("sys.argv", ["execute.py", "empty"]):
            with patch.object(ex, "ROOT", tmp_project):
                with pytest.raises(SystemExit) as exc:
                    ex.main()
                assert exc.value.code == 1


# ---------------------------------------------------------------------------
# _check_blockers
# ---------------------------------------------------------------------------

class TestCheckBlockers:
    def _make(self, tmp_project, steps):
        d = tmp_project / "phases" / "test-phase"
        d.mkdir(exist_ok=True)
        (d / "index.json").write_text(json.dumps({"project": "T", "phase": "test", "steps": steps}))
        with patch.object(ex, "ROOT", tmp_project):
            inst = ex.StepExecutor.__new__(ex.StepExecutor)
        inst._index_file = d / "index.json"
        return inst

    def test_error_step_exits_1(self, tmp_project):
        inst = self._make(tmp_project, [
            {"step": 0, "name": "ok", "status": "completed"},
            {"step": 1, "name": "bad", "status": "error", "error_message": "fail"},
        ])
        with pytest.raises(SystemExit) as exc:
            inst._check_blockers()
        assert exc.value.code == 1

    def test_blocked_step_exits_2(self, tmp_project):
        inst = self._make(tmp_project, [
            {"step": 0, "name": "ok", "status": "completed"},
            {"step": 1, "name": "stuck", "status": "blocked", "blocked_reason": "API key"},
        ])
        with pytest.raises(SystemExit) as exc:
            inst._check_blockers()
        assert exc.value.code == 2

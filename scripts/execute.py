#!/usr/bin/env python3
"""
Harness Step Executor — phase 내 step을 순차 실행하고 자가 교정한다.

각 step은 /ship 워크플로우를 무인으로 수행한다:
    main 최신화 → 이슈 생성 → 브랜치(<type>/#N-slug) → (Claude 코드 작업)
    → 커밋(<type>(#N/scope): summary) → push → PR(Closes #N) → merge → main pull

Claude 세션은 코드 구현 + AC 실행 + index.json status/summary 갱신만 한다(커밋하지 않음).
git·gh 오케스트레이션은 이 실행기가 전담한다.

Usage:
    python3 scripts/execute.py <phase-dir>
"""

import argparse
import contextlib
import json
import subprocess
import sys
import tempfile
import threading
import time
import types
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent
MAIN_BRANCH = "main"


@contextlib.contextmanager
def progress_indicator(label: str):
    """터미널 진행 표시기. with 문으로 사용하며 .elapsed 로 경과 시간을 읽는다."""
    frames = "◐◓◑◒"
    stop = threading.Event()
    t0 = time.monotonic()

    def _animate():
        idx = 0
        while not stop.wait(0.12):
            sec = int(time.monotonic() - t0)
            sys.stderr.write(f"\r{frames[idx % len(frames)]} {label} [{sec}s]")
            sys.stderr.flush()
            idx += 1
        sys.stderr.write("\r" + " " * (len(label) + 20) + "\r")
        sys.stderr.flush()

    th = threading.Thread(target=_animate, daemon=True)
    th.start()
    info = types.SimpleNamespace(elapsed=0.0)
    try:
        yield info
    finally:
        stop.set()
        th.join()
        info.elapsed = time.monotonic() - t0


class StepExecutor:
    """Phase 디렉토리 안의 step들을 /ship 워크플로우로 순차 실행하는 하네스."""

    MAX_RETRIES = 3
    TZ = timezone(timedelta(hours=9))

    # ship type map: 이슈 제목 prefix / 라벨 / 커밋·브랜치 prefix를 통일
    TITLE_PREFIX = {
        "feat": "[Feature]", "fix": "[Fix]", "docs": "[Docs]",
        "chore": "[Chore]", "refactor": "[Refactor]", "test": "[Test]",
    }
    LABEL = {
        "feat": "feat", "fix": "fix", "docs": "documentation",
        "chore": "chore", "refactor": "refactor", "test": "test",
    }
    COMMIT_TEMPLATE = "{typ}(#{issue}/{scope}): {title}"

    def __init__(self, phase_dir_name: str):
        self._root = str(ROOT)
        self._phases_dir = ROOT / "phases"
        self._phase_dir = self._phases_dir / phase_dir_name
        self._phase_dir_name = phase_dir_name
        self._top_index_file = self._phases_dir / "index.json"

        if not self._phase_dir.is_dir():
            print(f"ERROR: {self._phase_dir} not found")
            sys.exit(1)

        self._index_file = self._phase_dir / "index.json"
        if not self._index_file.exists():
            print(f"ERROR: {self._index_file} not found")
            sys.exit(1)

        idx = self._read_json(self._index_file)
        self._project = idx.get("project", "project")
        self._phase_name = idx.get("phase", phase_dir_name)
        self._total = len(idx["steps"])

    def run(self):
        self._print_header()
        self._check_blockers()
        self._check_prereqs()
        guardrails = self._load_guardrails()
        self._ensure_created_at()
        self._execute_all_steps(guardrails)
        self._finalize()

    # --- timestamps ---

    def _stamp(self) -> str:
        return datetime.now(self.TZ).strftime("%Y-%m-%dT%H:%M:%S%z")

    # --- JSON I/O ---

    @staticmethod
    def _read_json(p: Path) -> dict:
        return json.loads(p.read_text(encoding="utf-8"))

    @staticmethod
    def _write_json(p: Path, data: dict):
        p.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    # --- git / gh ---

    def _run_git(self, *args) -> subprocess.CompletedProcess:
        return subprocess.run(["git"] + list(args), cwd=self._root, capture_output=True, text=True)

    def _run_gh(self, *args) -> subprocess.CompletedProcess:
        return subprocess.run(["gh"] + list(args), cwd=self._root, capture_output=True, text=True)

    def _check_prereqs(self):
        """git repo + gh 인증 확인."""
        if self._run_git("rev-parse", "--is-inside-work-tree").returncode != 0:
            print("  ERROR: git repo가 아닙니다.")
            sys.exit(1)
        if self._run_gh("auth", "status").returncode != 0:
            print("  ERROR: gh 인증이 필요합니다. `gh auth login` 후 다시 시도하세요.")
            sys.exit(1)

    def _sync_main(self):
        """main으로 전환하고 원격을 pull."""
        r = self._run_git("checkout", MAIN_BRANCH)
        if r.returncode != 0:
            print(f"  WARN: main checkout 실패: {r.stderr.strip()}")
        r = self._run_git("pull", "origin", MAIN_BRANCH)
        if r.returncode != 0:
            print(f"  WARN: main pull 실패: {r.stderr.strip()}")

    def _meta(self, step: dict):
        typ = step.get("type", "feat")
        scope = step.get("scope", step["name"])
        slug = step["name"]
        return typ, scope, slug

    def _step_title(self, step: dict) -> str:
        """커밋 subject·PR 제목에 쓸 짧은 한 줄 제목. 없으면 step name(slug)으로 폴백해
        장문 summary가 제목에 노출되는 것을 막는다."""
        return self._read_step_field(step["step"], "title") or step["name"]

    def _ensure_label(self, label: str):
        # 이미 있으면 실패하지만 무시(멱등).
        self._run_gh("label", "create", label)

    def _gh_issue_create(self, step: dict) -> Optional[int]:
        """이슈를 생성하고 번호를 반환. 이미 기록된 issue_number가 있으면 재사용."""
        existing = self._read_step_field(step["step"], "issue_number")
        if existing:
            return int(existing)

        typ, scope, slug = self._meta(step)
        label = self.LABEL.get(typ, "feat")
        self._ensure_label(label)

        title = f"{self.TITLE_PREFIX.get(typ, '[Feature]')} {self._phase_name} step {step['step']} — {slug}"
        body = (
            f"## Summary\n\n"
            f"{self._phase_name} step {step['step']} ({slug}) 자동 실행.\n\n"
            f"## Acceptance criteria\n\n"
            f"- [ ] `npm run build` 통과\n"
            f"- [ ] `phases/{self._phase_dir_name}/step{step['step']}.md`의 검증 절차 충족\n\n"
            f"## Additional context\n\n"
            f"Harness `execute.py` 무인 실행. 상세는 step 파일 참조.\n"
        )
        with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
            f.write(body)
            body_path = f.name

        r = self._run_gh("issue", "create", "--title", title,
                         "--body-file", body_path, "--assignee", "@me", "--label", label)
        if r.returncode != 0:
            print(f"  ERROR: 이슈 생성 실패: {r.stderr.strip()}")
            return None
        num = self._parse_number(r.stdout)
        if num:
            print(f"  Issue: #{num} — {title}")
            self._set_step_fields(step["step"], issue_number=num)
        return num

    def _create_branch(self, branch: str):
        """main 기준으로 브랜치 생성(또는 기존 브랜치 checkout)."""
        exists = self._run_git("rev-parse", "--verify", branch).returncode == 0
        r = self._run_git("checkout", branch) if exists else self._run_git("checkout", "-b", branch)
        if r.returncode != 0:
            print(f"  ERROR: 브랜치 '{branch}' checkout 실패: {r.stderr.strip()}")
            sys.exit(1)
        print(f"  Branch: {branch}")

    def _commit_ship(self, step: dict, issue: int) -> bool:
        """코드 변경을 커밋. subject는 짧은 title, body는 상세 summary. 변경이 없으면 False."""
        typ, scope, _ = self._meta(step)
        title = self._step_title(step)
        summary = self._read_step_field(step["step"], "summary")

        self._run_git("add", "-A")
        if self._run_git("diff", "--cached", "--quiet").returncode == 0:
            print("  WARN: 커밋할 코드 변경이 없습니다.")
            return False

        subject = self.COMMIT_TEMPLATE.format(typ=typ, issue=issue, scope=scope, title=title)
        commit_args = ["commit", "-m", subject]
        if summary and summary != title:
            commit_args += ["-m", summary]  # 상세 요약은 커밋 body로
        r = self._run_git(*commit_args)
        if r.returncode != 0:
            print(f"  ERROR: 커밋 실패: {r.stderr.strip()}")
            sys.exit(1)
        print(f"  Commit: {subject}")
        return True

    def _gh_pr_and_merge(self, step: dict, issue: int, branch: str):
        """push → PR 생성 → merge → main pull → 로컬 브랜치 정리."""
        typ, scope, slug = self._meta(step)
        label = self.LABEL.get(typ, "feat")
        step_title = self._step_title(step)
        summary = self._read_step_field(step["step"], "summary") or step_title

        r = self._run_git("push", "-u", "origin", branch)
        if r.returncode != 0:
            print(f"  ERROR: push 실패: {r.stderr.strip()}")
            sys.exit(1)

        title = f"{typ}(#{issue}): {step_title}"
        body = (
            f"## Summary\n\n{summary}\n\n"
            f"## Related issue\n\nCloses #{issue}\n\n"
            f"## Changes\n\n- {self._phase_name} step {step['step']} ({slug}) 산출물\n\n"
            f"## Verification\n\n- `npm run build` 통과\n\n"
            f"## Checklist\n\n"
            f"- [x] 관련 이슈의 완료 조건을 충족했습니다.\n"
            f"- [x] PR과 관련 없는 변경사항을 포함하지 않았습니다.\n"
            f"- [x] 필요한 테스트와 문서를 업데이트했습니다.\n"
        )
        with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
            f.write(body)
            body_path = f.name

        r = self._run_gh("pr", "create", "--title", title, "--body-file", body_path,
                         "--assignee", "@me", "--label", label, "--base", MAIN_BRANCH, "--head", branch)
        if r.returncode != 0:
            print(f"  ERROR: PR 생성 실패: {r.stderr.strip()}")
            sys.exit(1)
        pr = self._parse_number(r.stdout)
        print(f"  PR: #{pr} — {title}")
        if pr:
            self._set_step_fields(step["step"], pr_number=pr)

        r = self._run_gh("pr", "merge", str(pr), "--merge", "--delete-branch")
        if r.returncode != 0:
            print(f"  ERROR: 머지 실패: {r.stderr.strip()}")
            sys.exit(1)
        print(f"  Merged: #{pr} (merge commit)")

        self._sync_main()
        # 로컬 브랜치가 남아있으면 정리
        self._run_git("branch", "-D", branch)

    @staticmethod
    def _parse_number(gh_stdout: str) -> Optional[int]:
        """gh issue/pr create 출력(URL)에서 끝 번호를 추출."""
        text = (gh_stdout or "").strip()
        if not text:
            return None
        tail = text.splitlines()[-1].rstrip("/").split("/")[-1]
        return int(tail) if tail.isdigit() else None

    # --- step 필드 헬퍼 ---

    def _read_step_field(self, step_num: int, key: str):
        index = self._read_json(self._index_file)
        for s in index["steps"]:
            if s["step"] == step_num:
                return s.get(key)
        return None

    def _set_step_fields(self, step_num: int, **fields):
        index = self._read_json(self._index_file)
        for s in index["steps"]:
            if s["step"] == step_num:
                s.update(fields)
        self._write_json(self._index_file, index)

    # --- top-level index ---

    def _update_top_index(self, status: str):
        if not self._top_index_file.exists():
            return
        top = self._read_json(self._top_index_file)
        ts = self._stamp()
        for phase in top.get("phases", []):
            if phase.get("dir") == self._phase_dir_name:
                phase["status"] = status
                ts_key = {"completed": "completed_at", "error": "failed_at", "blocked": "blocked_at"}.get(status)
                if ts_key:
                    phase[ts_key] = ts
                break
        self._write_json(self._top_index_file, top)

    # --- guardrails & context ---

    def _load_guardrails(self) -> str:
        sections = []
        claude_md = ROOT / "CLAUDE.md"
        if claude_md.exists():
            sections.append(f"## 프로젝트 규칙 (CLAUDE.md)\n\n{claude_md.read_text()}")
        docs_dir = ROOT / "docs"
        if docs_dir.is_dir():
            for doc in sorted(docs_dir.glob("*.md")):
                sections.append(f"## {doc.stem}\n\n{doc.read_text()}")
        return "\n\n---\n\n".join(sections) if sections else ""

    @staticmethod
    def _build_step_context(index: dict) -> str:
        lines = [
            f"- Step {s['step']} ({s['name']}): {s['summary']}"
            for s in index["steps"]
            if s["status"] == "completed" and s.get("summary")
        ]
        if not lines:
            return ""
        return "## 이전 Step 산출물\n\n" + "\n".join(lines) + "\n\n"

    def _build_preamble(self, guardrails: str, step_context: str,
                        prev_error: Optional[str] = None) -> str:
        retry_section = ""
        if prev_error:
            retry_section = (
                f"\n## ⚠ 이전 시도 실패 — 아래 에러를 반드시 참고하여 수정하라\n\n"
                f"{prev_error}\n\n---\n\n"
            )
        return (
            f"당신은 {self._project} 프로젝트의 개발자입니다. 아래 step을 수행하세요.\n\n"
            f"{guardrails}\n\n---\n\n"
            f"{step_context}{retry_section}"
            f"## 작업 규칙\n\n"
            f"1. 이전 step에서 작성된 코드를 확인하고 일관성을 유지하라.\n"
            f"2. 이 step에 명시된 작업만 수행하라. 추가 기능이나 파일을 만들지 마라.\n"
            f"3. 기존 테스트를 깨뜨리지 마라.\n"
            f"4. AC(Acceptance Criteria) 검증을 직접 실행하라.\n"
            f"5. /phases/{self._phase_dir_name}/index.json의 해당 step status를 업데이트하라:\n"
            f"   - AC 통과 → \"completed\" + \"title\"(≤60자 짧은 한 줄; 커밋 subject·PR 제목에 사용)\n"
            f"     + \"summary\"(상세 요약; 커밋 body·PR 본문·다음 step 컨텍스트에 사용)\n"
            f"   - {self.MAX_RETRIES}회 수정 시도 후에도 실패 → \"error\" + \"error_message\" 기록\n"
            f"   - 사용자 개입이 필요한 경우 (API 키, 인증, 수동 설정 등) → \"blocked\" + \"blocked_reason\" 기록 후 즉시 중단\n"
            f"6. **커밋·푸시·PR·머지를 하지 마라. 모든 git·gh 작업은 실행기(execute.py)가 처리한다.**\n"
            f"   너는 코드 변경과 index.json 갱신만 수행하라.\n\n---\n\n"
        )

    # --- Claude 호출 ---

    def _invoke_claude(self, step: dict, preamble: str) -> dict:
        step_num, step_name = step["step"], step["name"]
        step_file = self._phase_dir / f"step{step_num}.md"

        if not step_file.exists():
            print(f"  ERROR: {step_file} not found")
            sys.exit(1)

        prompt = preamble + step_file.read_text()
        result = subprocess.run(
            ["claude", "-p", "--dangerously-skip-permissions", "--output-format", "json", prompt],
            cwd=self._root, capture_output=True, text=True, timeout=1800,
        )

        if result.returncode != 0:
            print(f"\n  WARN: Claude가 비정상 종료됨 (code {result.returncode})")
            if result.stderr:
                print(f"  stderr: {result.stderr[:500]}")

        output = {
            "step": step_num, "name": step_name,
            "exitCode": result.returncode,
            "stdout": result.stdout, "stderr": result.stderr,
        }
        out_path = self._phase_dir / f"step{step_num}-output.json"
        with open(out_path, "w") as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        return output

    # --- 헤더 & 검증 ---

    def _print_header(self):
        print(f"\n{'='*60}")
        print(f"  Harness Step Executor — ship 워크플로우")
        print(f"  Phase: {self._phase_name} | Steps: {self._total}")
        print(f"  각 step: issue → branch → commit → PR → merge (무인)")
        print(f"{'='*60}")

    def _check_blockers(self):
        index = self._read_json(self._index_file)
        for s in reversed(index["steps"]):
            if s["status"] == "error":
                print(f"\n  ✗ Step {s['step']} ({s['name']}) failed.")
                print(f"  Error: {s.get('error_message', 'unknown')}")
                print(f"  Fix and reset status to 'pending' to retry.")
                sys.exit(1)
            if s["status"] == "blocked":
                print(f"\n  ⏸ Step {s['step']} ({s['name']}) blocked.")
                print(f"  Reason: {s.get('blocked_reason', 'unknown')}")
                print(f"  Resolve and reset status to 'pending' to retry.")
                sys.exit(2)
            if s["status"] != "pending":
                break

    def _ensure_created_at(self):
        index = self._read_json(self._index_file)
        if "created_at" not in index:
            index["created_at"] = self._stamp()
            self._write_json(self._index_file, index)

    # --- 실행 루프 ---

    def _ship_step(self, step: dict, guardrails: str) -> bool:
        """단일 step을 ship 워크플로우로 실행(재시도 포함). 완료 시 True."""
        step_num, step_name = step["step"], step["name"]
        done = sum(1 for s in self._read_json(self._index_file)["steps"] if s["status"] == "completed")

        # 1. main 최신화 → 2. 이슈 → 3. 브랜치
        self._sync_main()
        issue = self._gh_issue_create(step)
        if issue is None:
            self._mark_error(step_num, "이슈 생성 실패")
            self._update_top_index("error")
            sys.exit(1)
        typ, _, slug = self._meta(step)
        branch = f"{typ}/#{issue}-{slug}"
        self._create_branch(branch)

        # 4. Claude 코드 작업 (재시도)
        prev_error = None
        for attempt in range(1, self.MAX_RETRIES + 1):
            index = self._read_json(self._index_file)
            step_context = self._build_step_context(index)
            preamble = self._build_preamble(guardrails, step_context, prev_error)

            tag = f"Step {step_num}/{self._total - 1} ({done} done): {step_name}"
            if attempt > 1:
                tag += f" [retry {attempt}/{self.MAX_RETRIES}]"

            with progress_indicator(tag) as pi:
                self._invoke_claude(step, preamble)
                elapsed = int(pi.elapsed)

            index = self._read_json(self._index_file)
            status = next((s.get("status", "pending") for s in index["steps"] if s["step"] == step_num), "pending")

            if status == "completed":
                self._set_step_fields(step_num, completed_at=self._stamp())
                # 5~8. commit → push → PR → merge → main pull
                self._commit_ship(step, issue)
                self._gh_pr_and_merge(step, issue, branch)
                print(f"  ✓ Step {step_num}: {step_name} shipped [{elapsed}s]")
                return True

            if status == "blocked":
                self._set_step_fields(step_num, blocked_at=self._stamp())
                reason = self._read_step_field(step_num, "blocked_reason") or ""
                print(f"  ⏸ Step {step_num}: {step_name} blocked [{elapsed}s]")
                print(f"    Reason: {reason}")
                self._update_top_index("blocked")
                sys.exit(2)

            err_msg = self._read_step_field(step_num, "error_message") or "Step did not update status"

            if attempt < self.MAX_RETRIES:
                self._set_step_fields(step_num, status="pending")
                index = self._read_json(self._index_file)
                for s in index["steps"]:
                    if s["step"] == step_num:
                        s.pop("error_message", None)
                self._write_json(self._index_file, index)
                prev_error = err_msg
                print(f"  ↻ Step {step_num}: retry {attempt}/{self.MAX_RETRIES} — {err_msg}")
            else:
                self._mark_error(step_num, f"[{self.MAX_RETRIES}회 시도 후 실패] {err_msg}")
                print(f"  ✗ Step {step_num}: {step_name} failed after {self.MAX_RETRIES} attempts [{elapsed}s]")
                print(f"    Error: {err_msg}")
                print(f"    브랜치 '{branch}'와 이슈 #{issue}는 남겨둡니다. 수정 후 재실행하세요.")
                self._update_top_index("error")
                sys.exit(1)

        return False  # unreachable

    def _mark_error(self, step_num: int, message: str):
        self._set_step_fields(step_num, status="error", error_message=message, failed_at=self._stamp())

    def _execute_all_steps(self, guardrails: str):
        while True:
            index = self._read_json(self._index_file)
            pending = next((s for s in index["steps"] if s["status"] == "pending"), None)
            if pending is None:
                print("\n  All steps shipped!")
                return

            step_num = pending["step"]
            if not self._read_step_field(step_num, "started_at"):
                self._set_step_fields(step_num, started_at=self._stamp())

            self._ship_step(pending, guardrails)

    def _finalize(self):
        index = self._read_json(self._index_file)
        index["completed_at"] = self._stamp()
        self._write_json(self._index_file, index)
        self._update_top_index("completed")
        self._sync_main()

        print(f"\n{'='*60}")
        print(f"  Phase '{self._phase_name}' completed! 모든 step이 main에 머지되었습니다.")
        print(f"  정리: PR 머지 완료 → phases/{self._phase_dir_name}/ 삭제 권장 (CLAUDE.md 규칙)")
        print(f"{'='*60}")


def main():
    parser = argparse.ArgumentParser(description="Harness Step Executor (ship 워크플로우)")
    parser.add_argument("phase_dir", help="Phase directory name (e.g. mvp-redesign)")
    args = parser.parse_args()

    StepExecutor(args.phase_dir).run()


if __name__ == "__main__":
    main()

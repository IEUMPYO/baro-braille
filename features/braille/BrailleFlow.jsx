"use client";

// 화면 3 · 점역 (UI_GUIDE "화면 3", docs/ui-mockup-v1.html #screen-3).
// 좌: 문제의 원본 줄 리스트(블록 라벨 + 수식 KaTeX). 줄 클릭 → 선택·점자 로드.
// 우: 점자 셀 편집 — 삽입 커서 모드(selIdx=-1) ↔ 셀 선택 수정 모드(selIdx≥0)를
//     오가는 상태 모델을 목업 <script> 그대로 옮긴다(cells/caret/selIdx/padBits).
// 역점역은 프론트에서 계산하지 않고 backTranslate(mock) 재요청으로만 갱신한다.
import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import katex from "katex";
import "katex/dist/katex.min.css";
import { useWorkflow } from "@/lib/store";
import { mockDoc } from "@/lib/mockData";
import { backTranslate } from "@/lib/services";
import { DOT_BIT, bitsFromCell, cellFromBits, toggleDot } from "@/lib/utils";
import LatexEditor from "@/features/proofread/LatexEditor";

const LABEL = {
  problem: "문제",
  choices: "선택지",
  graph: "그래프",
  figure: "그림",
  table: "표",
};

const ALT_PREFIX = "대체 텍스트: ";
const DOTS = [1, 4, 2, 5, 3, 6]; // 패드 배치 (1·4 / 2·5 / 3·6)

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// [sc]LaTeX[/sc] 인라인 마킹을 텍스트 + KaTeX 수식 블록 HTML로 렌더.
// 수식은 data-latex를 보유한 .math span으로 감싸 클릭 시 편집기가 원본 LaTeX를 읽게 한다.
function buildSrcHtml(raw) {
  const re = /\[sc\]([\s\S]*?)\[\/sc\]/g;
  let out = "";
  let last = 0;
  let m;
  while ((m = re.exec(raw)) !== null) {
    out += escapeHtml(raw.slice(last, m.index));
    const latex = m[1];
    const rendered = katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false,
    });
    out += `<span class="math" data-latex="${escapeHtml(latex)}">${rendered}</span>`;
    last = re.lastIndex;
  }
  out += escapeHtml(raw.slice(last));
  return out;
}

// blocks[]를 좌측 줄 목록으로 평탄화. lineNo는 1-indexed 순번으로, mockData의
// lines{} 키와 정확히 일치한다(문제 → 선택지 → 그래프 순, 블록 첫 줄에 라벨).
function flattenLines(blocks) {
  const out = [];
  let prevType = null;
  let lineNo = 0;
  blocks.forEach((block) => {
    const label = block.type !== prevType ? LABEL[block.type] : null;
    prevType = block.type;
    if (block.type === "choices") {
      block.items.forEach((item, ii) => {
        lineNo += 1;
        out.push({ lineNo, html: item, label: ii === 0 ? label : null });
      });
    } else if (block.type === "problem") {
      lineNo += 1;
      out.push({ lineNo, html: block.html, label });
    } else {
      lineNo += 1;
      out.push({ lineNo, html: `${ALT_PREFIX}${block.alt}`, label });
    }
  });
  return out;
}

// 좌측 원본 줄. 교열 ProofLine과 동일하게 innerHTML을 ref+useEffect로 명령형 주입한다.
// 이렇게 해야 편집기 열기(부모 리렌더) 때 innerHTML이 다시 심기지 않아, 클릭 시 잡아둔
// .math DOM(el)이 살아있고, html이 바뀔 때만(적용 후) 재주입되어 편집 결과가 반영된다.
function SrcLine({ html, selected, onSelect, onMathClick }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = buildSrcHtml(html);
  }, [html]);

  return (
    <button
      type="button"
      ref={ref}
      className={`src-line${selected ? " selected" : ""}`}
      onClick={(e) => {
        const el = e.target.closest?.(".math");
        if (el) {
          onMathClick(el, el.dataset.latex); // 수식 클릭은 줄 선택이 아니라 편집기 열기
          return;
        }
        onSelect();
      }}
    />
  );
}

export default function BrailleFlow() {
  const router = useRouter();
  const { state, setBrailleLine } = useWorkflow();
  const doc = state.doc || mockDoc;
  const problems = doc.problems;

  const [probIdx, setProbIdx] = useState(0);
  const [selLine, setSelLine] = useState(null);
  const [cells, setCells] = useState([]); // 유니코드 점자 문자 배열
  const [caret, setCaret] = useState(0); // 삽입 커서 위치(셀 앞)
  const [selIdx, setSelIdx] = useState(-1); // 선택 셀(-1 = 삽입 커서 모드)
  const [padBits, setPadBits] = useState(0); // 대기 점 조합
  const [dockOpen, setDockOpen] = useState(false);
  const [modified, setModified] = useState(false);
  const [backText, setBackText] = useState("");
  const [backLoading, setBackLoading] = useState(false);
  const [mathCtx, setMathCtx] = useState(null); // 편집 중 수식 { el, origLatex, lineNo }
  const [srcOverride, setSrcOverride] = useState({}); // `${no}-${lineNo}` → 편집된 줄 마크업

  const brailleLineRef = useRef(null);

  // 최신 store를 loadLine 시점에 읽기 위한 ref(문제 전환 시 override 반영)
  const stateRef = useRef(state);
  stateRef.current = state;

  const problem = problems[probIdx];

  // 선택 줄의 점자·역점역을 로드. store override가 있으면 우선, 없으면 mock.
  function loadLine(lineNo) {
    const base = problem.lines[lineNo];
    if (!base) return;
    const override = stateRef.current.braille[problem.no]?.[lineNo];
    setSelLine(lineNo);
    setCells(override?.cells ?? Array.from(base.braille));
    setCaret(0);
    setSelIdx(-1);
    setPadBits(0);
    setModified(override?.modified ?? false);
    setBackText(override?.back ?? base.back);
    setBackLoading(false);
  }

  // 문제 전환 시 첫 줄 자동 선택·로드(초기 마운트 포함).
  useEffect(() => {
    const first = Number(Object.keys(problem.lines)[0]);
    loadLine(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [probIdx]);

  function renderProblem(i) {
    setProbIdx((i + problems.length) % problems.length);
  }

  // 편집 결과를 로컬 셀과 store에 함께 반영("수정됨" 표시 = modified).
  function persist(nextCells, nextModified) {
    setCells(nextCells);
    setModified(nextModified);
    setBrailleLine(problem.no, selLine, {
      cells: nextCells,
      back: backText,
      modified: nextModified,
    });
  }

  function selectCell(i) {
    setSelIdx(i);
    setPadBits(bitsFromCell(cells[i]));
    brailleLineRef.current?.focus();
  }

  function commitCell() {
    if (!padBits) return;
    const next = [...cells];
    next.splice(caret, 0, cellFromBits(padBits));
    setCaret(caret + 1);
    setPadBits(0);
    persist(next, true);
  }

  function deleteSelected() {
    const next = [...cells];
    next.splice(selIdx, 1);
    setCaret(selIdx);
    setSelIdx(-1);
    setPadBits(0);
    persist(next, true);
  }

  // 점(1~6) 토글: 선택 셀이 있으면 그 셀을 즉시 수정, 없으면 대기 점만 토글.
  function toggle(dot) {
    if (selIdx >= 0) {
      const bits = toggleDot(bitsFromCell(cells[selIdx]), dot);
      const next = [...cells];
      next[selIdx] = cellFromBits(bits);
      setPadBits(bits);
      persist(next, true);
    } else {
      setPadBits((b) => b ^ DOT_BIT[dot]);
    }
  }

  function onKeyDown(e) {
    const k = e.key;
    if (k >= "1" && k <= "6") {
      toggle(Number(k));
      e.preventDefault();
    } else if (k === " ") {
      if (selIdx >= 0) {
        // 수정 확정 → 셀 뒤 삽입 커서로 전환
        setCaret(selIdx + 1);
        setSelIdx(-1);
        setPadBits(0);
      } else {
        commitCell();
      }
      e.preventDefault();
    } else if (k === "Backspace") {
      if (selIdx >= 0) deleteSelected();
      else if (caret > 0) {
        const next = [...cells];
        next.splice(caret - 1, 1);
        setCaret(caret - 1);
        persist(next, true);
      }
      e.preventDefault();
    } else if (k === "Delete") {
      if (selIdx >= 0) deleteSelected();
      else if (caret < cells.length) {
        const next = [...cells];
        next.splice(caret, 1);
        persist(next, true);
      }
      e.preventDefault();
    } else if (k === "ArrowLeft") {
      if (selIdx > 0) {
        setSelIdx(selIdx - 1);
        setPadBits(bitsFromCell(cells[selIdx - 1]));
      } else if (selIdx < 0) {
        setCaret(Math.max(0, caret - 1));
      }
      e.preventDefault();
    } else if (k === "ArrowRight") {
      if (selIdx >= 0 && selIdx < cells.length - 1) {
        setSelIdx(selIdx + 1);
        setPadBits(bitsFromCell(cells[selIdx + 1]));
      } else if (selIdx >= 0) {
        setCaret(cells.length);
        setSelIdx(-1);
        setPadBits(0);
      } else {
        setCaret(Math.min(cells.length, caret + 1));
      }
      e.preventDefault();
    }
  }

  // 셀 뒤 빈 공간 클릭 → 선택 해제하고 삽입 커서를 줄 끝으로.
  function onLineClick(e) {
    if (e.target === brailleLineRef.current) {
      setCaret(cells.length);
      setSelIdx(-1);
      setPadBits(0);
    }
  }

  // 역점역 갱신: backTranslate(mock) 재요청 → 성공 시 갱신·modified 해제.
  // 실제 역점역 계산은 백엔드(backTranslate) 몫이라 프론트에서 하지 않는다.
  async function refreshBack() {
    setBackLoading(true);
    await backTranslate(cells);
    const back = problem.lines[selLine].back;
    setBackText(back);
    setModified(false);
    setBackLoading(false);
    setBrailleLine(problem.no, selLine, { cells, back, modified: false });
  }

  // 수식 클릭 → 편집기. 편집 중 라이브 미리보기는 .math DOM을 즉석 갱신하고,
  // 적용 시엔 줄 마크업을 srcOverride에 저장해 리렌더로 반영한다(store·재점역 없음).
  function liveMath(latex) {
    const el = mathCtx?.el;
    if (!el) return;
    katex.render(latex, el, { throwOnError: false, displayMode: false });
    el.dataset.latex = latex;
  }

  // 렌더된 원본 줄(.math data-latex 보유)을 다시 [sc]LaTeX[/sc] 마크업으로 직렬화.
  function serializeSrcLine(el) {
    let out = "";
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        out += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        out += node.classList.contains("math")
          ? `[sc]${node.dataset.latex}[/sc]`
          : node.textContent;
      }
    });
    return out;
  }

  function applyMath(latex) {
    const { el, lineNo } = mathCtx;
    liveMath(latex); // el.dataset.latex를 최종 값으로 갱신 후 직렬화
    const lineEl = el?.closest(".src-line");
    if (lineEl) {
      const markup = serializeSrcLine(lineEl);
      setSrcOverride((o) => ({ ...o, [`${problem.no}-${lineNo}`]: markup }));
    }
    setMathCtx(null);
  }

  function cancelMath() {
    const { el, origLatex } = mathCtx;
    if (el) {
      katex.render(origLatex, el, { throwOnError: false, displayMode: false });
      el.dataset.latex = origLatex;
    }
    setMathCtx(null);
  }

  const lines = flattenLines(problem.blocks);

  return (
    <div>
      <div className="edit-topbar">
        <div className="prob-nav">
          <button
            type="button"
            className="btn small"
            aria-label="이전 문제"
            onClick={() => renderProblem(probIdx - 1)}
          >
            ‹
          </button>
          <span className="pos">
            문제 <b>{problem.no}</b> / {problems.length}
          </span>
          <button
            type="button"
            className="btn small"
            aria-label="다음 문제"
            onClick={() => renderProblem(probIdx + 1)}
          >
            ›
          </button>
        </div>
        <span className="chip page-chip">{problem.page}페이지</span>
        <div className="spacer">
          <button type="button" className="btn">
            임시 저장
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => router.push("/output")}
          >
            점역 완료 →
          </button>
        </div>
      </div>

      <div className="edit-grid">
        {/* 좌: 원본 줄 리스트 */}
        <div className="panel">
          <div className="panel-body">
            {lines.map((line) => {
              const html =
                srcOverride[`${problem.no}-${line.lineNo}`] ?? line.html;
              return (
                <Fragment key={line.lineNo}>
                  {line.label && (
                    <div className="block-label">
                      <span className="chip">{line.label}</span>
                    </div>
                  )}
                  <SrcLine
                    html={html}
                    selected={selLine === line.lineNo}
                    onSelect={() => loadLine(line.lineNo)}
                    onMathClick={(el, latex) =>
                      setMathCtx({
                        el,
                        origLatex: latex,
                        lineNo: line.lineNo,
                      })
                    }
                  />
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* 우: 점자 편집 */}
        <div className="panel">
          <div className={`panel-body${modified ? " modified" : ""}`}>
            <div className="row-label">
              점자<span className="badge-mod">수정됨</span>
            </div>
            <div
              className="braille-edit"
              onFocus={() => setDockOpen(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setDockOpen(false);
                }
              }}
            >
              <div
                className="braille-line"
                ref={brailleLineRef}
                tabIndex={0}
                role="textbox"
                aria-label="점자 편집 영역. 숫자 1부터 6으로 점 선택, 스페이스로 입력, 딜리트로 삭제"
                onKeyDown={onKeyDown}
                onClick={onLineClick}
              >
                {cells.map((ch, i) => (
                  <Fragment key={i}>
                    {selIdx < 0 && i === caret && (
                      <span className="bcaret" aria-hidden="true" />
                    )}
                    <span
                      className={`bcell${i === selIdx ? " selected" : ""}`}
                      onClick={() => selectCell(i)}
                    >
                      {ch}
                    </span>
                  </Fragment>
                ))}
                {selIdx < 0 && caret >= cells.length && (
                  <span className="bcaret" aria-hidden="true" />
                )}
              </div>

              <div
                className={`input-dock${dockOpen ? " open" : ""}`}
                onMouseDown={(e) => e.preventDefault()} // 패드 클릭 시 점자 줄 포커스 유지
              >
                <div className="dotpad" aria-label="점자 점 선택 패드">
                  {DOTS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`dot${padBits & DOT_BIT[d] ? " on" : ""}`}
                      onClick={() => toggle(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div
                  className="pad-preview"
                  aria-label="입력 대기 점자"
                  onClick={commitCell}
                >
                  {cellFromBits(padBits)}
                </div>
                <button
                  className="help-tip"
                  type="button"
                  aria-label="점자 입력 도움말"
                >
                  ?
                  <span className="tip">
                    셀 클릭 → 점 직접 수정 · <kbd>1</kbd>~<kbd>6</kbd>+
                    <kbd>Space</kbd> 입력 · <kbd>Delete</kbd> 삭제 ·{" "}
                    <kbd>←</kbd>
                    <kbd>→</kbd> 이동 · 점 번호 클릭 가능
                  </span>
                </button>
              </div>
            </div>

            <div className="back-box">
              <div className="row-label">역점역</div>
              <div className="back-text">
                {backLoading ? "역점역 요청 중…" : backText}
              </div>
              <div className="back-actions">
                <button
                  type="button"
                  className="btn small"
                  disabled={!modified || backLoading}
                  onClick={refreshBack}
                >
                  역점역 갱신
                </button>
                <span className="back-hint">
                  점자가 수정되어 역점역과 다를 수 있습니다.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {mathCtx && (
        <LatexEditor
          initialLatex={mathCtx.origLatex}
          onLive={liveMath}
          onApply={applyMath}
          onCancel={cancelMath}
        />
      )}
    </div>
  );
}

"use client";

// 화면 2 · 교열 (UI_GUIDE "화면 2", docs/ui-mockup-v1.html #screen-2).
// 좌: 원본 PDF 패널(sticky) — 문항 bbox 오버레이 + hover/focus 시 해당 문항으로
//     확대·이동(zoomReset/zoomTo, transform 계산은 목업 <script> 그대로).
// 우: 인식 텍스트 블록 편집(contentEditable) — 수식은 [sc]LaTeX[/sc]를 KaTeX로 렌더.
//     수식 클릭은 step 4 편집기 훅 지점만 남긴다(이 step에서는 무해).
// 페이지 전환은 좌우를 함께 토글(renderPage), 하이라이트 초기화.
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import katex from "katex";
import "katex/dist/katex.min.css";
import { useWorkflow } from "@/lib/store";
import { mockDoc, PDF_RATIO } from "@/lib/mockData";
import LatexEditor from "./LatexEditor";

const LABEL = {
  problem: "문제",
  choices: "선택지",
  graph: "그래프",
  figure: "그림",
  table: "표",
};

const ALT_PREFIX = "대체 텍스트: ";

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// [sc]LaTeX[/sc] 인라인 마킹을 파싱해 텍스트 + KaTeX 수식 블록 HTML로 렌더.
// 수식은 테두리만 있는 .math 블록(contentEditable=false, data-latex 보유)로 감싼다.
function buildLineHtml(raw) {
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
    out += `<span class="math" contenteditable="false" data-latex="${escapeHtml(
      latex,
    )}">${rendered}</span>`;
    last = re.lastIndex;
  }
  out += escapeHtml(raw.slice(last));
  return out;
}

// contentEditable DOM을 다시 [sc]LaTeX[/sc] 마킹 문자열로 직렬화(수식 data-latex 복원).
function serializeLine(el) {
  let out = "";
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.classList.contains("math")) {
        out += `[sc]${node.dataset.latex}[/sc]`;
      } else {
        out += node.textContent;
      }
    }
  });
  return out;
}

// 문제의 blocks[]를 편집 줄 목록으로 평탄화. 각 줄은 (blockIndex, itemIndex)로 식별.
// 블록 타입이 바뀌는 첫 줄에 라벨(문제/선택지/그래프)을 붙인다.
function flattenBlocks(blocks) {
  const lines = [];
  let prevType = null;
  blocks.forEach((block, bi) => {
    const label = block.type !== prevType ? LABEL[block.type] : null;
    prevType = block.type;
    if (block.type === "choices") {
      block.items.forEach((item, ii) => {
        lines.push({ bi, ii, html: item, label: ii === 0 ? label : null });
      });
    } else if (block.type === "problem") {
      lines.push({ bi, ii: null, html: block.html, label });
    } else {
      lines.push({ bi, ii: null, html: `${ALT_PREFIX}${block.alt}`, label });
    }
  });
  return lines;
}

// contentEditable 줄. 초기/갱신 HTML은 ref로 직접 주입(React 재조정과 분리).
// hover(마우스)와 focus(키보드)를 별도로 알려 좌측 하이라이트 대상 계산에 쓴다.
function ProofLine({
  problemNo,
  initialHtml,
  onHoverIn,
  onHoverOut,
  onFocusIn,
  onFocusOut,
  onEdit,
  onMathClick,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = buildLineHtml(initialHtml);
  }, [initialHtml]);

  return (
    <div
      ref={ref}
      className="proof-line"
      contentEditable
      suppressContentEditableWarning
      data-orig={`orig-p${problemNo}`}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
      onFocus={onFocusIn}
      onBlur={() => {
        onFocusOut();
        if (ref.current) onEdit(serializeLine(ref.current));
      }}
      onClick={(e) => {
        const el = e.target.closest?.(".math");
        if (el) onMathClick(el.dataset.latex, el);
      }}
    />
  );
}

export default function ProofreadFlow() {
  const router = useRouter();
  const { state, setProofread } = useWorkflow();
  const doc = state.doc || mockDoc;

  const [curPage, setCurPage] = useState(1);
  const [hovered, setHovered] = useState(null); // hover 중 문제 no
  const [focused, setFocused] = useState(null); // focus 중 문제 no
  const [mathCtx, setMathCtx] = useState(null); // 편집 중 수식 { problem, bi, ii, el, origLatex }
  const hlProblem = hovered ?? focused; // 목업: hover 우선, 없으면 focus 유지

  const pdfPageRef = useRef(null);
  const zoomRef = useRef(null);

  // 최신 상태를 편집 시점에 읽기 위한 ref(블러 콜백 stale 방지)
  const stateRef = useRef(state);
  stateRef.current = state;

  const pageCount = doc.pages.length;
  const problemsOnPage = doc.problems.filter((p) => p.page === curPage);

  function effectiveBlocks(problem) {
    return stateRef.current.proofread[problem.no]?.blocks || problem.blocks;
  }

  // 좌측 PDF 확대·이동. transform 계산식은 목업 zoomReset/zoomTo 그대로.
  function applyZoom() {
    const page = pdfPageRef.current;
    const zoom = zoomRef.current;
    if (!page || !zoom || !page.clientWidth) return;
    const W = page.clientWidth;
    const Hw = page.clientHeight;
    if (hlProblem == null) {
      const s = Math.min(Hw / (W * PDF_RATIO), 1);
      zoom.style.transform = `translate(${(W - W * s) / 2}px, 0px) scale(${s})`;
      return;
    }
    const box = problemsOnPage.find((p) => p.no === hlProblem)?.bbox;
    if (!box) return;
    const imgH = W * PDF_RATIO;
    const l = (box.left / 100) * W;
    const t = (box.top / 100) * imgH;
    const w = (box.width / 100) * W;
    const h = (box.height / 100) * imgH;
    const s = Math.max(Math.min((W - 32) / w, (Hw - 32) / h, 2.6), 0.4);
    const tx = (W - w * s) / 2 - l * s;
    const ty = (Hw - h * s) / 2 - t * s;
    zoom.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
  }

  useLayoutEffect(applyZoom, [hlProblem, curPage]);

  useEffect(() => {
    function onResize() {
      if (hlProblem == null) applyZoom();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hlProblem]);

  function gotoPage(p) {
    setHovered(null);
    setFocused(null);
    setCurPage(p);
  }

  function handleEdit(problem, bi, ii, text) {
    const blocks = effectiveBlocks(problem).map((b) => ({ ...b }));
    const block = blocks[bi];
    if (ii != null) {
      const items = [...block.items];
      items[ii] = text;
      block.items = items;
    } else if (block.type === "problem") {
      block.html = text;
    } else {
      block.alt = text.startsWith(ALT_PREFIX)
        ? text.slice(ALT_PREFIX.length)
        : text;
    }
    setProofread(problem.no, blocks);
  }

  // 수식 블록 클릭 → 편집기 모달. 클릭한 .math DOM(el)과 위치를 함께 붙잡는다.
  function openMath(problem, bi, ii, latex, el) {
    setMathCtx({ problem, bi, ii, el, origLatex: latex });
  }

  // 편집 중 실시간 미리보기: 클릭한 본문 수식 블록을 KaTeX로 즉시 다시 렌더.
  function liveMath(latex) {
    const el = mathCtx?.el;
    if (!el) return;
    katex.render(latex, el, { throwOnError: false, displayMode: false });
    el.dataset.latex = latex;
  }

  // 적용: 최종 LaTeX를 본문 수식에 반영하고, 해당 줄을 다시 직렬화해 store에 저장.
  function applyMath(latex) {
    const { problem, bi, ii, el } = mathCtx;
    liveMath(latex);
    const line = el?.closest(".proof-line");
    if (line) handleEdit(problem, bi, ii, serializeLine(line));
    setMathCtx(null);
  }

  // 취소·바깥 클릭·Esc: 원래 수식으로 복구.
  function cancelMath() {
    const { el, origLatex } = mathCtx;
    if (el) {
      katex.render(origLatex, el, { throwOnError: false, displayMode: false });
      el.dataset.latex = origLatex;
    }
    setMathCtx(null);
  }

  return (
    <div>
      <div className="edit-topbar">
        <div className="prob-nav">
          <button
            type="button"
            className="btn small"
            aria-label="이전 페이지"
            onClick={() => gotoPage(curPage === 1 ? pageCount : curPage - 1)}
          >
            ‹
          </button>
          <span className="pos">
            페이지 <b>{curPage}</b> / {pageCount}
          </span>
          <button
            type="button"
            className="btn small"
            aria-label="다음 페이지"
            onClick={() => gotoPage(curPage === pageCount ? 1 : curPage + 1)}
          >
            ›
          </button>
        </div>
        <span className="doc">{doc.fileName}</span>
        <div className="spacer">
          <button type="button" className="btn">
            임시 저장
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => router.push("/braille")}
          >
            교열 완료 →
          </button>
        </div>
      </div>

      <div className="edit-grid">
        <div className="panel sticky">
          <div className="panel-body">
            <div className="pdf-page" ref={pdfPageRef} aria-label="원본 문제지">
              <div className="pdf-zoom" ref={zoomRef}>
                {/* 원본 페이지는 정적 이미지(DataURI). 정적 export 호환 위해 <img> 사용 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="pdf-img"
                  src={doc.pages[curPage - 1].image}
                  alt={`원본 ${curPage}페이지`}
                />
                {problemsOnPage.map((p) => (
                  <div
                    key={p.no}
                    className={`orig-box${hlProblem === p.no ? " orig-hl" : ""}`}
                    style={{
                      left: `${p.bbox.left}%`,
                      top: `${p.bbox.top}%`,
                      width: `${p.bbox.width}%`,
                      height: `${p.bbox.height}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-body">
            {problemsOnPage.map((problem) => {
              const blocks = effectiveBlocks(problem);
              return (
                <Fragment key={problem.no}>
                  <div className="prob-divider">문제 {problem.no}</div>
                  {flattenBlocks(blocks).map((line) => (
                    <Fragment
                      key={`${problem.no}-${line.bi}-${line.ii ?? "x"}`}
                    >
                      {line.label && (
                        <div className="block-label">
                          <span className="chip">{line.label}</span>
                        </div>
                      )}
                      <ProofLine
                        problemNo={problem.no}
                        initialHtml={line.html}
                        onHoverIn={() => setHovered(problem.no)}
                        onHoverOut={() => setHovered(null)}
                        onFocusIn={() => setFocused(problem.no)}
                        onFocusOut={() => setFocused(null)}
                        onEdit={(text) =>
                          handleEdit(problem, line.bi, line.ii, text)
                        }
                        onMathClick={(latex, el) =>
                          openMath(problem, line.bi, line.ii, latex, el)
                        }
                      />
                    </Fragment>
                  ))}
                </Fragment>
              );
            })}
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

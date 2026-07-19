"use client";

// 수식 편집기 모달 (UI_GUIDE "수식 편집기 모달", docs/ui-mockup-v1.html #latexModal).
// 레이아웃(위→아래): 템플릿 탭 → 템플릿 그리드 → 시각 편집 필드 → LaTeX 코드 → 취소/적용.
// TABS 목록·insertItem·recompute·visualToHtml 동작은 목업 <script>를 그대로 옮긴다.
// 단, 목업의 간이 texToHtml 대신 KaTeX로 렌더한다(ADR-011):
//  - 시각 편집 필드의 base 표현과 코드 직접 편집 미리보기는 katex.render.
//  - 템플릿 빈칸(slot) 입력 UX는 목업의 구조 HTML(.frac/.lim/.slot)을 그대로 유지.
import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// 목업 TABS 배열 그대로. 각 항목 {btn(표시), cap(설명), ins(삽입 구조), tex(LaTeX 패턴)}.
const TABS = [
  {
    name: "구조",
    items: [
      {
        btn: '<span class="frac"><span class="top">□</span><span>□</span></span>',
        cap: "분수",
        ins: '<span class="frac"><span class="top"><input class="slot" aria-label="분자"></span><span><input class="slot" aria-label="분모"></span></span>',
        tex: "\\dfrac{%1}{%2}",
      },
      {
        btn: "□<sup>□</sup>",
        cap: "지수",
        ins: '<span><input class="slot" aria-label="밑"><sup><input class="slot slot-sm" aria-label="지수"></sup></span>',
        tex: "%1^{%2}",
      },
      {
        btn: "□<sub>□</sub>",
        cap: "첨자",
        ins: '<span><input class="slot" aria-label="본문"><sub><input class="slot slot-sm" aria-label="첨자"></sub></span>',
        tex: "%1_{%2}",
      },
      {
        btn: "√□",
        cap: "근호",
        ins: '<span>√<input class="slot" aria-label="근호 안"></span>',
        tex: "\\sqrt{%1}",
      },
      {
        btn: "|□|",
        cap: "절댓값",
        ins: '<span>|<input class="slot" aria-label="절댓값 안">|</span>',
        tex: "\\left| %1 \\right|",
      },
      {
        btn: "(□)",
        cap: "괄호",
        ins: '<span>(<input class="slot" aria-label="괄호 안">)</span>',
        tex: "\\left( %1 \\right)",
      },
      {
        btn: "[□]",
        cap: "대괄호",
        ins: '<span>[<input class="slot" aria-label="대괄호 안">]</span>',
        tex: "\\left[ %1 \\right]",
      },
      {
        btn: "{□}",
        cap: "집합",
        ins: '<span>{<input class="slot" aria-label="원소">}</span>',
        tex: "\\{ %1 \\}",
      },
      {
        btn: "f(□)",
        cap: "함수",
        ins: '<span>f(<input class="slot" aria-label="변수">)</span>',
        tex: "f(%1)",
      },
    ],
  },
  {
    name: "연산 · 관계",
    items: [
      { btn: "+", tex: "+" },
      { btn: "−", tex: "-" },
      { btn: "×", tex: "\\times" },
      { btn: "÷", tex: "\\div" },
      { btn: "±", tex: "\\pm" },
      { btn: "=", tex: "=" },
      { btn: "≠", tex: "\\neq" },
      { btn: "≥", tex: "\\geq" },
      { btn: "≤", tex: "\\leq" },
      { btn: "∈", tex: "\\in" },
      { btn: "⊂", tex: "\\subset" },
      { btn: "∪", tex: "\\cup" },
      { btn: "∩", tex: "\\cap" },
    ],
  },
  {
    name: "기호",
    items: [
      { btn: "π", tex: "\\pi" },
      { btn: "α", tex: "\\alpha" },
      { btn: "β", tex: "\\beta" },
      { btn: "θ", tex: "\\theta" },
      { btn: "∞", tex: "\\infty" },
      { btn: "∅", tex: "\\varnothing" },
      { btn: "→", tex: "\\to" },
      { btn: "⋯", tex: "\\cdots" },
    ],
  },
  {
    name: "함수 · 극한",
    items: [
      {
        btn: "sin □",
        ins: '<span>sin <input class="slot" aria-label="사인"></span>',
        tex: "\\sin %1",
      },
      {
        btn: "cos □",
        ins: '<span>cos <input class="slot" aria-label="코사인"></span>',
        tex: "\\cos %1",
      },
      {
        btn: "tan □",
        ins: '<span>tan <input class="slot" aria-label="탄젠트"></span>',
        tex: "\\tan %1",
      },
      {
        btn: "log<sub>□</sub> □",
        ins: '<span>log<sub><input class="slot slot-sm" aria-label="밑"></sub> <input class="slot" aria-label="진수"></span>',
        tex: "\\log_{%1} %2",
      },
      {
        btn: '<span class="lim">lim<span class="under">x→□</span></span>',
        ins: '<span class="lim">lim<span class="under">x→<input class="slot slot-sm" aria-label="극한값"></span></span>',
        tex: "\\lim_{x \\to %1}",
      },
      {
        btn: '<span class="lim">Σ<span class="under">k=□</span></span>',
        ins: '<span class="lim">Σ<span class="under">k=<input class="slot slot-sm" aria-label="시작값"></span></span>',
        tex: "\\sum_{k=%1}",
      },
      {
        btn: "∫<sub>□</sub><sup>□</sup>",
        ins: '<span>∫<sub><input class="slot slot-sm" aria-label="아래끝"></sub><sup><input class="slot slot-sm" aria-label="위끝"></sup></span>',
        tex: "\\int_{%1}^{%2}",
      },
    ],
  },
];

// base LaTeX를 시각 편집 필드에 KaTeX로 렌더(목업의 base innerHTML 자리).
function renderBase(container, latex) {
  const span = document.createElement("span");
  span.className = "kx";
  katex.render(latex || "", span, { throwOnError: false, displayMode: false });
  container.replaceChildren(span);
}

export default function LatexEditor({
  initialLatex,
  onLive,
  onApply,
  onCancel,
}) {
  const visualRef = useRef(null);
  const srcRef = useRef(null);
  const modalRef = useRef(null);
  const baseRef = useRef(initialLatex || "");
  const insertedRef = useRef([]); // [{ tex, slots: HTMLInputElement[] }]
  const [tab, setTab] = useState(0);

  // 시각 필드 base + 삽입 템플릿을 합쳐 LaTeX 코드 재계산 → textarea·본문 미리보기 갱신.
  function recompute() {
    const parts = [
      baseRef.current,
      ...insertedRef.current.map((t) =>
        t.tex.replace(
          /%(\d)/g,
          (_, i) => (t.slots[i - 1] && t.slots[i - 1].value) || "□",
        ),
      ),
    ];
    const latex = parts.filter(Boolean).join(" ").trim();
    if (srcRef.current) srcRef.current.value = latex;
    onLive(latex);
  }

  // 템플릿 클릭 → 시각 필드에 빈칸(slot) 구조 삽입, 첫 빈칸 포커스.
  function insertItem(item) {
    const wrap = document.createElement("span");
    wrap.innerHTML = item.ins || item.btn;
    visualRef.current.appendChild(wrap);
    const slots = Array.from(wrap.querySelectorAll(".slot"));
    slots.forEach((s) => s.addEventListener("input", recompute));
    insertedRef.current.push({ tex: item.tex, slots });
    if (slots.length) slots[0].focus();
    recompute();
  }

  // 초기 표시: base = 클릭한 수식의 LaTeX, 삽입 없음.
  useEffect(() => {
    baseRef.current = initialLatex || "";
    insertedRef.current = [];
    if (srcRef.current) srcRef.current.value = initialLatex || "";
    if (visualRef.current) renderBase(visualRef.current, initialLatex || "");
    modalRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Esc → 취소(원복).
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  // LaTeX 코드 직접 편집 → base 갱신·삽입 초기화, 시각 필드를 KaTeX로 즉시 렌더.
  function onSrcInput(e) {
    baseRef.current = e.target.value;
    insertedRef.current = [];
    renderBase(visualRef.current, e.target.value);
    onLive(e.target.value);
  }

  return (
    <div
      className="modal-backdrop open"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="수식 편집기"
        tabIndex={-1}
        ref={modalRef}
      >
        <h2>수식 편집</h2>

        <div className="tpl-tabs" role="tablist" aria-label="수식 템플릿 분류">
          {TABS.map((t, i) => (
            <button
              key={t.name}
              type="button"
              role="tab"
              aria-selected={i === tab}
              className={`tpl-tab${i === tab ? " active" : ""}`}
              onClick={() => setTab(i)}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="tpl-grid">
          {TABS[tab].items.map((item, i) => (
            <button
              key={i}
              type="button"
              className="tpl"
              onClick={() => insertItem(item)}
              dangerouslySetInnerHTML={{
                __html:
                  item.btn +
                  (item.cap ? `<span class="cap">${item.cap}</span>` : ""),
              }}
            />
          ))}
        </div>

        <div
          className="latex-preview"
          ref={visualRef}
          aria-label="수식 편집 영역"
        />

        <textarea
          className="latex-src"
          ref={srcRef}
          spellCheck={false}
          aria-label="LaTeX 코드"
          onInput={onSrcInput}
        />

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>
            취소
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => onApply(srcRef.current.value)}
          >
            적용
          </button>
        </div>
      </section>
    </div>
  );
}

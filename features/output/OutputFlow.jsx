"use client";

// 화면 4 · 출력 (UI_GUIDE "화면 4", docs/ui-mockup-v1.html #screen-4).
// 다운로드 카드 3종(BRF·BRL·PDF). BRF·BRL은 store의 편집 완료 점자(유니코드 셀)에서
// ASCII Braille(북미 표준)로 실제 파일을 생성하고, PDF 대조본은 MVP 더미 파일(로드맵).
// 다운로드는 정적 빌드 호환을 위해 Blob + 임시 링크로 처리(lib/utils downloadFile).
import { useRouter } from "next/navigation";
import { useWorkflow } from "@/lib/store";
import { mockDoc } from "@/lib/mockData";
import { brailleToAscii, downloadFile } from "@/lib/utils";

// 문제·줄을 순서대로 모아 ASCII Braille 텍스트로 직렬화.
// 편집 override(cells)가 있으면 우선, 없으면 mock 점자 문자열을 사용한다.
function buildBrailleText(doc, brailleState) {
  const out = [];
  doc.problems.forEach((problem) => {
    const override = brailleState[problem.no] || {};
    Object.keys(problem.lines)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((lineNo) => {
        const edited = override[lineNo];
        const cells = edited?.cells
          ? edited.cells.join("")
          : problem.lines[lineNo].braille;
        out.push(brailleToAscii(cells));
      });
    out.push(""); // 문제 간 빈 줄
  });
  return out.join("\n");
}

function kb(str) {
  const bytes = new TextEncoder().encode(str).length;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export default function OutputFlow() {
  const router = useRouter();
  const { state } = useWorkflow();
  const doc = state.doc || mockDoc;

  const brailleText = buildBrailleText(doc, state.braille);
  const pdfDummy =
    "바로점자 묵자·점자 대조본 (MVP 더미 파일).\n" +
    "실제 대조본 렌더링은 로드맵 범위입니다.\n";

  const cards = [
    {
      tag: "BRF",
      title: "점자 인쇄용 파일",
      fileName: "수학영역_문제지.brf",
      content: brailleText,
      mime: "text/plain;charset=utf-8",
    },
    {
      tag: "BRL",
      title: "전자점자 파일",
      fileName: "수학영역_문제지.brl",
      content: brailleText,
      mime: "text/plain;charset=utf-8",
    },
    {
      tag: "PDF",
      title: "인쇄물 확인용 문서",
      fileName: "수학영역_문제지_대조본.pdf",
      content: pdfDummy,
      mime: "application/pdf",
    },
  ];

  return (
    <div className="result-wrap">
      <h1 className="page" style={{ marginBottom: 20 }}>
        출력
      </h1>

      {cards.map((card) => (
        <div key={card.tag} className="dl-card">
          <span className="fmt-tag">{card.tag}</span>
          <span className="dl-meta">
            <span className="dl-title">{card.title}</span>
            <br />
            <span className="dl-file">
              {card.fileName} · {kb(card.content)}
            </span>
          </span>
          <button
            type="button"
            className="btn"
            onClick={() =>
              downloadFile({
                fileName: card.fileName,
                content: card.content,
                mime: card.mime,
              })
            }
            aria-label={`${card.title} 다운로드`}
          >
            다운로드
          </button>
        </div>
      ))}

      <div className="result-foot">
        <button
          type="button"
          className="link-plain"
          onClick={() => router.push("/braille")}
        >
          ← 이전 단계
        </button>
        <button type="button" className="btn" onClick={() => router.push("/")}>
          새 작업 시작하기
        </button>
      </div>
    </div>
  );
}

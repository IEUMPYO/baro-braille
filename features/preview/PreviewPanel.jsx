import { UploadCloud } from "lucide-react";
import "./PreviewPanel.css";

/**
 * 수학 문제 미리보기 내부 컴포넌트
 */
function MathPreview({ problem, status }) {
  if (!problem) {
    return (
      <div className="preview-empty">
        <UploadCloud size={50} strokeWidth={1.8} />
        <p>
          {status === "recognizing"
            ? "문제를 인식하는 중입니다."
            : "업로드 후 인식된 문제가 표시됩니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="math-paper" aria-label="인식된 수학 문제 예시">
      <p className="question-line">
        <strong>{problem.number}.</strong> {problem.lines[0]}
      </p>
      <p className="question-line indent">{problem.lines[1]}</p>
      <p className="question-line indent">
        {problem.lines[2]} <span className="score">[{problem.points}점]</span>
      </p>

      <svg
        className="graph"
        viewBox="0 0 520 230"
        role="img"
        aria-label="함수 그래프"
      >
        <defs>
          <marker
            id="arrow"
            markerHeight="8"
            markerWidth="8"
            orient="auto"
            refX="4"
            refY="4"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="#111827" />
          </marker>
        </defs>
        <line
          x1="88"
          y1="178"
          x2="452"
          y2="178"
          stroke="#111827"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
        <line
          x1="150"
          y1="198"
          x2="150"
          y2="44"
          stroke="#111827"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
        <path
          d="M150 112 C210 42 290 36 358 94 C392 122 418 154 430 178"
          fill="none"
          stroke="#2f343d"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <circle cx="150" cy="112" r="5" fill="#111827" />
        <circle cx="430" cy="178" r="5" fill="#111827" />
        <text x="122" y="114" className="graph-text">
          2
        </text>
        <text x="414" y="205" className="graph-text">
          3
        </text>
        <text x="128" y="205" className="graph-text">
          O
        </text>
        <text x="129" y="58" className="graph-text">
          y
        </text>
        <text x="462" y="186" className="graph-text">
          x
        </text>
        <text x="328" y="80" className="graph-label">
          y = f(x)
        </text>
      </svg>

      <div className="answers" aria-label="객관식 보기">
        {problem.answers.map((answer, index) => (
          <span key={answer}>
            <b>{index + 1}</b> {answer}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * 인식된 문제 미리보기 패널
 * @param {Object} props
 * @param {Object|null} props.problem - 인식된 문제 객체 (mockProblem 형식)
 * @param {string} props.status - 현재 상태 ("idle" | "recognizing" | "converting" | "complete")
 */
export default function PreviewPanel({ problem, status }) {
  const hasResult = status === "complete";

  return (
    <section className="preview-panel" aria-label="인식된 문제 미리보기">
      <div className="panel-heading">
        <h2>인식된 문제 미리보기</h2>
        <span className={`status-pill ${status}`}>
          {status === "idle" ? "대기" : hasResult ? "완료" : "진행 중"}
        </span>
      </div>
      <MathPreview problem={problem} status={status} />
    </section>
  );
}

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  FileArchive,
  FileText,
  HelpCircle,
  Printer,
  UploadCloud,
  UserRound
} from "lucide-react";

const fileCards = [
  { label: "BRF", ext: ".brf", tone: "mint", icon: FileText },
  { label: "전자점자", ext: ".zip", tone: "violet", icon: FileArchive },
  { label: "PDF", ext: ".pdf", tone: "rose", icon: FileText }
];

function BrailleDots({ small = false }) {
  return (
    <span className={small ? "braille-dots braille-dots-small" : "braille-dots"} aria-hidden="true">
      {Array.from({ length: 9 }).map((_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}

function StepIcon({ active, icon: Icon, label }) {
  return (
    <div className="step">
      <div className={active ? "step-icon step-icon-active" : "step-icon"}>
        {active ? <BrailleDots small /> : <Icon size={34} strokeWidth={1.8} />}
      </div>
      <span>{label}</span>
    </div>
  );
}

function MathPreview() {
  return (
    <div className="math-paper" aria-label="인식된 수학 문제 예시">
      <p className="question-line">
        <strong>14.</strong> 다음 그림과 같이 함수 <em>y = f(x)</em>의 그래프가
      </p>
      <p className="question-line indent">
        두 점 <span>(0, 2)</span>, <span>(3, 0)</span>을 지날 때, 보기 중
      </p>
      <p className="question-line indent">
        <em>f(1)</em>의 값으로 옳은 것은? <span className="score">[3점]</span>
      </p>

      <svg className="graph" viewBox="0 0 520 230" role="img" aria-label="함수 그래프">
        <defs>
          <marker id="arrow" markerHeight="8" markerWidth="8" orient="auto" refX="4" refY="4">
            <path d="M0,0 L8,4 L0,8 Z" fill="#111827" />
          </marker>
        </defs>
        <line x1="88" y1="178" x2="452" y2="178" stroke="#111827" strokeWidth="2" markerEnd="url(#arrow)" />
        <line x1="150" y1="198" x2="150" y2="44" stroke="#111827" strokeWidth="2" markerEnd="url(#arrow)" />
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
        {["1/2", "1", "3/2", "2", "5/2"].map((answer, index) => (
          <span key={answer}>
            <b>{index + 1}</b> {answer}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);

  function handleFiles(files) {
    const file = files?.[0];
    if (file) {
      setFileName(file.name);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }

  function handleDownload() {
    const demo = "바로점자 프로토타입 데모 파일입니다.\n실제 점역 결과 생성은 백엔드 연동 후 제공됩니다.\n";
    const blob = new Blob([demo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "baro-braille-demo.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="바로점자 홈">
          <BrailleDots />
          <span>바로점자</span>
        </Link>
        <nav className="nav-actions" aria-label="상단 메뉴">
          <a href="#guide">
            <HelpCircle size={23} />
            사용 가이드
          </a>
          <a href="#profile">
            <UserRound size={25} />
            내 정보
          </a>
        </nav>
      </header>

      <section className="workspace" aria-label="문서 점역 변환 작업 영역">
        <section
          className="upload-panel"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          aria-label="문제집 파일 업로드"
        >
          <button className="upload-box" type="button" onClick={() => inputRef.current?.click()}>
            <UploadCloud size={64} strokeWidth={1.9} />
            <span className="upload-title">문제집 PDF · 이미지 업로드</span>
            <span className="upload-copy">PDF, JPG, PNG 파일을 드래그하거나 클릭하여 업로드하세요</span>
            <span className="upload-resolution">권장 해상도: 300dpi 이상</span>
            {fileName ? <span className="selected-file">{fileName}</span> : null}
          </button>
          <input
            ref={inputRef}
            className="visually-hidden"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={(event) => handleFiles(event.target.files)}
          />
        </section>

        <section className="preview-panel" aria-label="인식된 문제 미리보기">
          <h2>인식된 문제 미리보기</h2>
          <MathPreview />
        </section>

        <aside className="result-panel" aria-label="변환 결과">
          <section className="stage-card">
            <h2>변환 진행 단계</h2>
            <div className="steps">
              <StepIcon icon={FileText} label="문서 인식" />
              <div className="step-arrow" aria-hidden="true">
                →
              </div>
              <StepIcon active icon={FileText} label="점역 변환" />
              <div className="step-arrow" aria-hidden="true">
                →
              </div>
              <StepIcon icon={Printer} label="결과 출력" />
            </div>
          </section>

          <section className="complete-card">
            <div className="complete-message">
              <CheckCircle2 size={54} fill="#2bb673" stroke="#ffffff" strokeWidth={2.5} />
              <div>
                <h2>변환 완료</h2>
                <p>수학 문제의 점자 변환이 완료되었습니다.</p>
              </div>
            </div>

            <div className="divider" />

            <h3>생성된 파일</h3>
            <div className="file-grid">
              {fileCards.map(({ label, ext, tone, icon: Icon }) => (
                <button className={`file-card ${tone}`} key={label} type="button">
                  <Icon size={36} strokeWidth={1.8} />
                  <strong>{label}</strong>
                  <span>{ext}</span>
                </button>
              ))}
            </div>

            <button className="download-button" type="button" onClick={handleDownload}>
              <Download size={25} />
              결과 다운로드
            </button>
          </section>
        </aside>
      </section>
    </main>
  );
}

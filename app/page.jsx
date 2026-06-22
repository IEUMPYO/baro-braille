"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  FileArchive,
  FileText,
  HelpCircle,
  Printer,
  UploadCloud,
  UserRound,
  X
} from "lucide-react";

const mockProblem = {
  number: 14,
  points: 3,
  lines: [
    <>다음 그림과 같이 함수 <em>y = f(x)</em>의 그래프가</>,
    <>
      두 점 <span>(0, 2)</span>, <span>(3, 0)</span>을 지날 때, 보기 중
    </>,
    <>
      <em>f(1)</em>의 값으로 옳은 것은?
    </>
  ],
  answers: ["1/2", "1", "3/2", "2", "5/2"]
};

const mockFiles = [
  {
    label: "BRF",
    ext: ".brf",
    tone: "mint",
    icon: FileText,
    fileName: "baro-braille-math-14.brf",
    mime: "text/plain;charset=utf-8",
    content:
      "BARO BRAILLE MOCK BRF\n\n문항 14\n함수 y=f(x)의 그래프가 (0,2), (3,0)을 지날 때 f(1)의 값을 구하는 문제입니다.\n\n정답 후보: 1/2, 1, 3/2, 2, 5/2\n"
  },
  {
    label: "전자점자",
    ext: ".zip",
    tone: "violet",
    icon: FileArchive,
    fileName: "baro-braille-e-braille.zip",
    mime: "application/zip",
    content:
      "MOCK ZIP PACKAGE\n\n실제 서비스에서는 전자점자 패키지 파일이 생성됩니다.\n이 파일은 프로토타입 다운로드 흐름 확인용 mock 데이터입니다.\n"
  },
  {
    label: "PDF",
    ext: ".pdf",
    tone: "rose",
    icon: FileText,
    fileName: "baro-braille-result.pdf",
    mime: "application/pdf",
    content:
      "%PDF-1.4\n% Baro Braille mock PDF\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 0 >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n"
  }
];

const mockProfile = {
  org: "서울특별시교육청",
  user: "수능 수학 점역 담당자",
  plan: "기관 베타",
  quota: "이번 달 18 / 50건"
};

const stageCopy = {
  idle: "업로드할 문서를 기다리고 있습니다.",
  recognizing: "문서에서 수학 문항과 그래프를 인식하고 있습니다.",
  converting: "인식된 수식을 점자 규칙에 맞게 변환하고 있습니다.",
  complete: "BRF, 전자점자, PDF 결과 파일이 생성되었습니다."
};

const stageOrder = ["recognizing", "converting", "complete"];

function BrailleDots({ small = false }) {
  return (
    <span className={small ? "braille-dots braille-dots-small" : "braille-dots"} aria-hidden="true">
      {Array.from({ length: 9 }).map((_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}

function StepIcon({ icon: Icon, label, state, activeBraille = false }) {
  return (
    <div className="step">
      <div className={`step-icon ${state}`}>
        {state === "done" ? (
          <CheckCircle2 size={34} strokeWidth={2.1} />
        ) : activeBraille ? (
          <BrailleDots small />
        ) : (
          <Icon size={34} strokeWidth={1.8} />
        )}
      </div>
      <span>{label}</span>
    </div>
  );
}

function MathPreview({ problem, status }) {
  if (!problem) {
    return (
      <div className="preview-empty">
        <UploadCloud size={50} strokeWidth={1.8} />
        <p>{status === "recognizing" ? "문제를 인식하는 중입니다." : "업로드 후 인식된 문제가 표시됩니다."}</p>
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
        {problem.answers.map((answer, index) => (
          <span key={answer}>
            <b>{index + 1}</b> {answer}
          </span>
        ))}
      </div>
    </div>
  );
}

function Modal({ type, onClose }) {
  const isGuide = type === "guide";

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={isGuide ? "사용 가이드" : "내 정보"} onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="닫기">
          <X size={22} />
        </button>

        {isGuide ? (
          <>
            <h2>사용 가이드</h2>
            <ol className="guide-list">
              <li>PDF, JPG, PNG 형식의 수학 문제 파일을 업로드합니다.</li>
              <li>문서 인식과 점역 변환 단계가 순서대로 진행됩니다.</li>
              <li>생성된 BRF, 전자점자, PDF 파일을 다운로드합니다.</li>
            </ol>
          </>
        ) : (
          <>
            <h2>내 정보</h2>
            <dl className="profile-list">
              <div>
                <dt>기관</dt>
                <dd>{mockProfile.org}</dd>
              </div>
              <div>
                <dt>사용자</dt>
                <dd>{mockProfile.user}</dd>
              </div>
              <div>
                <dt>플랜</dt>
                <dd>{mockProfile.plan}</dd>
              </div>
              <div>
                <dt>사용량</dt>
                <dd>{mockProfile.quota}</dd>
              </div>
            </dl>
          </>
        )}
      </section>
    </div>
  );
}

function downloadFile(file) {
  const blob = new Blob([file.content], { type: file.mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [recognizedProblem, setRecognizedProblem] = useState(null);
  const [resultFiles, setResultFiles] = useState([]);
  const [openModal, setOpenModal] = useState(null);
  const [toast, setToast] = useState("");
  const timers = useRef([]);
  const toastTimer = useRef(null);

  useEffect(() => {
    return () => {
      timers.current.forEach(window.clearTimeout);
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!openModal) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpenModal(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openModal]);

  function showToast(message) {
    setToast(message);
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  }

  function clearWorkflowTimers() {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }

  function startMockWorkflow(file) {
    clearWorkflowTimers();
    setFileName(file.name);
    setStatus("recognizing");
    setProgress(12);
    setRecognizedProblem(null);
    setResultFiles([]);
    showToast("문서 업로드가 완료되었습니다.");

    timers.current = [
      window.setTimeout(() => {
        setProgress(42);
        setRecognizedProblem(mockProblem);
        showToast("문제 인식이 완료되었습니다.");
      }, 700),
      window.setTimeout(() => {
        setStatus("converting");
        setProgress(72);
      }, 1500),
      window.setTimeout(() => {
        setStatus("complete");
        setProgress(100);
        setResultFiles(mockFiles);
        showToast("점역 결과 파일이 생성되었습니다.");
      }, 2400)
    ];
  }

  function handleFiles(files) {
    const file = files?.[0];
    if (!file) {
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const allowed = /\.(pdf|jpg|jpeg|png)$/i.test(file.name) || allowedTypes.includes(file.type);
    if (!allowed) {
      showToast("PDF, JPG, PNG 파일만 업로드할 수 있습니다.");
      return;
    }

    startMockWorkflow(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }

  function handleDownload(file) {
    if (status !== "complete") {
      showToast("변환 완료 후 다운로드할 수 있습니다.");
      return;
    }

    downloadFile(file);
    showToast(`${file.label} 파일 다운로드를 시작했습니다.`);
  }

  function handleDownloadAll() {
    if (status !== "complete") {
      showToast("변환 완료 후 다운로드할 수 있습니다.");
      return;
    }

    resultFiles.forEach((file, index) => {
      window.setTimeout(() => downloadFile(file), index * 180);
    });
    showToast("생성된 파일 다운로드를 시작했습니다.");
  }

  const currentStageIndex = stageOrder.indexOf(status);
  const hasResult = status === "complete";
  const displayedFiles = hasResult ? resultFiles : mockFiles;

  function getStageState(index) {
    if (status === "idle") {
      return "idle";
    }
    if (index < currentStageIndex || status === "complete") {
      return "done";
    }
    if (index === currentStageIndex) {
      return "active";
    }
    return "idle";
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="바로점자 홈">
          <BrailleDots />
          <span>바로점자</span>
        </Link>
        <nav className="nav-actions" aria-label="상단 메뉴">
          <button type="button" onClick={() => setOpenModal("guide")}>
            <HelpCircle size={23} />
            사용 가이드
          </button>
          <button type="button" onClick={() => setOpenModal("profile")}>
            <UserRound size={25} />
            내 정보
          </button>
        </nav>
      </header>

      <section className="workspace" aria-label="문서 점역 변환 작업 영역">
        <section
          className="upload-panel"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          aria-label="파일 업로드"
        >
          <div className="upload-box">
            <UploadCloud size={64} strokeWidth={1.9} />
            <span className="upload-title">파일 업로드</span>
            <span className="upload-copy">업로드 가능한 파일 형식: <br></br> pdf, docx, jpg</span>
            <input
              id="problem-upload"
              className="upload-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              aria-label="문제집 PDF 또는 이미지 파일 선택"
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <span className="upload-resolution">권장 해상도: 300dpi 이상</span>
            {fileName ? <span className="selected-file">{fileName}</span> : null}
          </div>
        </section>

        <section className="preview-panel" aria-label="인식된 문제 미리보기">
          <div className="panel-heading">
            <h2>인식된 문제 미리보기</h2>
            <span className={`status-pill ${status}`}>{status === "idle" ? "대기" : hasResult ? "완료" : "진행 중"}</span>
          </div>
          <MathPreview problem={recognizedProblem} status={status} />
        </section>

        <aside className="result-panel" aria-label="변환 결과">
          <section className="stage-card">
            <h2>변환 진행 단계</h2>
            <div className="steps">
              <StepIcon icon={FileText} label="문서 인식" state={getStageState(0)} />
              <div className="step-arrow" aria-hidden="true">
                →
              </div>
              <StepIcon icon={FileText} label="점역 변환" state={getStageState(1)} activeBraille={status === "converting"} />
              <div className="step-arrow" aria-hidden="true">
                →
              </div>
              <StepIcon icon={Printer} label="결과 출력" state={getStageState(2)} />
            </div>
            <div className="progress-track" aria-label="변환 진행률">
              <span style={{ width: `${progress}%` }} />
            </div>
            <p className="stage-copy">{stageCopy[status]}</p>
          </section>

          <section className={hasResult ? "complete-card" : "complete-card waiting"}>
            <div className="complete-message">
              <CheckCircle2 size={54} fill={hasResult ? "#2bb673" : "#c8d1df"} stroke="#ffffff" strokeWidth={2.5} />
              <div>
                <h2>{hasResult ? "변환 완료" : "결과 대기 중"}</h2>
                <p>{hasResult ? "수학 문제의 점자 변환이 완료되었습니다." : "업로드 후 변환 결과가 생성됩니다."}</p>
              </div>
            </div>

            <div className="divider" />

            <h3>생성된 파일</h3>
            <div className="file-grid">
              {displayedFiles.map(({ label, ext, tone, icon: Icon, ...file }) => (
                <button
                  className={`file-card ${tone}`}
                  key={label}
                  type="button"
                  disabled={!hasResult}
                  onClick={() => handleDownload({ label, ext, tone, icon: Icon, ...file })}
                >
                  <Icon size={36} strokeWidth={1.8} />
                  <strong>{label}</strong>
                  <span>{ext}</span>
                </button>
              ))}
            </div>

            <button className="download-button" type="button" disabled={!hasResult} onClick={handleDownloadAll}>
              <Download size={25} />
              결과 다운로드
            </button>
          </section>
        </aside>
      </section>

      {openModal ? <Modal type={openModal} onClose={() => setOpenModal(null)} /> : null}
      {toast ? <div className="toast">{toast}</div> : null}
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HelpCircle, UserRound, X } from "lucide-react";
import { convertToBraille } from "@/lib/services";
import { downloadFile } from "@/lib/utils";
import { mockFiles, mockProfile } from "@/lib/mockData";
import UploadPanel from "@/components/upload/UploadPanel";
import PreviewPanel from "@/components/preview/PreviewPanel";
import ConversionSteps from "@/components/conversion/ConversionSteps";
import ResultPanel from "@/components/result/ResultPanel";

function BrailleDots({ small = false }) {
  return (
    <span
      className={small ? "braille-dots braille-dots-small" : "braille-dots"}
      aria-hidden="true"
    >
      {Array.from({ length: 9 }).map((_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}

function Modal({ type, onClose }) {
  const isGuide = type === "guide";

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={isGuide ? "사용 가이드" : "내 정보"}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="닫기"
        >
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

export default function Home() {
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [recognizedProblem, setRecognizedProblem] = useState(null);
  const [resultFiles, setResultFiles] = useState([]);
  const [openModal, setOpenModal] = useState(null);
  const [toast, setToast] = useState("");
  const cleanupRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
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

  function handleUpload(file) {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const allowed =
      /\.(pdf|jpg|jpeg|png)$/i.test(file.name) ||
      allowedTypes.includes(file.type);
    if (!allowed) {
      showToast("PDF, JPG, PNG 파일만 업로드할 수 있습니다.");
      return;
    }

    if (cleanupRef.current) {
      cleanupRef.current();
    }

    setFileName(file.name);
    setStatus("recognizing");
    setProgress(12);
    setRecognizedProblem(null);
    setResultFiles([]);
    showToast("문서 업로드가 완료되었습니다.");

    const cleanup = convertToBraille(file, {
      onProgress: (percent) => setProgress(percent),
      onRecognized: (problem) => {
        setRecognizedProblem(problem);
        showToast("문제 인식이 완료되었습니다.");
      },
      onConverting: () => setStatus("converting"),
      onComplete: (files) => {
        setStatus("complete");
        setResultFiles(files);
        showToast("점역 결과 파일이 생성되었습니다.");
      },
    });

    cleanupRef.current = cleanup;
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
            <UserRound size={25} />내 정보
          </button>
        </nav>
      </header>

      <section className="workspace" aria-label="문서 점역 변환 작업 영역">
        <UploadPanel onUpload={handleUpload} fileName={fileName} />
        <PreviewPanel problem={recognizedProblem} status={status} />
        <aside className="result-panel" aria-label="변환 결과">
          <ConversionSteps status={status} progress={progress} />
          <ResultPanel
            status={status}
            resultFiles={resultFiles}
            onDownload={handleDownload}
            onDownloadAll={handleDownloadAll}
          />
        </aside>
      </section>

      {openModal ? (
        <Modal type={openModal} onClose={() => setOpenModal(null)} />
      ) : null}
      {toast ? <div className="toast">{toast}</div> : null}
    </main>
  );
}

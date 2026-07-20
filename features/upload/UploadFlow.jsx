"use client";

// 화면 1 · 문서 업로드 (UI_GUIDE "화면 1"). 드롭존(드래그&드롭 + 클릭 선택),
// 업로드 파일 리스트(선택 행 테두리 --sky), "변환 시작 →"로 convertDocument 호출 후
// store에 문서 저장·/proofread 이동.
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkflow } from "@/lib/store";
import { convertDocument } from "@/lib/services";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

function isAllowed(file) {
  return /\.(pdf|jpe?g|png)$/i.test(file.name);
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

function badge(name) {
  return /\.pdf$/i.test(name) ? "PDF" : "IMG";
}

export default function UploadFlow() {
  const router = useRouter();
  const { setDoc } = useWorkflow();
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]); // { key, name, size }
  const [selected, setSelected] = useState(0); // 선택 행 인덱스
  const [converting, setConverting] = useState(false);

  function addFiles(fileList) {
    const next = Array.from(fileList || []).filter(isAllowed);
    if (next.length === 0) return;
    setFiles((prev) => {
      const merged = [
        ...prev,
        ...next.map((f) => ({
          key: `${f.name}-${f.size}-${f.lastModified}`,
          name: f.name,
          size: f.size,
        })),
      ];
      setSelected(merged.length - 1); // 새로 추가한 파일 선택
      return merged;
    });
  }

  function openPicker() {
    inputRef.current?.click();
  }

  function onDropzoneKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  }

  async function startConvert() {
    if (files.length === 0 || converting) return;
    setConverting(true);
    try {
      const doc = await convertDocument(files[selected]);
      setDoc(doc);
      router.push("/proofread");
    } catch {
      setConverting(false);
    }
  }

  return (
    <div className="upload-wrap">
      <h1 className="page">학습자료 업로드</h1>
      <p className="page-sub">
        점역이 필요한 학습자료를 올려주세요!
        <br />
        바로점자는 한국어와 수식에 특화된 AI 모델로, 수학 문제도 정확하게 점역해
        드려요!
      </p>

      <div
        className="dropzone"
        role="button"
        tabIndex={0}
        aria-label="파일 업로드 영역, 클릭 또는 파일을 끌어다 놓으세요"
        onClick={openPicker}
        onKeyDown={onDropzoneKeyDown}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
      >
        <div className="big">파일 업로드</div>
        <div className="formats">지원 형식: PDF, JPG, PNG (최대 50MB)</div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        aria-hidden="true"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {files.length > 0 && (
        <div className="filelist">
          {files.map((f, i) => (
            <button
              key={f.key}
              type="button"
              className={`file-row${i === selected ? " selected" : ""}`}
              aria-pressed={i === selected}
              aria-label={`${f.name}, ${formatSize(f.size)}`}
              onClick={() => setSelected(i)}
            >
              <span className="file-ico">{badge(f.name)}</span>
              <span className="file-meta">
                <span className="file-name">{f.name}</span>
                <br />
                <span className="file-sub">{formatSize(f.size)}</span>
              </span>
              <span className="file-state">업로드 완료</span>
            </button>
          ))}
        </div>
      )}

      <div className="upload-actions">
        <button
          type="button"
          className="btn primary"
          disabled={files.length === 0 || converting}
          onClick={startConvert}
        >
          {converting ? "변환 중…" : "변환 시작 →"}
        </button>
      </div>
    </div>
  );
}

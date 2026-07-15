import { CheckCircle2, Download } from "lucide-react";
import "./ResultPanel.css";

/**
 * 변환 결과 다운로드 패널
 * @param {Object} props
 * @param {string} props.status - 현재 상태 ("idle" | "recognizing" | "converting" | "complete")
 * @param {Array} props.resultFiles - 결과 파일 배열 (mockFiles 형식)
 * @param {Function} props.onDownload - 개별 파일 다운로드 콜백 (file: object)
 * @param {Function} props.onDownloadAll - 전체 파일 다운로드 콜백
 */
export default function ResultPanel({
  status,
  resultFiles,
  onDownload,
  onDownloadAll,
}) {
  const hasResult = status === "complete";
  const displayedFiles = hasResult ? resultFiles : [];

  return (
    <section className={hasResult ? "complete-card" : "complete-card waiting"}>
      <div className="complete-message">
        <CheckCircle2
          size={54}
          fill={hasResult ? "#2bb673" : "#c8d1df"}
          stroke="#ffffff"
          strokeWidth={2.5}
        />
        <div>
          <h2>{hasResult ? "변환 완료" : "결과 대기 중"}</h2>
          <p>
            {hasResult
              ? "수학 문제의 점자 변환이 완료되었습니다."
              : "업로드 후 변환 결과가 생성됩니다."}
          </p>
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
            onClick={() =>
              onDownload({ label, ext, tone, icon: Icon, ...file })
            }
          >
            <Icon size={36} strokeWidth={1.8} />
            <strong>{label}</strong>
            <span>{ext}</span>
          </button>
        ))}
      </div>

      <button
        className="download-button"
        type="button"
        disabled={!hasResult}
        onClick={onDownloadAll}
      >
        <Download size={25} />
        결과 다운로드
      </button>
    </section>
  );
}

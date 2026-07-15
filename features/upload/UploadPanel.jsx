import { UploadCloud } from "lucide-react";
import "./UploadPanel.css";

/**
 * 파일 업로드 패널
 * @param {Object} props
 * @param {Function} props.onUpload - 파일 업로드 콜백 (file: File)
 * @param {string} [props.fileName] - 선택된 파일명 (선택적)
 */
export default function UploadPanel({ onUpload, fileName }) {
  function handleFiles(files) {
    const file = files?.[0];
    if (!file) {
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const allowed =
      /\.(pdf|jpg|jpeg|png)$/i.test(file.name) ||
      allowedTypes.includes(file.type);
    if (!allowed) {
      return;
    }

    onUpload(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }

  return (
    <section
      className="upload-panel"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      aria-label="파일 업로드"
    >
      <div className="upload-box">
        <UploadCloud size={64} strokeWidth={1.9} />
        <span className="upload-title">파일 업로드</span>
        <span className="upload-copy">
          업로드 가능한 파일 형식: <br /> pdf, docx, jpg
        </span>
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
  );
}

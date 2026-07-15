import { UploadCloud } from "lucide-react";
import { useToast } from "@/components/layout/ToastContext";

export default function FileUploadBox({ onUpload }) {
  const { showToast } = useToast();

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
      showToast("PDF, JPG, PNG 형식만 업로드 가능합니다.");
      return;
    }

    const maxSize = 200 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast("파일 크기는 200MB 이하여야 합니다.");
      return;
    }

    onUpload(file);
    showToast(`${file.name} 파일이 추가되었습니다.`);
  }

  function handleDrop(event) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div
      className="upload-box upload-box-compact"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <UploadCloud size={48} strokeWidth={1.9} />
      <p className="upload-title">파일을 드래그하거나 클릭하여 선택하세요</p>
      <input
        id="file-upload-input"
        className="upload-input"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        aria-label="파일 선택"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <p className="upload-copy">PDF, PNG, JPG (최대 200MB)</p>
    </div>
  );
}

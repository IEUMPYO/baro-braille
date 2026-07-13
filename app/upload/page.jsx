"use client";

import { useState } from "react";
import StepIndicator from "@/components/upload/StepIndicator";
import FileUploadBox from "@/components/upload/FileUploadBox";
import FileList from "@/components/upload/FileList";
import { useToast } from "@/components/layout/ToastContext";

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const { showToast } = useToast();

  function handleFileUpload(file) {
    const fileType = file.type.includes("pdf")
      ? "pdf"
      : file.type.includes("image")
        ? "image"
        : "pdf";

    const newFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: fileType,
      size: file.size,
      status: "uploaded",
    };

    setUploadedFiles((prev) => [...prev, newFile]);
    setSelectedFileId(newFile.id);
  }

  function handleStartConversion() {
    if (uploadedFiles.length === 0) {
      showToast("업로드된 파일이 없습니다.");
      return;
    }

    showToast("변환을 시작합니다. (Step 3에서 구현 예정)");
    setCurrentStep(2);
  }

  return (
    <div className="upload-workflow">
      <StepIndicator currentStep={currentStep} />

      <div className="workflow-content">
        <section className="workflow-section">
          <h2>1. 자료 업로드</h2>
          <FileUploadBox onUpload={handleFileUpload} />
          <FileList
            files={uploadedFiles}
            selectedId={selectedFileId}
            onSelect={setSelectedFileId}
          />
          <button
            className="btn-primary btn-large"
            onClick={handleStartConversion}
            disabled={uploadedFiles.length === 0}
          >
            변환 시작
          </button>
          <div className="upload-info">
            <p>업로드된 파일: {uploadedFiles.length}개</p>
            <button
              type="button"
              className="btn-text"
              onClick={() => setUploadedFiles([])}
            >
              사용량 관리
            </button>
          </div>
        </section>

        <section className="workflow-section">
          <h2>2. AI 분석 결과</h2>
          <p className="placeholder-text">Step 3에서 구현합니다.</p>
        </section>

        <section className="workflow-section">
          <h2>3. 검수 화면</h2>
          <p className="placeholder-text">Step 4에서 구현합니다.</p>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import StepIndicator from "@/components/upload/StepIndicator";
import FileUploadBox from "@/components/upload/FileUploadBox";
import FileList from "@/components/upload/FileList";
import ProblemPreview from "@/components/upload/ProblemPreview";
import FilterOptions from "@/components/upload/FilterOptions";
import GraphViewer from "@/components/upload/GraphViewer";
import { useToast } from "@/components/layout/ToastContext";
import { convertToBraille } from "@/lib/services";
import { FileText } from "lucide-react";

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recognizedProblem, setRecognizedProblem] = useState(null);
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

  async function handleStartConversion() {
    if (uploadedFiles.length === 0) {
      showToast("업로드된 파일이 없습니다.");
      return;
    }

    setIsConverting(true);
    setCurrentStep(2);
    setProgress(0);

    const selectedFile =
      uploadedFiles.find((f) => f.id === selectedFileId) || uploadedFiles[0];

    const cleanup = convertToBraille(selectedFile, {
      onProgress: (percent) => {
        setProgress(percent);
      },
      onRecognized: (problem) => {
        setRecognizedProblem(problem);
        showToast("문제 인식이 완료되었습니다.");
      },
      onConverting: () => {
        // Step 4에서 사용
      },
      onComplete: (files) => {
        setIsConverting(false);
        setCurrentStep(3);
        showToast("변환이 완료되었습니다.");
        // Step 4에서 결과 파일 저장
      },
    });

    // cleanup은 useEffect에서 관리 필요
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

        <section className="workflow-section analysis-section">
          <h2>2. AI 분석 결과</h2>

          {!recognizedProblem ? (
            <div className="empty-state">
              <FileText size={48} strokeWidth={1.5} />
              <p>변환을 시작하면 분석 결과가 표시됩니다.</p>
            </div>
          ) : (
            <>
              <div className="analysis-header">
                <span className="file-name">
                  {uploadedFiles.find((f) => f.id === selectedFileId)?.name ||
                    uploadedFiles[0]?.name ||
                    "2026 수능 수학.pdf"}
                </span>
                <span className="page-nav">1 / 4</span>
              </div>

              <ProblemPreview problem={recognizedProblem} />

              <FilterOptions />

              {recognizedProblem.graph && (
                <GraphViewer graph={recognizedProblem.graph} />
              )}
            </>
          )}
        </section>

        <section className="workflow-section">
          <h2>3. 검수 화면</h2>
          <p className="placeholder-text">Step 4에서 구현합니다.</p>
        </section>
      </div>
    </div>
  );
}

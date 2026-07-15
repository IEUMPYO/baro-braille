"use client";

import { useState, useEffect } from "react";
import StepIndicator from "@/features/upload/StepIndicator";
import FileUploadBox from "@/features/upload/FileUploadBox";
import FileList from "@/features/upload/FileList";
import ProblemPreview from "@/features/upload/ProblemPreview";
import FilterOptions from "@/features/upload/FilterOptions";
import GraphViewer from "@/features/upload/GraphViewer";
import OriginalTextPanel from "@/features/upload/OriginalTextPanel";
import BrailleInputPanel from "@/features/upload/BrailleInputPanel";
import ProblemNavigation from "@/features/upload/ProblemNavigation";
import { useToast } from "@/components/layout/ToastContext";
import { convertToBraille } from "@/lib/services";
import { mockProblems } from "@/lib/mockData";
import { FileText, CheckSquare, Check } from "lucide-react";

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recognizedProblem, setRecognizedProblem] = useState(null);
  const [resultFiles, setResultFiles] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [brailleText, setBrailleText] = useState("");
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
        setResultFiles(files);
        setIsConverting(false);
        setCurrentStep(3);
        // 첫 번째 문제의 점자 텍스트 표시
        if (mockProblems[0]?.braille) {
          setBrailleText(mockProblems[0].braille);
        }
        showToast("변환이 완료되었습니다.");
      },
    });

    // cleanup은 useEffect에서 관리 필요
  }

  function handleTempSave() {
    // Mock: 토스트만 표시
    showToast("임시 저장되었습니다.");
  }

  function handleComplete() {
    // 선택된 파일의 상태를 completed로 변경
    setUploadedFiles((files) =>
      files.map((f) =>
        f.id === selectedFileId ? { ...f, status: "completed" } : f,
      ),
    );
    showToast("변환이 완료되었습니다.");
  }

  function handleProblemNavigate(index) {
    setCurrentProblemIndex(index);
    // 문제 전환 시 점자 텍스트 업데이트
    if (mockProblems[index]?.braille) {
      setBrailleText(mockProblems[index].braille);
    }
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

        <section className="workflow-section review-section">
          <h2>3. 검수 화면</h2>

          {currentStep < 3 ? (
            <div className="empty-state">
              <CheckSquare size={48} strokeWidth={1.5} />
              <p>변환이 완료되면 검수 화면이 표시됩니다.</p>
            </div>
          ) : (
            <>
              <div className="review-panels">
                <OriginalTextPanel
                  problem={mockProblems[currentProblemIndex]}
                />
                <BrailleInputPanel
                  brailleText={brailleText}
                  onTextChange={setBrailleText}
                />
              </div>

              <ProblemNavigation
                currentIndex={currentProblemIndex}
                total={mockProblems.length}
                onNavigate={handleProblemNavigate}
              />

              <div className="review-actions">
                <button className="btn-secondary" onClick={handleTempSave}>
                  임시 저장
                </button>
                <button className="btn-primary" onClick={handleComplete}>
                  <Check size={18} />
                  변환 완료
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

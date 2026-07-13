# Step 2: upload-basic

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- `/docs/UI_GUIDE.md`
- `/CLAUDE.md`
- `/demo_v2.jpeg` (새 디자인 레퍼런스)
- `/components/layout/Sidebar.jsx` (Step 0)
- `/components/layout/Header.jsx` (Step 0)
- `/app/upload/page.jsx` (Step 1)
- `/components/upload/UploadPanel.jsx` (기존)

기존 UploadPanel 컴포넌트를 재사용하여, 다중 파일 업로드 및 목록 관리 기능을 구현하는 작업이다.

## 작업

### 1. 업로드 페이지 기본 구조 (`app/upload/page.jsx`)

demo_v2.jpeg의 3단계 워크플로우 레이아웃을 구현한다:

**레이아웃:**

```
┌─────────────────────────────────────────────────────────┐
│  1. 자료 업로드  │  2. AI 분석 결과  │  3. 검수 화면   │
│                 │                  │                   │
│  [업로드 박스]   │  (Step 3 구현)    │  (Step 4 구현)  │
│  [파일 목록]     │                  │                   │
│  [변환 시작]     │                  │                   │
└─────────────────────────────────────────────────────────┘
```

**컴포넌트 구조:**

```javascript
"use client";

import { useState } from "react";
import StepIndicator from "@/components/upload/StepIndicator";
import FileUploadBox from "@/components/upload/FileUploadBox";
import FileList from "@/components/upload/FileList";

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  function handleFileUpload(file) {
    // 파일 검증 및 uploadedFiles 배열에 추가
    // id는 timestamp 또는 uuid 사용
  }

  function handleStartConversion() {
    // 변환 시작 로직 (Mock)
    // currentStep을 2로 변경
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
```

### 2. 다중 파일 상태 관리

**상태 구조:**

```javascript
const [uploadedFiles, setUploadedFiles] = useState([
  // {
  //   id: "unique-id",
  //   name: "파일명.pdf",
  //   type: "pdf" | "image",
  //   size: 1024000,
  //   status: "uploaded" | "processing" | "completed"
  // }
]);
```

### 3. StepIndicator 컴포넌트 생성 (`components/upload/StepIndicator.jsx`)

3단계 진행 상황을 시각적으로 표시한다:

```javascript
export default function StepIndicator({ currentStep }) {
  const steps = ["자료 업로드", "AI 분석 결과", "검수 화면"];

  return (
    <div className="step-indicator">
      {steps.map((label, index) => (
        <div
          key={index}
          className={`step ${index + 1 <= currentStep ? "active" : ""}`}
        >
          <span className="step-number">{index + 1}</span>
          <span className="step-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
```

### 4. FileUploadBox 컴포넌트 (`components/upload/FileUploadBox.jsx`)

기존 UploadPanel을 참고하여 파일 업로드 박스를 구현한다:

**요구사항:**

- 드래그 앤 드롭 지원
- 파일 선택 버튼
- 파일 타입 검증 (PDF, JPG, PNG)
- 업로드 시 onUpload 콜백 호출

```javascript
import { UploadCloud } from "lucide-react";

export default function FileUploadBox({ onUpload }) {
  // 드래그 앤 드롭 핸들러
  // 파일 선택 핸들러
  // 파일 검증 로직

  return (
    <div className="upload-box">
      <UploadCloud size={64} />
      <p>파일을 드래그하거나 클릭하여 선택하세요</p>
      <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
    </div>
  );
}
```

### 5. FileList 컴포넌트 (`components/upload/FileList.jsx`)

업로드된 파일 목록을 카드 형식으로 표시한다:

**요구사항:**

- 파일 아이콘 (FileText for PDF, Image for images)
- 파일명 + 크기
- 상태 표시 (체크마크, 진행 중 등)
- 클릭 시 선택 (active 스타일)

```javascript
import { FileText, Image, CheckCircle } from "lucide-react";

export default function FileList({ files, selectedId, onSelect }) {
  function formatFileSize(bytes) {
    // KB, MB 단위로 변환
  }

  return (
    <div className="file-list">
      {files.map((file) => (
        <div
          key={file.id}
          className={`file-item ${selectedId === file.id ? "active" : ""}`}
          onClick={() => onSelect(file.id)}
        >
          <FileIcon type={file.type} />
          <div className="file-info">
            <h4>{file.name}</h4>
            <p>{formatFileSize(file.size)}</p>
          </div>
          {file.status === "completed" && <CheckCircle size={20} />}
        </div>
      ))}
    </div>
  );
}

function FileIcon({ type }) {
  return type === "pdf" ? <FileText size={24} /> : <Image size={24} />;
}
```

### 6. Toast 전역화

기존 toast 기능을 LayoutClient로 이동하여 모든 페이지에서 사용 가능하도록 한다:

**방법 1: Context API (권장)**

```javascript
// components/layout/ToastContext.jsx
"use client";

import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
```

LayoutClient에서 ToastProvider로 감싸고, 각 페이지에서 `useToast()` 훅 사용.

### 7. CSS 스타일 추가 (`app/globals.css`)

workflow 관련 기본 스타일 추가:

```css
.upload-workflow {
  padding: 40px;
}

.workflow-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 24px;
}

.workflow-section {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 24px;
  min-height: 600px;
}

.workflow-section h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 20px;
}

.placeholder-text {
  color: var(--muted);
  font-size: 14px;
  text-align: center;
  padding: 40px 20px;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 20px 0;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0.4;
}

.step.active {
  opacity: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--blue);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
}

.step-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease;
}

.file-item:hover {
  background: var(--blue-soft);
  border-color: var(--blue);
}

.file-item.active {
  background: var(--blue-soft);
  border-color: var(--blue);
}

.file-info h4 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.file-info p {
  font-size: 13px;
  color: var(--muted);
  margin: 0;
}

.btn-large {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  margin-top: 20px;
}

@media (max-width: 1020px) {
  .workflow-content {
    grid-template-columns: 1fr;
  }
}
```

기존 UploadPanel.css의 스타일을 재사용하여 FileUploadBox 스타일 작성.

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm run dev     # 로컬 실행 확인
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 브라우저에서 `/upload` 페이지 확인:
   - 3단계 레이아웃이 표시되는가?
   - StepIndicator가 표시되고 Step 1이 활성화되어 있는가?
   - 파일 업로드 박스가 동작하는가? (드래그 앤 드롭, 파일 선택)
   - 업로드된 파일이 목록에 표시되는가?
   - 파일 목록 아이템을 클릭하면 선택 상태가 변경되는가?
   - "변환 시작" 버튼이 표시되는가?
   - 파일이 없을 때 버튼이 비활성화되는가?
3. 아키텍처 체크리스트:
   - components/upload/ 디렉토리 구조가 Feature-based 패턴을 따르는가?
   - UI_GUIDE.md의 디자인 규칙을 따르는가?
   - Toast가 전역화되어 있는가?
4. 결과에 따라 `phases/ui-redesign-v2/index.json`의 step 2를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "업로드 기본 구조 완성, StepIndicator, FileUploadBox, FileList 컴포넌트 생성, Toast 전역화"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 실제 서버에 파일을 업로드하지 마라. 이유: 정적 사이트, 파일은 클라이언트 메모리에만 저장
- AI 분석 결과를 이 step에서 구현하지 마라. 이유: Step 3에서 구현 예정
- 검수 화면을 이 step에서 구현하지 마라. 이유: Step 4에서 구현 예정
- lib/services.js를 수정하지 마라. 이유: Step 3에서 변환 로직 연결 예정
- 기존 컴포넌트(PreviewPanel, ConversionSteps 등)를 수정하지 마라. 이유: Step 3, 4에서 재사용 예정
- UI_GUIDE.md의 "AI 슬롭 안티패턴"을 사용하지 마라 (backdrop-filter blur, gradient-text 등)

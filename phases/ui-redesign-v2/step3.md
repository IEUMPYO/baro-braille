# Step 3: analysis-section

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/docs/UI_GUIDE.md`
- `/CLAUDE.md`
- `/demo_v2.jpeg`
- `/app/upload/page.jsx` (Step 2에서 작성)
- `/components/upload/StepIndicator.jsx` (Step 2에서 생성)
- `/components/preview/PreviewPanel.jsx` (기존)
- `/lib/services.js` (기존 Mock 로직)
- `/lib/mockData.js` (기존 Mock 데이터)

Step 2에서 만든 업로드 기본 구조에 AI 분석 결과 섹션을 추가하는 작업이다. 기존 PreviewPanel을 재사용하되, demo_v2.jpeg의 레이아웃에 맞게 조정한다.

## 작업

### 1. 변환 로직 연결 (`app/upload/page.jsx`)

Step 2에서 만든 "변환 시작" 버튼에 실제 변환 로직을 연결한다:

**추가할 상태:**

```javascript
const [isConverting, setIsConverting] = useState(false);
const [progress, setProgress] = useState(0);
const [recognizedProblem, setRecognizedProblem] = useState(null);
```

**handleStartConversion 수정:**

```javascript
import { convertToBraille } from "@/lib/services";

async function handleStartConversion() {
  if (uploadedFiles.length === 0) return;

  setIsConverting(true);
  setCurrentStep(2);

  const selectedFile =
    uploadedFiles.find((f) => f.id === selectedFileId) || uploadedFiles[0];

  const cleanup = convertToBraille(selectedFile, {
    onProgress: (percent) => {
      setProgress(percent);
    },
    onRecognized: (problem) => {
      setRecognizedProblem(problem);
    },
    onConverting: () => {
      // Step 4에서 사용
    },
    onComplete: (files) => {
      setIsConverting(false);
      setCurrentStep(3);
      // Step 4에서 결과 파일 저장
    },
  });

  // cleanup은 컴포넌트 언마운트 시 사용 (useEffect로 관리)
}
```

### 2. AI 분석 결과 섹션 구현

"2. AI 분석 결과" 섹션의 placeholder를 실제 UI로 교체한다:

**구조:**

```javascript
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
        <span className="file-name">{selectedFile.name}</span>
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
```

### 3. ProblemPreview 컴포넌트 (`components/upload/ProblemPreview.jsx`)

기존 PreviewPanel의 문제 표시 부분을 재사용하되, 새 레이아웃에 맞게 조정한다:

```javascript
export default function ProblemPreview({ problem }) {
  return (
    <div className="problem-preview">
      <div className="problem-text">{problem.text}</div>

      {problem.choices && (
        <div className="problem-choices">
          {problem.choices.map((choice, index) => (
            <div key={index} className="choice-item">
              <span className="choice-number">{index + 1}</span>
              <span className="choice-text">{choice}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**스타일:** 기존 PreviewPanel.css의 문제 표시 스타일 참고.

### 4. FilterOptions 컴포넌트 (`components/upload/FilterOptions.jsx`)

demo_v2.jpeg의 필터 옵션 체크박스 그룹을 구현한다:

```javascript
import { useState } from "react";

export default function FilterOptions() {
  const [filters, setFilters] = useState({
    problem: true,
    choices: true,
    additional: false,
    graph: true,
  });

  function handleToggle(key) {
    setFilters({ ...filters, [key]: !filters[key] });
    // Mock: 체크/해제만 가능, 실제 필터링 안 함
  }

  return (
    <div className="filter-options">
      <h3>표시 항목</h3>
      <div className="filter-group">
        <label className="filter-item">
          <input
            type="checkbox"
            checked={filters.problem}
            onChange={() => handleToggle("problem")}
          />
          <span>문제</span>
        </label>
        <label className="filter-item">
          <input
            type="checkbox"
            checked={filters.choices}
            onChange={() => handleToggle("choices")}
          />
          <span>선택지</span>
        </label>
        <label className="filter-item">
          <input
            type="checkbox"
            checked={filters.additional}
            onChange={() => handleToggle("additional")}
          />
          <span>추가</span>
        </label>
        <label className="filter-item">
          <input
            type="checkbox"
            checked={filters.graph}
            onChange={() => handleToggle("graph")}
          />
          <span>도형/그래프</span>
        </label>
      </div>
    </div>
  );
}
```

### 5. GraphViewer 컴포넌트 (`components/upload/GraphViewer.jsx`)

그래프 이미지를 표시하고 줌 컨트롤을 제공한다:

```javascript
import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export default function GraphViewer({ graph }) {
  const [zoom, setZoom] = useState(100);

  function handleZoomIn() {
    setZoom(Math.min(zoom + 25, 200));
  }

  function handleZoomOut() {
    setZoom(Math.max(zoom - 25, 50));
  }

  function handleReset() {
    setZoom(100);
  }

  return (
    <div className="graph-viewer">
      <h3>그래프</h3>
      <div className="graph-container">
        {typeof graph === "string" ? (
          <img src={graph} alt="그래프" style={{ width: `${zoom}%` }} />
        ) : (
          // SVG 렌더링 (기존 PreviewPanel 참고)
          <div style={{ transform: `scale(${zoom / 100})` }}>{graph}</div>
        )}
      </div>
      <div className="graph-controls">
        <button onClick={handleZoomOut} aria-label="축소">
          <ZoomOut size={18} />
        </button>
        <span>{zoom}%</span>
        <button onClick={handleZoomIn} aria-label="확대">
          <ZoomIn size={18} />
        </button>
        <button onClick={handleReset} aria-label="원본 크기">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
```

### 6. Mock 데이터 확장 (`lib/mockData.js`)

기존 mockProblem을 확장하여 여러 문제를 관리한다:

```javascript
export const mockProblems = [
  {
    id: 1,
    text: "함수 f(x) = x² - 2x + 3의 최솟값을 구하시오.",
    choices: ["1", "2", "3", "4", "5"],
    graph: null, // SVG 또는 이미지 URL
  },
  {
    id: 2,
    text: "다음 그래프는 함수 y = f(x)의 그래프이다. f(2)의 값을 구하시오.",
    choices: ["-2", "-1", "0", "1", "2"],
    graph: mockGraphSvg, // 기존 SVG 재사용
  },
  // 5개 정도 추가
];

// 기존 mockProblem을 mockProblems[0]으로 대체
export const mockProblem = mockProblems[0];
```

### 7. CSS 스타일 추가 (`app/globals.css`)

분석 섹션 관련 스타일:

```css
.analysis-section {
  overflow-y: auto;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}

.file-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.page-nav {
  font-size: 13px;
  color: var(--muted);
}

.problem-preview {
  background: #fafbfc;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.problem-text {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text);
  margin-bottom: 16px;
}

.problem-choices {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choice-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.choice-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--blue-soft);
  color: var(--blue);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}

.choice-text {
  font-size: 15px;
  color: var(--text);
}

.filter-options {
  margin-bottom: 20px;
}

.filter-options h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}

.filter-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text);
  cursor: pointer;
}

.filter-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.graph-viewer {
  margin-top: 20px;
}

.graph-viewer h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}

.graph-container {
  background: #fafbfc;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  overflow: auto;
}

.graph-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}

.graph-controls button {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
}

.graph-controls button:hover {
  background: var(--blue-soft);
  border-color: var(--blue);
}

.graph-controls span {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  min-width: 50px;
  text-align: center;
}
```

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm run dev     # 로컬 실행 확인
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 브라우저에서 `/upload` 페이지 확인:
   - 파일을 업로드하고 "변환 시작" 버튼을 클릭했는가?
   - StepIndicator가 Step 2로 변경되는가?
   - AI 분석 결과 섹션에 문제 텍스트가 표시되는가?
   - 필터 옵션 체크박스가 동작하는가?
   - 그래프가 있는 문제의 경우 그래프가 표시되는가?
   - 줌 컨트롤 (+, -, 원본)이 동작하는가?
3. 아키텍처 체크리스트:
   - 기존 컴포넌트를 재사용하는가?
   - UI_GUIDE.md의 디자인 규칙을 따르는가?
   - Mock 데이터만 사용하는가?
4. 결과에 따라 `phases/ui-redesign-v2/index.json`의 step 3을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "AI 분석 결과 섹션 완성, ProblemPreview, FilterOptions, GraphViewer 컴포넌트 생성"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 실제 OCR/AI API를 호출하지 마라. 이유: ADR-001, Mock 데이터만 사용
- 필터 옵션으로 실제 필터링을 구현하지 마라. 이유: Mock UI, 체크/해제만 동작
- 검수 화면을 이 step에서 구현하지 마라. 이유: Step 4에서 구현 예정
- 페이지 네비게이션 (1 / 4)을 실제로 동작시키지 마라. 이유: 단순 표시만, Step 4에서 구현
- UI_GUIDE.md의 "AI 슬롭 안티패턴"을 사용하지 마라

# Step 4: review-section

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/docs/UI_GUIDE.md`
- `/CLAUDE.md`
- `/demo_v2.jpeg`
- `/app/upload/page.jsx` (Step 2, 3에서 작성)
- `/components/upload/StepIndicator.jsx` (Step 2)
- `/components/upload/ProblemPreview.jsx` (Step 3)
- `/lib/mockData.js` (Step 3에서 확장)

Step 3에서 만든 AI 분석 결과 섹션에 이어서, 검수 화면 섹션을 구현하는 작업이다. 원본 텍스트와 점자 입력을 나란히 표시하고, 점자 키보드 UI를 제공한다.

## 작업

### 1. 변환 완료 처리 (`app/upload/page.jsx`)

Step 3의 convertToBraille 콜백에서 변환 완료 처리를 추가한다:

**추가할 상태:**

```javascript
const [resultFiles, setResultFiles] = useState([]);
const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
const [brailleText, setBrailleText] = useState("");
```

**onComplete 콜백 수정:**

```javascript
onComplete: (files) => {
  setResultFiles(files);
  setIsConverting(false);
  setCurrentStep(3);
  // 첫 번째 문제의 점자 텍스트 표시
  if (mockProblems[0]?.braille) {
    setBrailleText(mockProblems[0].braille);
  }
};
```

### 2. 검수 화면 섹션 구현

"3. 검수 화면" 섹션의 placeholder를 실제 UI로 교체한다:

**구조:**

```javascript
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
        <OriginalTextPanel problem={mockProblems[currentProblemIndex]} />
        <BrailleInputPanel
          brailleText={brailleText}
          onTextChange={setBrailleText}
        />
      </div>

      <ProblemNavigation
        currentIndex={currentProblemIndex}
        total={mockProblems.length}
        onNavigate={setCurrentProblemIndex}
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
```

### 3. OriginalTextPanel 컴포넌트 (`components/upload/OriginalTextPanel.jsx`)

원본 문제 텍스트를 표시한다:

```javascript
export default function OriginalTextPanel({ problem }) {
  return (
    <div className="text-panel">
      <div className="panel-header">
        <h3>원본 텍스트 (문항)</h3>
        <span className="page-indicator">1 / 4</span>
      </div>
      <div className="panel-content">
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
      <div className="panel-footer">
        <button className="btn-text">저장</button>
      </div>
    </div>
  );
}
```

### 4. BrailleInputPanel 컴포넌트 (`components/upload/BrailleInputPanel.jsx`)

점자 텍스트와 점자 키보드를 표시한다:

```javascript
import { Circle } from "lucide-react";

export default function BrailleInputPanel({ brailleText, onTextChange }) {
  function handleKeyClick(key) {
    // Mock: 토스트 메시지만 표시
    console.log("Braille key clicked:", key);
  }

  return (
    <div className="text-panel">
      <div className="panel-header">
        <h3>점자 입력</h3>
      </div>
      <div className="panel-content">
        <div className="braille-display">
          {brailleText || "점자 텍스트 없음"}
        </div>
      </div>
      <div className="panel-footer">
        <BrailleKeyboard onKeyClick={handleKeyClick} />
      </div>
    </div>
  );
}

function BrailleKeyboard({ onKeyClick }) {
  const keys = ["⠁", "⠃", "⠉", "⠙", "⠑", "⠋", "⠛", "⠓"];

  return (
    <div className="braille-keyboard">
      {keys.map((key, index) => (
        <button
          key={index}
          className="braille-key"
          onClick={() => onKeyClick(key)}
          aria-label={`점자 키 ${key}`}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
```

### 5. ProblemNavigation 컴포넌트 (`components/upload/ProblemNavigation.jsx`)

문제 번호 목록을 표시하고 클릭 시 해당 문제로 전환한다:

```javascript
export default function ProblemNavigation({ currentIndex, total, onNavigate }) {
  return (
    <div className="problem-navigation">
      <h4>문제 목록</h4>
      <div className="problem-list">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            className={`problem-item ${i === currentIndex ? "active" : ""}`}
            onClick={() => onNavigate(i)}
          >
            #{i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 6. 액션 핸들러 추가 (`app/upload/page.jsx`)

임시 저장 및 변환 완료 버튼 핸들러:

```javascript
import { useToast } from "@/components/layout/ToastContext";

const { showToast } = useToast();

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
```

### 7. Mock 데이터 확장 (`lib/mockData.js`)

각 문제에 점자 텍스트 추가:

```javascript
export const mockProblems = [
  {
    id: 1,
    text: "함수 f(x) = x² - 2x + 3의 최솟값을 구하시오.",
    choices: ["1", "2", "3", "4", "5"],
    graph: null,
    braille: "⠋⠥⠝⠉⠞⠊⠕⠝ ⠋⠷⠭⠾ ⠿ ⠭⠔⠃ ⠤ ⠃⠭ ⠐⠬ ⠉",
  },
  {
    id: 2,
    text: "다음 그래프는 함수 y = f(x)의 그래프이다. f(2)의 값을 구하시오.",
    choices: ["-2", "-1", "0", "1", "2"],
    graph: mockGraphSvg,
    braille: "⠛⠗⠁⠏⠓ ⠕⠋ ⠽ ⠿ ⠋⠷⠭⠾",
  },
  {
    id: 3,
    text: "등차수열 {aₙ}에서 a₁ = 3, d = 2일 때, a₁₀의 값을 구하시오.",
    choices: ["19", "20", "21", "22", "23"],
    graph: null,
    braille: "⠁⠗⠊⠞⠓⠍⠑⠞⠊⠉ ⠎⠑⠟⠥⠑⠝⠉⠑",
  },
  {
    id: 4,
    text: "∫₀² (x² + 1) dx의 값을 구하시오.",
    choices: ["8/3", "10/3", "12/3", "14/3", "16/3"],
    graph: null,
    braille: "⠊⠝⠞⠑⠛⠗⠁⠇ ⠷⠭⠔⠃ ⠐⠬ ⠂⠁⠾ ⠙⠭",
  },
  {
    id: 5,
    text: "lim(x→0) (sin x) / x의 값을 구하시오.",
    choices: ["0", "1/2", "1", "2", "∞"],
    graph: null,
    braille: "⠇⠊⠍⠊⠞ ⠎⠊⠝⠷⠭⠾ ⠌ ⠭",
  },
];
```

### 8. CSS 스타일 추가 (`app/globals.css`)

검수 화면 관련 스타일:

```css
.review-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-panels {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.text-panel {
  background: #fafbfc;
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--panel);
  border-bottom: 1px solid var(--line);
}

.panel-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.page-indicator {
  font-size: 13px;
  color: var(--muted);
}

.panel-content {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: flex-end;
}

.braille-display {
  font-family: "Braille", monospace;
  font-size: 24px;
  line-height: 1.8;
  color: var(--text);
  word-break: break-all;
  white-space: pre-wrap;
}

.braille-keyboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.braille-key {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(145deg, #7c3aed, #6d28d9);
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
}

.braille-key:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
}

.braille-key:active {
  transform: scale(0.95);
}

.problem-navigation {
  margin-top: 16px;
}

.problem-navigation h4 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}

.problem-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.problem-item {
  padding: 8px 16px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--panel);
  color: var(--text);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 150ms ease;
}

.problem-item:hover {
  background: var(--blue-soft);
  border-color: var(--blue);
}

.problem-item.active {
  background: var(--blue);
  color: #ffffff;
  border-color: var(--blue);
}

.review-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-secondary {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-secondary:hover {
  background: var(--blue-soft);
  border-color: var(--blue);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
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
   - 파일 업로드 → 변환 시작 → AI 분석 후 검수 화면으로 전환되는가?
   - StepIndicator가 Step 3으로 변경되는가?
   - 원본 텍스트와 점자 입력이 나란히 표시되는가?
   - 점자 키보드 버튼이 표시되는가?
   - 문제 목록 (#1, #2, ..., #5)이 표시되는가?
   - 문제 번호를 클릭하면 해당 문제로 전환되는가?
   - "임시 저장" 버튼 클릭 시 토스트가 표시되는가?
   - "변환 완료" 버튼 클릭 시 파일 상태가 completed로 변경되는가?
3. 아키텍처 체크리스트:
   - components/upload/ 디렉토리에 컴포넌트가 정리되어 있는가?
   - UI_GUIDE.md의 디자인 규칙을 따르는가?
   - Mock 데이터만 사용하는가?
4. 결과에 따라 `phases/ui-redesign-v2/index.json`의 step 4를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "검수 화면 섹션 완성, OriginalTextPanel, BrailleInputPanel, ProblemNavigation 컴포넌트 생성, 3단계 워크플로우 완료"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 점자 편집 기능을 실제로 구현하지 마라. 이유: Mock UI, 표시만 가능
- 점자 키보드 클릭 시 텍스트에 추가하는 로직을 구현하지 마라. 이유: Mock으로만 동작 (console.log)
- 실제로 파일을 저장하지 마라. 이유: 정적 사이트, 상태만 변경
- "저장" 버튼을 복잡하게 구현하지 마라. 이유: 토스트만 표시
- 페이지 네비게이션 (1 / 4)을 실제로 동작시키지 마라. 이유: Mock 표시만
- UI_GUIDE.md의 "AI 슬롭 안티패턴"을 사용하지 마라

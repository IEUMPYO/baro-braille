# Step 2: preview-component

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/docs/UI_GUIDE.md`
- `/CLAUDE.md`
- `/app/page.jsx` (현재 monolithic 구조)
- `/app/globals.css` (스타일 참고)
- `/lib/mockData.js` (이전 step에서 생성)
- `/components/upload/UploadPanel.jsx` (이전 step에서 생성)
- `/components/upload/UploadPanel.css` (이전 step에서 생성)

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

문제 미리보기 도메인을 독립된 컴포넌트로 분리한다.

### 1. components/preview/PreviewPanel.jsx 생성

**컴포넌트 시그니처**:

```javascript
/**
 * 인식된 문제 미리보기 패널
 * @param {Object} props
 * @param {Object|null} props.problem - 인식된 문제 객체 (mockProblem 형식)
 * @param {string} props.status - 현재 상태 ("idle" | "recognizing" | "converting" | "complete")
 */
export default function PreviewPanel({ problem, status }) {
  // 구현
}
```

**포함할 컴포넌트**:

- PreviewPanel (메인 래퍼)
- MathPreview (내부 컴포넌트, export 불필요)

**app/page.jsx 참조 범위**:

- 108~174번째 줄: MathPreview 컴포넌트
- 417~423번째 줄: PreviewPanel JSX 마크업

**기능**:

- 문제 없을 때: 빈 상태 표시 (UploadCloud 아이콘)
- 문제 있을 때: 수학 문제 텍스트 + SVG 그래프 + 객관식 보기
- 상태 pill 표시 (대기/진행 중/완료)

**주의사항**:

- MathPreview는 PreviewPanel.jsx 내부에 정의한다 (export 불필요)
- SVG 그래프는 app/page.jsx에서 그대로 복사한다
- lucide-react의 UploadCloud 아이콘 import 필요

### 2. components/preview/PreviewPanel.css 생성

app/globals.css에서 preview 관련 스타일을 추출한다:

- `.preview-panel`
- `.panel-heading`
- `.status-pill` (및 상태별 클래스: `.idle`, `.recognizing`, `.converting`, `.complete`)
- `.preview-empty`
- `.math-paper`
- `.question-line`
- `.indent`
- `.score`
- `.graph`
- `.graph-text`
- `.graph-label`
- `.answers`

**CSS 변수 사용**:

- globals.css의 CSS 변수를 참조한다
- 변수를 복사하지 않는다

### 3. PreviewPanel.jsx에서 CSS import

```javascript
import "./PreviewPanel.css";
```

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - components/preview/ 디렉토리가 생성되었는가?
   - PreviewPanel.jsx가 props 기반으로 독립적으로 동작하는가?
   - MathPreview가 내부 컴포넌트로 정의되었는가?
   - SVG 그래프가 정확히 복사되었는가?
   - PreviewPanel.css에 도메인 스타일만 분리되었는가?
3. 결과에 따라 `phases/refactor-architecture/index.json`의 해당 step을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "PreviewPanel 컴포넌트 분리 완료"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- app/page.jsx를 수정하지 마라. 이 step에서는 components/preview/ 파일만 생성한다.
- 새로운 기능을 추가하지 마라. 기존 로직을 그대로 옮긴다.
- globals.css에서 preview와 무관한 스타일을 가져오지 마라.
- MathPreview를 별도 파일로 분리하지 마라. PreviewPanel.jsx 내부에 둔다.

# Step 4: result-component

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/docs/UI_GUIDE.md`
- `/CLAUDE.md`
- `/app/page.jsx` (현재 monolithic 구조)
- `/app/globals.css` (스타일 참고)
- `/lib/mockData.js` (이전 step에서 생성)
- `/lib/utils.js` (이전 step에서 생성)
- `/components/upload/UploadPanel.jsx` (이전 step에서 생성)
- `/components/preview/PreviewPanel.jsx` (이전 step에서 생성)
- `/components/conversion/ConversionSteps.jsx` (이전 step에서 생성)

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

결과 다운로드 도메인을 독립된 컴포넌트로 분리한다.

### 1. components/result/ResultPanel.jsx 생성

**컴포넌트 시그니처**:

```javascript
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
  // 구현
}
```

**app/page.jsx 참조 범위**:

- 445~478번째 줄: ResultPanel JSX 마크업 (complete-card 부분)

**기능**:

- 변환 완료 메시지 표시
- 파일 그리드 (BRF, 전자점자, PDF)
- 개별 파일 다운로드 버튼
- 전체 다운로드 버튼
- 상태에 따른 UI 변경 (대기 중/완료)

**주의사항**:

- downloadFile 함수는 lib/utils.js에서 import한다
- 다운로드 로직은 부모 컴포넌트(app/page.jsx)에서 처리하므로, 이 컴포넌트는 onDownload/onDownloadAll props만 호출한다
- lucide-react 아이콘: CheckCircle2, Download
- 파일 카드의 아이콘은 각 파일 객체의 icon 속성에서 가져온다

**내부 구조**:

- 완료 메시지 섹션
- 파일 그리드 (file-card 3개)
- 결과 다운로드 버튼

### 2. components/result/ResultPanel.css 생성

app/globals.css에서 result 관련 스타일을 추출한다:

- `.result-panel`
- `.complete-card`
- `.complete-card.waiting`
- `.complete-message`
- `.divider`
- `.file-grid`
- `.file-card` (및 톤별 클래스: `.mint`, `.violet`, `.rose`)
- `.download-button`

**CSS 변수 사용**:

- globals.css의 CSS 변수를 참조한다
- 변수를 복사하지 않는다

### 3. ResultPanel.jsx에서 CSS import

```javascript
import "./ResultPanel.css";
```

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - components/result/ 디렉토리가 생성되었는가?
   - ResultPanel.jsx가 props 기반으로 독립적으로 동작하는가?
   - downloadFile 함수를 lib/utils.js에서 import하는가?
   - ResultPanel.css에 도메인 스타일만 분리되었는가?
3. 결과에 따라 `phases/refactor-architecture/index.json`의 해당 step을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "ResultPanel 컴포넌트 분리 완료"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- app/page.jsx를 수정하지 마라. 이 step에서는 components/result/ 파일만 생성한다.
- 새로운 기능을 추가하지 마라. 기존 로직을 그대로 옮긴다.
- globals.css에서 result와 무관한 스타일을 가져오지 마라.
- downloadFile 로직을 복사하지 마라. lib/utils.js에서 import한다.

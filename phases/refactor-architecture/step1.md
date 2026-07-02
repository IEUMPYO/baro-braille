# Step 1: upload-component

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/docs/UI_GUIDE.md`
- `/CLAUDE.md`
- `/app/page.jsx` (현재 monolithic 구조)
- `/app/globals.css` (스타일 참고)
- `/lib/mockData.js` (이전 step에서 생성)
- `/lib/services.js` (이전 step에서 생성)

이전 step에서 만들어진 lib/ 파일들을 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

파일 업로드 도메인을 독립된 컴포넌트로 분리한다.

### 1. components/upload/UploadPanel.jsx 생성

**컴포넌트 시그니처**:

```javascript
/**
 * 파일 업로드 패널
 * @param {Object} props
 * @param {Function} props.onUpload - 파일 업로드 콜백 (file: File)
 * @param {string} [props.fileName] - 선택된 파일명 (선택적)
 */
export default function UploadPanel({ onUpload, fileName }) {
  // 구현
}
```

**포함할 기능**:

- 파일 선택 input
- Drag & drop 지원
- 파일 유효성 검사 (PDF, JPG, PNG)
- 선택된 파일명 표시
- UploadCloud 아이콘 (lucide-react)

**app/page.jsx 참조 범위**:

- 311~325번째 줄: handleFiles 로직
- 327~330번째 줄: handleDrop 로직
- 391~415번째 줄: JSX 마크업

**주의사항**:

- 파일 검증 실패 시 toast 메시지는 부모 컴포넌트로 전달하지 마라. 이 컴포넌트는 유효한 파일만 onUpload로 전달한다.
- 유효하지 않은 파일은 조용히 무시한다. (검증 로직은 포함하되, 에러 메시지는 나중에 통합 시 처리)

### 2. components/upload/UploadPanel.css 생성

app/globals.css에서 upload 관련 스타일을 추출한다:

- `.upload-panel`
- `.upload-box`
- `.upload-title`
- `.upload-copy`
- `.upload-input`
- `.upload-resolution`
- `.selected-file`

**CSS 변수 사용**:

- globals.css에 정의된 CSS 변수(`--bg`, `--panel`, `--blue` 등)를 그대로 사용한다
- 변수는 복사하지 않는다 (globals.css에서 전역 관리)

### 3. UploadPanel.jsx에서 CSS import

```javascript
import "./UploadPanel.css";
```

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - components/upload/ 디렉토리가 생성되었는가?
   - UploadPanel.jsx가 props 기반으로 독립적으로 동작하는가?
   - UploadPanel.css에 도메인 스타일만 분리되었는가?
   - CSS 변수를 복사하지 않고 참조만 하는가?
3. 결과에 따라 `phases/refactor-architecture/index.json`의 해당 step을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "UploadPanel 컴포넌트 분리 완료"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- app/page.jsx를 수정하지 마라. 이 step에서는 components/upload/ 파일만 생성한다.
- 새로운 기능을 추가하지 마라. 기존 로직을 그대로 옮긴다.
- globals.css에서 upload와 무관한 스타일을 가져오지 마라.
- CSS 변수를 복사하지 마라. 참조만 한다.

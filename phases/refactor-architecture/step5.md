# Step 5: integration

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/CLAUDE.md`
- `/app/page.jsx` (현재 monolithic 구조)
- `/app/globals.css`
- 이전 step에서 생성한 모든 파일:
  - `/lib/mockData.js`
  - `/lib/services.js`
  - `/lib/utils.js`
  - `/components/upload/UploadPanel.jsx`
  - `/components/preview/PreviewPanel.jsx`
  - `/components/conversion/ConversionSteps.jsx`
  - `/components/result/ResultPanel.jsx`

이전 step에서 만들어진 모든 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

분리된 컴포넌트들을 app/page.jsx에 통합하고, 불필요한 코드를 제거한다.

### 1. app/page.jsx 리팩토링

**수정 사항**:

1. **Import 추가**:

   ```javascript
   import { convertToBraille } from "@/lib/services";
   import { downloadFile } from "@/lib/utils";
   import UploadPanel from "@/components/upload/UploadPanel";
   import PreviewPanel from "@/components/preview/PreviewPanel";
   import ConversionSteps from "@/components/conversion/ConversionSteps";
   import ResultPanel from "@/components/result/ResultPanel";
   ```

2. **Mock data 제거**:
   - mockProblem, mockFiles, mockProfile, stageCopy, stageOrder 삭제
   - 필요시 lib/mockData.js에서 import

3. **함수 제거**:
   - downloadFile (lib/utils.js 사용)
   - startMockWorkflow (lib/services.js의 convertToBraille 사용)
   - handleFiles, handleDrop 로직 간소화

4. **컴포넌트 제거**:
   - BrailleDots (남겨두거나, 필요시 별도 파일로 분리)
   - StepIcon (components/conversion/ConversionSteps.jsx로 이동됨)
   - MathPreview (components/preview/PreviewPanel.jsx로 이동됨)

5. **유지할 것**:
   - BrailleDots (로고에서 사용, 상단 헤더)
   - Modal (공유 UI 컴포넌트)
   - 상태 관리 (useState, useEffect)
   - Toast 로직
   - handleDownload, handleDownloadAll, showToast 함수

6. **JSX 수정**:
   - 기존 인라인 JSX를 분리된 컴포넌트로 교체:
     ```jsx
     <UploadPanel onUpload={handleUpload} fileName={fileName} />
     <PreviewPanel problem={recognizedProblem} status={status} />
     <ConversionSteps status={status} progress={progress} />
     <ResultPanel
       status={status}
       resultFiles={resultFiles}
       onDownload={handleDownload}
       onDownloadAll={handleDownloadAll}
     />
     ```

**핵심 규칙**:

- 상태 관리는 app/page.jsx에 유지한다 (useState)
- convertToBraille를 호출할 때 callbacks를 올바르게 전달한다
- 기존 기능이 동일하게 동작해야 한다 (업로드 → 인식 → 변환 → 다운로드)
- BrailleDots와 Modal은 app/page.jsx에 유지한다

### 2. app/globals.css 정리

도메인별 CSS가 분리되었으므로, globals.css에는 다음만 남긴다:

**유지할 스타일**:

- CSS 변수 정의 (`:root`)
- 페이지 배경 (`.app-shell`)
- 헤더 (`.topbar`, `.brand`, `.nav-actions`)
- 모달 (`.modal-backdrop`, `.modal`, `.modal-close`)
- Toast (`.toast`)
- BrailleDots (`.braille-dots`, `.braille-dots-small`)
- 전역 리셋 및 기본 스타일
- Workspace 그리드 (`.workspace`)

**제거할 스타일**:

- `.upload-panel`, `.upload-box` 등 (→ components/upload/UploadPanel.css)
- `.preview-panel`, `.math-paper` 등 (→ components/preview/PreviewPanel.css)
- `.stage-card`, `.steps` 등 (→ components/conversion/ConversionSteps.css)
- `.result-panel`, `.complete-card` 등 (→ components/result/ResultPanel.css)

**주의사항**:

- CSS 변수는 절대 제거하지 마라. 모든 컴포넌트 CSS에서 참조한다.
- 도메인 CSS로 이동한 스타일만 제거한다.
- 헤더, 모달, toast는 공유 UI이므로 globals.css에 유지한다.

### 3. 동작 검증

리팩토링 후 기존 기능이 동일하게 동작하는지 확인한다:

1. 파일 업로드 (drag & drop, 클릭)
2. 파일 유효성 검사 (PDF/JPG/PNG만 허용)
3. Mock 워크플로우 진행 (인식 → 변환 → 완료)
4. 미리보기에 문제 표시
5. 진행 상태 표시 (프로그레스 바, 아이콘 변경)
6. 파일 다운로드 (개별, 전체)
7. Toast 메시지
8. 모달 (사용 가이드, 내 정보)

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm run dev     # 로컬에서 정상 동작 확인
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - app/page.jsx가 오케스트레이션 역할만 하는가?
   - 모든 도메인 컴포넌트가 올바르게 import되었는가?
   - globals.css에서 도메인 스타일이 제거되었는가?
   - CSS 변수는 유지되었는가?
   - 기존 기능이 모두 동작하는가?
3. 결과에 따라 `phases/refactor-architecture/index.json`의 해당 step을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "app/page.jsx 통합 완료, Feature-based 아키텍처 적용됨"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 새로운 기능을 추가하지 마라. 기존 동작을 유지한다.
- CSS 변수를 삭제하지 마라.
- BrailleDots와 Modal을 별도 파일로 분리하지 마라. app/page.jsx에 유지한다.
- 상태 관리 로직을 변경하지 마라. useState 기반 유지한다.

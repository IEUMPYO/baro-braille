# Step 0: lib-layer

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- `/CLAUDE.md`
- `/app/page.jsx` (현재 monolithic 구조)

## 작업

현재 `app/page.jsx`에 하드코딩된 Mock data와 비즈니스 로직을 `lib/` 디렉토리로 분리한다.

### 1. lib/mockData.js 생성

다음 데이터를 export한다:

```javascript
export const mockProblem = {/* app/page.jsx에서 추출 */};
export const mockFiles = [/* ... */];
export const mockProfile = {/* ... */};
export const stageCopy = {/* ... */};
export const stageOrder = ["recognizing", "converting", "complete"];
```

**주의**:

- app/page.jsx의 17~77번째 줄에 정의된 데이터를 정확히 복사한다
- JSX 요소 (`<em>`, `<span>`)는 그대로 유지한다
- lucide-react 아이콘 import도 이 파일에 포함한다

### 2. lib/services.js 생성

Mock 워크플로우 로직을 함수로 추출한다:

```javascript
/**
 * 파일을 점자로 변환하는 Mock 서비스
 * @param {File} file - 업로드된 파일
 * @param {Object} callbacks - 진행 상태 콜백
 * @param {Function} callbacks.onProgress - 진행률 업데이트 (percent: number)
 * @param {Function} callbacks.onRecognized - 문제 인식 완료 (problem: object)
 * @param {Function} callbacks.onConverting - 점역 변환 시작
 * @param {Function} callbacks.onComplete - 변환 완료 (files: array)
 * @returns {Function} cleanup 함수 (타이머 정리용)
 */
export function convertToBraille(file, callbacks) {
  // app/page.jsx의 startMockWorkflow 로직을 여기로 이동
  // 타이머 배열을 반환해서 cleanup 가능하게
}
```

**핵심 규칙**:

- app/page.jsx의 283~309번째 줄 로직을 함수로 추출한다
- 상태 변경은 callbacks로 위임한다 (React 상태는 page.jsx에서 관리)
- cleanup 함수를 반환해서 컴포넌트 unmount 시 타이머를 정리할 수 있게 한다

### 3. lib/utils.js 생성

파일 다운로드 유틸 함수를 추출한다:

```javascript
/**
 * 파일을 다운로드한다
 * @param {Object} file - 다운로드할 파일 객체
 * @param {string} file.fileName - 파일명
 * @param {string} file.content - 파일 내용
 * @param {string} file.mime - MIME 타입
 */
export function downloadFile(file) {
  // app/page.jsx의 223~233번째 줄 로직
}
```

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - lib/ 디렉토리가 생성되었는가?
   - mockData.js에서 모든 Mock 데이터를 export하는가?
   - services.js의 convertToBraille 함수가 callbacks 패턴으로 구현되었는가?
   - utils.js의 downloadFile 함수가 독립적으로 동작하는가?
3. 결과에 따라 `phases/refactor-architecture/index.json`의 해당 step을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "lib/ 디렉토리 생성: mockData.js, services.js, utils.js"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- app/page.jsx를 수정하지 마라. 이 step에서는 lib/ 파일만 생성한다.
- Mock data의 내용을 변경하지 마라. 있는 그대로 복사한다.
- 새로운 기능을 추가하지 마라. 기존 로직을 그대로 옮긴다.
